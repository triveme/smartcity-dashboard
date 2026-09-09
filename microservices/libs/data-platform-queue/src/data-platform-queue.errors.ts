export class DataPlatformQueueTimeoutError extends Error {
  constructor(
    readonly queueName: string,
    readonly fingerprint: string,
    readonly timeoutMs: number,
  ) {
    super(
      `Queue "${queueName}" timed out request "${fingerprint}" after ${timeoutMs}ms`,
    );
    this.name = DataPlatformQueueTimeoutError.name;
  }
}

export class DataPlatformQueueShutdownError extends Error {
  constructor(readonly queueName: string) {
    super(`Queue "${queueName}" is shutting down and is not accepting work`);
    this.name = DataPlatformQueueShutdownError.name;
  }
}
