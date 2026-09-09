import {
  DataPlatformQueueShutdownError,
  DataPlatformQueueTimeoutError,
} from './data-platform-queue.errors';
import { Logger } from '@nestjs/common';
import { DataPlatformQueue } from './data-platform-queue.service';

const createQueue = (overrides: Record<string, unknown> = {}) =>
  new DataPlatformQueue({
    name: 'test-platform',
    platform: 'test-platform',
    timeoutMs: 1_000,
    ...overrides,
  });

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
};

describe('DataPlatformQueue', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('runs interactive work before background work while retaining FIFO ordering', async () => {
    const queue = createQueue();
    const first = deferred<void>();
    const order: string[] = [];

    const firstResult = queue.enqueue({
      fingerprint: 'first',
      category: 'scheduler',
      priority: 'background',
      execute: async () => {
        order.push('first');
        await first.promise;
        return 'first';
      },
    });
    const backgroundResult = queue.enqueue({
      fingerprint: 'background',
      category: 'scheduler',
      priority: 'background',
      execute: async () => {
        order.push('background');
        return 'background';
      },
    });
    const interactiveResult = queue.enqueue({
      fingerprint: 'interactive',
      category: 'wizard',
      priority: 'interactive',
      execute: async () => {
        order.push('interactive');
        return 'interactive';
      },
    });

    await Promise.resolve();
    first.resolve();
    await expect(
      Promise.all([firstResult, backgroundResult, interactiveResult]),
    ).resolves.toEqual(['first', 'background', 'interactive']);
    expect(order).toEqual(['first', 'interactive', 'background']);
  });

  it('logs queue volume when work is added and completed successfully', async () => {
    const log = jest.spyOn(Logger.prototype, 'log');
    const queue = createQueue();

    await expect(
      queue.enqueue({
        fingerprint: 'logged-job',
        category: 'scheduler',
        priority: 'background',
        execute: async () => 'done',
      }),
    ).resolves.toBe('done');

    const addedLog = log.mock.calls.find(([message]) =>
      message.startsWith('queue job added |'),
    );
    const startedLog = log.mock.calls.find(([message]) =>
      message.startsWith('queue job started |'),
    );
    const completedLog = log.mock.calls.find(([message]) =>
      message.startsWith('queue job completed |'),
    );

    expect(addedLog?.[0]).toBe(
      'queue job added | platform="test-platform" category="scheduler" enqueueResult="queued" queued=1 running=0 total=1 concurrency=1 fingerprint="logged-job"',
    );
    expect(startedLog?.[0]).toMatch(
      /^queue job started \| platform="test-platform" category="scheduler" waitTimeMs=\d+ queued=0 running=1 total=1 concurrency=1 fingerprint="logged-job"$/,
    );
    expect(completedLog?.[0]).toMatch(
      /^queue job completed \| platform="test-platform" result="success" executionTimeMs=\d+ queued=0 running=0 total=0 concurrency=1 fingerprint="logged-job"$/,
    );
  });

  it('logs failed work with its execution time and remaining queue volume', async () => {
    const errorLog = jest.spyOn(Logger.prototype, 'error');
    const queue = createQueue();
    const error = new Error('upstream failed');

    await expect(
      queue.enqueue({
        fingerprint: 'failing-logged-job',
        category: 'wizard',
        execute: async () => Promise.reject(error),
      }),
    ).rejects.toBe(error);

    expect(errorLog).toHaveBeenCalledWith(
      expect.stringMatching(
        /^queue job completed \| platform="test-platform" result="failure" executionTimeMs=\d+ queued=0 running=0 total=0 concurrency=1 fingerprint="failing-logged-job"$/,
      ),
      error.stack,
    );
  });

  it('shares the queued operation and result for a matching fingerprint', async () => {
    const queue = createQueue();
    const work = deferred<string>();
    const execute = jest.fn(async () => work.promise);

    const first = queue.enqueue({
      fingerprint: 'same-effective-request',
      category: 'on-demand',
      execute,
    });
    const second = queue.enqueue({
      fingerprint: 'same-effective-request',
      category: 'on-demand',
      priority: 'background',
      execute,
    });

    await Promise.resolve();
    expect(execute).toHaveBeenCalledTimes(1);
    work.resolve('shared result');
    await expect(first).resolves.toBe('shared result');
    await expect(second).resolves.toBe('shared result');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('promotes a matching queued background job for an interactive caller', async () => {
    const queue = createQueue();
    const blocker = deferred<void>();
    const order: string[] = [];
    const blockingResult = queue.enqueue({
      fingerprint: 'blocking-job',
      category: 'scheduler',
      priority: 'background',
      execute: async () => {
        order.push('blocking');
        await blocker.promise;
        return 'blocking';
      },
    });
    const matchingBackground = queue.enqueue({
      fingerprint: 'matching-job',
      category: 'scheduler',
      priority: 'background',
      execute: async () => {
        order.push('matching');
        return 'matching';
      },
    });
    const otherBackground = queue.enqueue({
      fingerprint: 'other-background-job',
      category: 'scheduler',
      priority: 'background',
      execute: async () => {
        order.push('other-background');
        return 'other-background';
      },
    });
    const matchingInteractive = queue.enqueue({
      fingerprint: 'matching-job',
      category: 'dashboard-data',
      priority: 'interactive',
      execute: async () => 'not-run',
    });

    blocker.resolve();
    await expect(
      Promise.all([
        blockingResult,
        matchingBackground,
        matchingInteractive,
        otherBackground,
      ]),
    ).resolves.toEqual([
      'blocking',
      'matching',
      'matching',
      'other-background',
    ]);
    expect(order).toEqual(['blocking', 'matching', 'other-background']);
  });

  it('does not deduplicate different request fingerprints', async () => {
    const queue = createQueue({ concurrency: 2 });
    const execute = jest.fn(async () => 'result');

    await expect(
      Promise.all([
        queue.enqueue({ fingerprint: 'range-a', category: 'range', execute }),
        queue.enqueue({ fingerprint: 'range-b', category: 'range', execute }),
      ]),
    ).resolves.toEqual(['result', 'result']);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('creates stable fingerprints from the full effective request', () => {
    const queue = createQueue();
    const first = queue.createFingerprint({
      platform: 'test-platform',
      operation: 'query-data',
      target: { tenant: 'alpha', url: 'https://example.test' },
      queryConfig: { queryId: 'query-1', attributes: ['temperature', 'speed'] },
      runtimeParameters: {
        endDate: '2026-09-03',
        filters: { type: 'Sensor' },
        startDate: '2026-09-01',
      },
    });
    const equivalent = queue.createFingerprint({
      platform: 'test-platform',
      operation: 'query-data',
      target: { url: 'https://example.test', tenant: 'alpha' },
      queryConfig: { attributes: ['temperature', 'speed'], queryId: 'query-1' },
      runtimeParameters: {
        startDate: '2026-09-01',
        filters: { type: 'Sensor' },
        endDate: '2026-09-03',
      },
    });
    const differentRange = queue.createFingerprint({
      platform: 'test-platform',
      operation: 'query-data',
      target: { tenant: 'alpha', url: 'https://example.test' },
      queryConfig: { queryId: 'query-1', attributes: ['temperature', 'speed'] },
      runtimeParameters: {
        startDate: '2026-09-02',
        endDate: '2026-09-03',
        filters: { type: 'Sensor' },
      },
    });

    expect(first).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(equivalent).toBe(first);
    expect(differentRange).not.toBe(first);
  });

  it('sorts only explicitly unordered collections and rejects a mismatched platform fingerprint', () => {
    const queue = createQueue();
    const baseInput = {
      platform: 'test-platform',
      operation: 'query-data',
      target: 'target',
      queryConfig: { queryId: 'query-1' },
    };
    const attributesFirst = queue.createFingerprint({
      ...baseInput,
      runtimeParameters: { attributes: ['temperature', 'speed'] },
    });
    const attributesSecond = queue.createFingerprint({
      ...baseInput,
      runtimeParameters: { attributes: ['speed', 'temperature'] },
    });
    const unorderedAttributesFirst = queue.createFingerprint({
      ...baseInput,
      runtimeParameters: { attributes: ['temperature', 'speed'] },
      unorderedCollectionPaths: ['runtimeParameters.attributes'],
    });
    const unorderedAttributesSecond = queue.createFingerprint({
      ...baseInput,
      runtimeParameters: { attributes: ['speed', 'temperature'] },
      unorderedCollectionPaths: ['runtimeParameters.attributes'],
    });

    expect(attributesSecond).not.toBe(attributesFirst);
    expect(unorderedAttributesSecond).toBe(unorderedAttributesFirst);
    expect(() =>
      queue.createFingerprint({
        ...baseInput,
        platform: 'wrong-platform',
        runtimeParameters: {},
      }),
    ).toThrow('does not match queue platform');
  });

  it.each([
    [
      'date range',
      { startDate: '2026-09-01', endDate: '2026-09-02' },
      { startDate: '2026-09-02', endDate: '2026-09-02' },
    ],
    ['entity', { entityIds: ['entity-a'] }, { entityIds: ['entity-b'] }],
    [
      'attribute',
      { attributes: ['temperature'] },
      { attributes: ['humidity'] },
    ],
    ['aggregation mode', { aggrMode: 'avg' }, { aggrMode: 'sum' }],
    ['aggregation period', { aggrPeriod: 'hour' }, { aggrPeriod: 'day' }],
    [
      'filter',
      { filters: { type: 'Sensor' } },
      { filters: { type: 'WeatherStation' } },
    ],
  ])(
    'creates a distinct fingerprint when the effective %s changes',
    (_parameter, firstRuntimeParameters, secondRuntimeParameters) => {
      const queue = createQueue();
      const input = {
        platform: 'test-platform',
        operation: 'query-data',
        target: { dataSourceId: 'source-1' },
        queryConfig: { queryId: 'query-1' },
      };

      expect(
        queue.createFingerprint({
          ...input,
          runtimeParameters: firstRuntimeParameters,
        }),
      ).not.toBe(
        queue.createFingerprint({
          ...input,
          runtimeParameters: secondRuntimeParameters,
        }),
      );
    },
  );

  it('never starts more jobs than its configured concurrency', async () => {
    const queue = createQueue({ concurrency: 2 });
    const first = deferred<void>();
    const second = deferred<void>();
    const started: string[] = [];
    const enqueue = (fingerprint: string, waitFor?: Promise<void>) =>
      queue.enqueue({
        fingerprint,
        category: 'scheduler',
        execute: async () => {
          started.push(fingerprint);
          await waitFor;
          return fingerprint;
        },
      });

    const firstResult = enqueue('first', first.promise);
    const secondResult = enqueue('second', second.promise);
    const thirdResult = enqueue('third');
    await Promise.resolve();
    expect(started).toEqual(['first', 'second']);
    expect(queue.getStats()).toMatchObject({ running: 2, queued: 1 });

    first.resolve();
    await expect(firstResult).resolves.toBe('first');
    await expect(thirdResult).resolves.toBe('third');
    second.resolve();
    await expect(secondResult).resolves.toBe('second');
  });

  it('shares executor failures with callers of the same fingerprint', async () => {
    const queue = createQueue();
    const error = new Error('upstream failed');
    const execute = jest.fn(async () => Promise.reject(error));
    const first = queue.enqueue({
      fingerprint: 'same-failing-request',
      category: 'on-demand',
      execute,
    });
    const second = queue.enqueue({
      fingerprint: 'same-failing-request',
      category: 'on-demand',
      execute,
    });

    await expect(first).rejects.toBe(error);
    await expect(second).rejects.toBe(error);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('aborts and rejects a timed-out job without releasing its worker slot early', async () => {
    const errorLog = jest.spyOn(Logger.prototype, 'error');
    const queue = createQueue({ timeoutMs: 10 });
    const firstSettled = deferred<void>();
    const secondExecute = jest.fn(async () => 'second');
    let receivedSignal: AbortSignal | undefined;

    const timedOut = queue.enqueue({
      fingerprint: 'slow',
      category: 'scheduler',
      execute: async (signal) => {
        receivedSignal = signal;
        await firstSettled.promise;
        return 'too late';
      },
    });
    const second = queue.enqueue({
      fingerprint: 'next',
      category: 'scheduler',
      execute: secondExecute,
    });

    await expect(timedOut).rejects.toBeInstanceOf(
      DataPlatformQueueTimeoutError,
    );
    expect(receivedSignal?.aborted).toBe(true);
    expect(secondExecute).not.toHaveBeenCalled();
    expect(queue.getStats()).toMatchObject({ running: 1, queued: 1 });
    expect(errorLog).toHaveBeenCalledWith(
      expect.stringMatching(
        /^queue job timed out \| platform="test-platform" result="timeout" executionTimeMs=\d+ queued=1 running=1 total=2 concurrency=1 fingerprint="slow"$/,
      ),
      expect.stringContaining('DataPlatformQueueTimeoutError'),
    );

    firstSettled.resolve();
    await expect(second).resolves.toBe('second');
    expect(secondExecute).toHaveBeenCalledTimes(1);
  });

  it('rejects queued work and aborts active work after the shutdown grace period', async () => {
    const queue = createQueue({ shutdownGracePeriodMs: 10 });
    const activeSettled = deferred<void>();
    let activeSignal: AbortSignal | undefined;
    const active = queue.enqueue({
      fingerprint: 'active',
      category: 'scheduler',
      execute: async (signal) => {
        activeSignal = signal;
        await activeSettled.promise;
        return 'active';
      },
    });
    const queued = queue.enqueue({
      fingerprint: 'queued',
      category: 'scheduler',
      execute: async () => 'queued',
    });

    await Promise.resolve();
    const shutdown = queue.shutdown();
    await expect(queued).rejects.toBeInstanceOf(DataPlatformQueueShutdownError);
    await expect(active).rejects.toBeInstanceOf(DataPlatformQueueShutdownError);
    await shutdown;
    expect(activeSignal?.aborted).toBe(true);
    await expect(
      queue.enqueue({
        fingerprint: 'after-shutdown',
        category: 'scheduler',
        execute: async () => 'nope',
      }),
    ).rejects.toBeInstanceOf(DataPlatformQueueShutdownError);

    activeSettled.resolve();
    await new Promise((resolve) => setImmediate(resolve));
  });
});
