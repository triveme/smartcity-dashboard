export type DataPlatformQueuePriority = 'interactive' | 'background';

export interface DataPlatformQueueOptions {
  /** A human-readable, platform-specific queue name. */
  name: string;
  /** Value included in all queue log records. */
  platform: string;
  /** Maximum number of executor functions allowed to run at once. */
  concurrency?: number;
  /** Maximum executor run time before its AbortSignal is aborted. */
  timeoutMs?: number;
  /** Time to wait for active work before aborting it on application shutdown. */
  shutdownGracePeriodMs?: number;
  /** Queue-depth alerting thresholds. They never reject work. */
  queueDepthThresholds?: Partial<DataPlatformQueueDepthThresholds>;
  /** Minimum interval between depth-alert reminders while a threshold remains exceeded. */
  depthReminderIntervalMs?: number;
}

export interface DataPlatformQueueDepthThresholds {
  warning: number;
  critical: number;
}

export interface DataPlatformQueueEnqueueOptions<T> {
  /** Canonical fingerprint of the complete effective upstream request. */
  fingerprint: string;
  /** Interactive work runs before background work; FIFO is preserved within each priority. */
  priority?: DataPlatformQueuePriority;
  /** Included in structured log context, for example `scheduler` or `wizard`. */
  category: string;
  /** Must honour the signal to allow timeout and shutdown cancellation. */
  execute: (signal: AbortSignal) => Promise<T>;
}

export interface DataPlatformQueueFingerprintInput {
  /** Owning platform/service. It must match the queue's configured platform. */
  platform: string;
  /** Upstream operation, such as `query-data`, `range`, or `wizard-sensors`. */
  operation: string;
  /** Effective data-source/target identity. */
  target: unknown;
  /** Effective query configuration, excluding values that cannot alter the response. */
  queryConfig: unknown;
  /** Date ranges, filters, attributes, aggregation, and other request-time values. */
  runtimeParameters: unknown;
  /**
   * Dot-separated paths to arrays whose ordering cannot affect the upstream
   * response, for example `runtimeParameters.entityIds`.
   */
  unorderedCollectionPaths?: readonly string[];
}

export interface DataPlatformQueueStats {
  name: string;
  platform: string;
  queued: number;
  running: number;
  acceptingWork: boolean;
}
