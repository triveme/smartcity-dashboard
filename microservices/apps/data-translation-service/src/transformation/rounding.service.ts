import { Injectable } from '@nestjs/common';

export enum RoundingMode {
  MATH = 'math',
  FLOOR = 'floor',
  CEIL = 'ceil',
}

@Injectable()
export class RoundingService {
  round(
    value: number,
    step = 10,
    mode: RoundingMode = RoundingMode.MATH,
  ): number {
    if (step === 0) return value;

    switch (mode) {
      case RoundingMode.FLOOR:
        return Math.floor(value / step) * step;
      case RoundingMode.CEIL:
        return Math.ceil(value / step) * step;
      case RoundingMode.MATH:
      default:
        const lower = Math.floor(value / step) * step;
        const upper = Math.ceil(value / step) * step;
        return Math.abs(value - lower) < Math.abs(upper - value)
          ? lower
          : upper;
    }
  }

  parseRoundingMode(value: string): RoundingMode | undefined {
    return Object.values(RoundingMode).includes(value as RoundingMode)
      ? (value as RoundingMode)
      : undefined;
  }
}
