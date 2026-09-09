import { createHash } from 'crypto';
import { DataPlatformQueueFingerprintInput } from './data-platform-queue.types';

/**
 * Produces a deterministic representation. Array ordering is preserved unless
 * its dot-separated path is explicitly identified as order-insensitive.
 */
export const createCanonicalFingerprint = (
  input: DataPlatformQueueFingerprintInput,
): string => {
  validateFingerprintInput(input);
  const canonicalInput = stableSerialize(
    {
      platform: input.platform,
      operation: input.operation,
      target: input.target,
      queryConfig: input.queryConfig,
      runtimeParameters: input.runtimeParameters,
    },
    new WeakSet<object>(),
    '',
    new Set(input.unorderedCollectionPaths),
  );
  return `sha256:${createHash('sha256').update(canonicalInput).digest('hex')}`;
};

/**
 * Creates a non-reversible identifier for a credential or delegated token.
 * Only the digest is suitable for inclusion in a queue fingerprint or log.
 */
export const createCredentialFingerprint = (credential: string): string =>
  `sha256:${createHash('sha256').update(credential).digest('hex')}`;

const stableSerialize = (
  value: unknown,
  ancestors: WeakSet<object>,
  path: string,
  unorderedCollectionPaths: ReadonlySet<string>,
): string => {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return `string:${JSON.stringify(value)}`;
  }
  if (typeof value === 'boolean') {
    return `boolean:${value}`;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(
        'Fingerprint values cannot contain non-finite numbers',
      );
    }
    return `number:${value}`;
  }
  if (
    typeof value === 'bigint' ||
    typeof value === 'function' ||
    typeof value === 'symbol'
  ) {
    throw new TypeError(
      `Fingerprint values cannot contain ${typeof value} values`,
    );
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new TypeError('Fingerprint values cannot contain invalid dates');
    }
    return `date:${value.toISOString()}`;
  }
  if (typeof value !== 'object') {
    throw new TypeError(
      `Fingerprint values cannot contain ${typeof value} values`,
    );
  }
  if (ancestors.has(value)) {
    throw new TypeError(
      'Fingerprint values cannot contain circular references',
    );
  }
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const serializedEntries = value.map((entry) =>
        stableSerialize(
          entry,
          ancestors,
          `${path}[]`,
          unorderedCollectionPaths,
        ),
      );
      if (unorderedCollectionPaths.has(path)) {
        serializedEntries.sort();
      }
      return `array:[${serializedEntries.join(',')}]`;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(
        'Fingerprint values must be plain objects, arrays, or dates',
      );
    }
    return `object:{${Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableSerialize(
            value[key],
            ancestors,
            path ? `${path}.${key}` : key,
            unorderedCollectionPaths,
          )}`,
      )
      .join(',')}}`;
  } finally {
    ancestors.delete(value);
  }
};

const validateFingerprintInput = (
  input: DataPlatformQueueFingerprintInput,
): void => {
  if (!input || !input.platform || !input.operation) {
    throw new Error('Fingerprint platform and operation are required');
  }
  if (
    input.unorderedCollectionPaths?.some(
      (path) => !path || typeof path !== 'string',
    )
  ) {
    throw new Error('Unordered collection paths must be non-empty strings');
  }
};
