import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  DataPlatformQueueEnqueueOptions,
  DataPlatformQueueFingerprintInput,
  DataPlatformQueueOptions,
  DataPlatformQueuePriority,
  DataPlatformQueueStats,
} from './data-platform-queue.types';
import { createCanonicalFingerprint } from './data-platform-queue.fingerprint';
import {
  DataPlatformQueueShutdownError,
  DataPlatformQueueTimeoutError,
} from './data-platform-queue.errors';

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_SHUTDOWN_GRACE_PERIOD_MS = 30_000;
const DEFAULT_WARNING_QUEUE_DEPTH = 100;
const DEFAULT_CRITICAL_QUEUE_DEPTH = 1_000;
const DEFAULT_DEPTH_REMINDER_INTERVAL_MS = 60_000;

type JobState = 'queued' | 'running';
type JobResult = 'success' | 'failure' | 'timeout' | 'shutdown';
type QueueLogFields = Record<string, string | number | undefined>;

interface QueueJob<T> {
  readonly fingerprint: string;
  priority: DataPlatformQueuePriority;
  readonly category: string;
  readonly execute: (signal: AbortSignal) => Promise<T>;
  readonly queuedAt: number;
  readonly controller: AbortController;
  readonly result: Promise<T>;
  readonly resolveResult: (value: T) => void;
  readonly rejectResult: (reason: unknown) => void;
  state: JobState;
  resultSettled: boolean;
  timedOut: boolean;
  shutdownAborted: boolean;
  startedAt?: number;
  timeout?: NodeJS.Timeout;
  completion?: Promise<void>;
}

interface DepthThresholdState {
  exceeded: boolean;
}

@Injectable()
export class DataPlatformQueue implements OnModuleDestroy {
  private readonly logger: Logger;
  private readonly concurrency: number;
  private readonly timeoutMs: number;
  private readonly shutdownGracePeriodMs: number;
  private readonly warningQueueDepth: number;
  private readonly criticalQueueDepth: number;
  private readonly depthReminderIntervalMs: number;
  private readonly queuedJobs: Record<
    DataPlatformQueuePriority,
    QueueJob<unknown>[]
  > = {
    interactive: [],
    background: [],
  };
  private readonly jobsByFingerprint = new Map<string, QueueJob<unknown>>();
  private readonly runningJobs = new Set<QueueJob<unknown>>();
  private readonly depthThresholdStates: Record<
    'warning' | 'critical',
    DepthThresholdState
  > = {
    warning: { exceeded: false },
    critical: { exceeded: false },
  };
  private depthReminderTimer?: NodeJS.Timeout;
  private acceptingWork = true;
  private shutdownPromise?: Promise<void>;

  constructor(private readonly options: DataPlatformQueueOptions) {
    this.validateOptions(options);
    this.logger = new Logger(`DataPlatformQueue:${options.name}`);
    this.concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.shutdownGracePeriodMs =
      options.shutdownGracePeriodMs ?? DEFAULT_SHUTDOWN_GRACE_PERIOD_MS;
    this.warningQueueDepth =
      options.queueDepthThresholds?.warning ?? DEFAULT_WARNING_QUEUE_DEPTH;
    this.criticalQueueDepth =
      options.queueDepthThresholds?.critical ?? DEFAULT_CRITICAL_QUEUE_DEPTH;
    this.depthReminderIntervalMs =
      options.depthReminderIntervalMs ?? DEFAULT_DEPTH_REMINDER_INTERVAL_MS;
    if (this.criticalQueueDepth < this.warningQueueDepth) {
      throw new Error('Critical queue-depth threshold cannot be below warning');
    }
  }

  enqueue<T>(options: DataPlatformQueueEnqueueOptions<T>): Promise<T> {
    if (!this.acceptingWork) {
      return Promise.reject(
        new DataPlatformQueueShutdownError(this.options.name),
      );
    }
    this.validateEnqueueOptions(options);

    const existingJob = this.jobsByFingerprint.get(options.fingerprint) as
      | QueueJob<T>
      | undefined;
    if (existingJob) {
      this.promoteQueuedJob(existingJob, options.priority);
      this.logJobAdded(existingJob, 'deduplicated');
      return existingJob.result;
    }

    let resolveResult!: (value: T) => void;
    let rejectResult!: (reason: unknown) => void;
    const result = new Promise<T>((resolve, reject) => {
      resolveResult = resolve;
      rejectResult = reject;
    });
    const job: QueueJob<T> = {
      fingerprint: options.fingerprint,
      priority: options.priority ?? 'interactive',
      category: options.category,
      execute: options.execute,
      queuedAt: Date.now(),
      controller: new AbortController(),
      result,
      resolveResult,
      rejectResult,
      state: 'queued',
      resultSettled: false,
      timedOut: false,
      shutdownAborted: false,
    };

    this.jobsByFingerprint.set(job.fingerprint, job as QueueJob<unknown>);
    this.queuedJobs[job.priority].push(job as QueueJob<unknown>);
    this.logJobAdded(job, 'queued');
    this.logQueueDepth();
    this.drain();
    return result;
  }

  createFingerprint(input: DataPlatformQueueFingerprintInput): string {
    if (input.platform !== this.options.platform) {
      throw new Error(
        `Fingerprint platform "${input.platform}" does not match queue platform "${this.options.platform}"`,
      );
    }
    return createCanonicalFingerprint(input);
  }

  getStats(): DataPlatformQueueStats {
    return {
      name: this.options.name,
      platform: this.options.platform,
      queued: this.getQueuedDepth(),
      running: this.runningJobs.size,
      acceptingWork: this.acceptingWork,
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  shutdown(): Promise<void> {
    if (this.shutdownPromise) {
      return this.shutdownPromise;
    }
    this.shutdownPromise = this.shutdownInternal();
    return this.shutdownPromise;
  }

  private async shutdownInternal(): Promise<void> {
    this.acceptingWork = false;
    this.logger.log(this.formatQueueLog('queue stopped accepting work'));

    const queuedJobs = [
      ...this.queuedJobs.interactive,
      ...this.queuedJobs.background,
    ];
    this.queuedJobs.interactive.length = 0;
    this.queuedJobs.background.length = 0;
    for (const job of queuedJobs) {
      this.rejectResult(
        job,
        new DataPlatformQueueShutdownError(this.options.name),
      );
      this.jobsByFingerprint.delete(job.fingerprint);
    }
    this.logQueueDepth();
    this.stopDepthReminderTimer();

    const activeCompletions = [...this.runningJobs]
      .map((job) => job.completion)
      .filter((completion): completion is Promise<void> => Boolean(completion));
    const allActiveFinished = Promise.allSettled(activeCompletions).then(
      () => undefined,
    );
    let graceTimeout: NodeJS.Timeout | undefined;
    const gracePeriodElapsed = new Promise<void>((resolve) => {
      graceTimeout = setTimeout(resolve, this.shutdownGracePeriodMs);
    });

    const completedDuringGracePeriod = await Promise.race([
      allActiveFinished.then(() => true),
      gracePeriodElapsed.then(() => false),
    ]);
    if (graceTimeout) {
      clearTimeout(graceTimeout);
    }
    if (completedDuringGracePeriod) {
      this.logger.log(
        this.formatQueueLog('queue shutdown completed during grace period'),
      );
      return;
    }

    for (const job of this.runningJobs) {
      job.shutdownAborted = true;
      if (job.timeout) {
        clearTimeout(job.timeout);
        job.timeout = undefined;
      }
      job.controller.abort();
      this.rejectResult(
        job,
        new DataPlatformQueueShutdownError(this.options.name),
      );
      this.logger.warn(
        this.formatQueueLog('queue job aborted after shutdown grace period', {
          fingerprint: job.fingerprint,
          result: 'shutdown',
          ...this.getQueueVolumeFields(),
        }),
      );
    }
  }

  private drain(): void {
    while (this.acceptingWork && this.runningJobs.size < this.concurrency) {
      const job = this.nextJob();
      if (!job) {
        return;
      }
      this.start(job);
    }
  }

  private nextJob(): QueueJob<unknown> | undefined {
    return (
      this.queuedJobs.interactive.shift() ?? this.queuedJobs.background.shift()
    );
  }

  private promoteQueuedJob(
    job: QueueJob<unknown>,
    requestedPriority: DataPlatformQueuePriority | undefined,
  ): void {
    if (
      requestedPriority !== 'interactive' ||
      job.priority === 'interactive' ||
      job.state !== 'queued'
    ) {
      return;
    }
    const backgroundIndex = this.queuedJobs.background.indexOf(job);
    if (backgroundIndex === -1) {
      return;
    }
    this.queuedJobs.background.splice(backgroundIndex, 1);
    job.priority = 'interactive';
    this.queuedJobs.interactive.push(job);
  }

  private start(job: QueueJob<unknown>): void {
    job.state = 'running';
    job.startedAt = Date.now();
    this.runningJobs.add(job);
    this.logQueueDepth();
    this.logJobStarted(job);

    job.timeout = setTimeout(() => {
      job.timedOut = true;
      job.controller.abort();
      const timeoutError = new DataPlatformQueueTimeoutError(
        this.options.name,
        job.fingerprint,
        this.timeoutMs,
      );
      this.logJobTimedOut(job, timeoutError);
      this.rejectResult(job, timeoutError);
    }, this.timeoutMs);

    let executionError: unknown;
    job.completion = Promise.resolve()
      .then(() => job.execute(job.controller.signal))
      .then(
        (value) => {
          if (job.timedOut || job.shutdownAborted) {
            return;
          }
          this.resolveResult(job, value);
        },
        (error: unknown) => {
          executionError = error;
          if (!job.resultSettled) {
            this.rejectResult(job, error);
          }
        },
      )
      .finally(() => {
        if (job.timeout) {
          clearTimeout(job.timeout);
          job.timeout = undefined;
        }
        this.runningJobs.delete(job);
        this.jobsByFingerprint.delete(job.fingerprint);
        this.drain();
        this.logJobCompleted(
          job,
          this.getJobResult(job, executionError),
          executionError,
        );
      });
  }

  private resolveResult<T>(job: QueueJob<T>, value: T): void {
    if (job.resultSettled) {
      return;
    }
    job.resultSettled = true;
    job.resolveResult(value);
  }

  private rejectResult(job: QueueJob<unknown>, reason: unknown): void {
    if (job.resultSettled) {
      return;
    }
    job.resultSettled = true;
    job.rejectResult(reason);
  }

  private getQueuedDepth(): number {
    return (
      this.queuedJobs.interactive.length + this.queuedJobs.background.length
    );
  }

  private logJobAdded(
    job: QueueJob<unknown>,
    enqueueResult: 'queued' | 'deduplicated',
  ): void {
    this.logger.log(
      this.formatQueueLog('queue job added', {
        fingerprint: job.fingerprint,
        category: job.category,
        enqueueResult,
        ...this.getQueueVolumeFields(),
      }),
    );
  }

  private logJobCompleted(
    job: QueueJob<unknown>,
    result: JobResult,
    error: unknown,
  ): void {
    const message = this.formatQueueLog('queue job completed', {
      fingerprint: job.fingerprint,
      result,
      executionTimeMs: job.startedAt ? Date.now() - job.startedAt : 0,
      ...this.getQueueVolumeFields(),
    });
    if (result === 'success') {
      this.logger.log(message);
      return;
    }
    this.logger.error(message, this.errorStack(error));
  }

  private logJobTimedOut(
    job: QueueJob<unknown>,
    error: DataPlatformQueueTimeoutError,
  ): void {
    this.logger.error(
      this.formatQueueLog('queue job timed out', {
        fingerprint: job.fingerprint,
        result: 'timeout',
        executionTimeMs: job.startedAt ? Date.now() - job.startedAt : 0,
        ...this.getQueueVolumeFields(),
      }),
      error.stack,
    );
  }

  private logJobStarted(job: QueueJob<unknown>): void {
    this.logger.log(
      this.formatQueueLog('queue job started', {
        fingerprint: job.fingerprint,
        category: job.category,
        waitTimeMs: job.startedAt ? job.startedAt - job.queuedAt : 0,
        ...this.getQueueVolumeFields(),
      }),
    );
  }

  private getJobResult(
    job: QueueJob<unknown>,
    executionError: unknown,
  ): JobResult {
    if (job.shutdownAborted) {
      return 'shutdown';
    }
    if (job.timedOut) {
      return 'timeout';
    }
    return executionError === undefined ? 'success' : 'failure';
  }

  private getQueueVolume(): Record<
    'queued' | 'running' | 'total' | 'concurrency',
    number
  > {
    const queued = this.getQueuedDepth();
    const running = this.runningJobs.size;
    return {
      queued,
      running,
      total: queued + running,
      concurrency: this.concurrency,
    };
  }

  private getQueueVolumeFields(): QueueLogFields {
    const { queued, running, total, concurrency } = this.getQueueVolume();
    return { queued, running, total, concurrency };
  }

  private logQueueDepth(): void {
    const depth = this.getQueuedDepth();
    this.checkDepthThreshold('warning', this.warningQueueDepth, depth);
    this.checkDepthThreshold('critical', this.criticalQueueDepth, depth);
  }

  private checkDepthThreshold(
    level: 'warning' | 'critical',
    threshold: number,
    depth: number,
  ): void {
    const state = this.depthThresholdStates[level];
    const isExceeded = depth >= threshold;
    const fields = { queued: depth, threshold };
    if (isExceeded && !state.exceeded) {
      state.exceeded = true;
      this.logDepthThreshold(level, 'queue depth threshold crossed', fields);
      this.ensureDepthReminderTimer();
      return;
    }
    if (!isExceeded && state.exceeded) {
      state.exceeded = false;
      this.logger.log(
        this.formatQueueLog('queue depth threshold recovered', fields),
      );
      this.stopDepthReminderTimerIfUnused();
      return;
    }
  }

  private ensureDepthReminderTimer(): void {
    if (this.depthReminderTimer) {
      return;
    }
    this.depthReminderTimer = setInterval(() => {
      const depth = this.getQueuedDepth();
      for (const level of ['warning', 'critical'] as const) {
        const state = this.depthThresholdStates[level];
        if (!state.exceeded) {
          continue;
        }
        const threshold =
          level === 'warning'
            ? this.warningQueueDepth
            : this.criticalQueueDepth;
        this.logDepthThreshold(level, 'queue depth threshold reminder', {
          queued: depth,
          threshold,
        });
      }
    }, this.depthReminderIntervalMs);
    this.depthReminderTimer.unref();
  }

  private stopDepthReminderTimerIfUnused(): void {
    if (
      this.depthThresholdStates.warning.exceeded ||
      this.depthThresholdStates.critical.exceeded
    ) {
      return;
    }
    this.stopDepthReminderTimer();
  }

  private stopDepthReminderTimer(): void {
    if (!this.depthReminderTimer) {
      return;
    }
    clearInterval(this.depthReminderTimer);
    this.depthReminderTimer = undefined;
  }

  private logDepthThreshold(
    level: 'warning' | 'critical',
    message: string,
    fields: QueueLogFields,
  ): void {
    if (level === 'critical') {
      this.logger.error(this.formatQueueLog(message, fields));
      return;
    }
    this.logger.warn(this.formatQueueLog(message, fields));
  }

  private formatQueueLog(message: string, fields: QueueLogFields = {}): string {
    const { fingerprint, ...otherFields } = fields;
    const values = {
      platform: this.options.platform,
      ...otherFields,
      fingerprint,
    };
    const serializedFields = Object.entries(values)
      .filter(([, value]) => value !== undefined)
      .map(
        ([key, value]) =>
          `${key}=${typeof value === 'string' ? JSON.stringify(value) : value}`,
      )
      .join(' ');
    return `${message} | ${serializedFields}`;
  }

  private errorStack(error: unknown): string | undefined {
    return error instanceof Error ? error.stack : undefined;
  }

  private validateOptions(options: DataPlatformQueueOptions): void {
    if (!options.name || !options.platform) {
      throw new Error('Queue name and platform are required');
    }
    if (
      options.concurrency !== undefined &&
      (!Number.isInteger(options.concurrency) || options.concurrency < 1)
    ) {
      throw new Error('Queue concurrency must be at least one');
    }
    if (
      options.timeoutMs !== undefined &&
      (!Number.isFinite(options.timeoutMs) || options.timeoutMs < 1)
    ) {
      throw new Error('Queue timeout must be at least one millisecond');
    }
    if (
      options.shutdownGracePeriodMs !== undefined &&
      (!Number.isFinite(options.shutdownGracePeriodMs) ||
        options.shutdownGracePeriodMs < 0)
    ) {
      throw new Error('Queue shutdown grace period cannot be negative');
    }
    const warning = options.queueDepthThresholds?.warning;
    const critical = options.queueDepthThresholds?.critical;
    if (warning !== undefined && (!Number.isInteger(warning) || warning < 1)) {
      throw new Error('Warning queue-depth threshold must be at least one');
    }
    if (
      critical !== undefined &&
      (!Number.isInteger(critical) || critical < 1)
    ) {
      throw new Error('Critical queue-depth threshold must be at least one');
    }
    if (warning !== undefined && critical !== undefined && critical < warning) {
      throw new Error('Critical queue-depth threshold cannot be below warning');
    }
    if (
      options.depthReminderIntervalMs !== undefined &&
      (!Number.isFinite(options.depthReminderIntervalMs) ||
        options.depthReminderIntervalMs < 1)
    ) {
      throw new Error(
        'Queue-depth reminder interval must be at least one millisecond',
      );
    }
  }

  private validateEnqueueOptions<T>(
    options: DataPlatformQueueEnqueueOptions<T>,
  ): void {
    if (!options.fingerprint || !options.category || !options.execute) {
      throw new Error('Queue fingerprint, category, and executor are required');
    }
  }
}
