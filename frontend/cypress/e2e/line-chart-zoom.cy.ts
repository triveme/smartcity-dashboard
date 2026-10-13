import {
  getEffectiveLineChartDateRange,
  getInitialLineChartZoomRange,
  getReconciledLineChartZoomRange,
  LineChartDateRange,
} from '../../utils/Charts/lineChartZoom';
import { timeframeEnumSmall } from '../../types';

describe('Line chart zoom transitions', () => {
  const date = (day: number): Date => new Date(2026, 8, day, 12);
  const range = (min: number, max: number): LineChartDateRange => ({
    min: date(min),
    max: date(max),
  });
  const expectRange = (
    actual: LineChartDateRange,
    expected: LineChartDateRange,
  ): void => {
    expect(actual.min.getTime()).to.equal(expected.min.getTime());
    expect(actual.max.getTime()).to.equal(expected.max.getTime());
  };

  it('clamps both selection boundaries inside the available data', () => {
    const fullRange = range(20, 25);

    expectRange(
      getEffectiveLineChartDateRange(fullRange, date(1), date(5)),
      range(20, 20),
    );
    expectRange(
      getEffectiveLineChartDateRange(fullRange, date(27), date(30)),
      range(25, 25),
    );
    expectRange(
      getEffectiveLineChartDateRange(fullRange, date(1), date(30)),
      fullRange,
    );
  });

  it('resets a historic zoom when switching to base data', () => {
    const baseRange = range(20, 25);

    expectRange(
      getReconciledLineChartZoomRange(baseRange, range(2, 5)),
      baseRange,
    );
  });

  it('resets a base-data zoom when older historic results arrive', () => {
    const historicRange = range(2, 5);

    expectRange(
      getReconciledLineChartZoomRange(historicRange, range(20, 25)),
      historicRange,
    );
  });

  it('resets zoom between disjoint base-data selections in both directions', () => {
    const earlyRange = range(20, 21);
    const laterRange = range(24, 25);

    expectRange(
      getReconciledLineChartZoomRange(laterRange, earlyRange),
      laterRange,
    );
    expectRange(
      getReconciledLineChartZoomRange(earlyRange, laterRange),
      earlyRange,
    );
  });

  it('does not collapse a zoom that only touches the new range boundary', () => {
    const fullRange = range(20, 25);

    expectRange(
      getReconciledLineChartZoomRange(fullRange, range(15, 20)),
      fullRange,
    );
    expectRange(
      getReconciledLineChartZoomRange(fullRange, range(25, 30)),
      fullRange,
    );
  });

  it('preserves user zoom when an overlapping data refresh adds points', () => {
    const zoomRange = range(21, 23);

    expectRange(
      getReconciledLineChartZoomRange(range(20, 26), zoomRange),
      zoomRange,
    );
  });

  it('clips partially overlapping zoom without losing the remaining interval', () => {
    const fullRange = range(20, 25);

    expectRange(
      getReconciledLineChartZoomRange(fullRange, range(18, 23)),
      range(20, 23),
    );
    expectRange(
      getReconciledLineChartZoomRange(fullRange, range(22, 27)),
      range(22, 25),
    );
  });

  it('keeps usable bounds through historic, mixed and base-data transitions', () => {
    let zoomRange = range(2, 5);

    [range(4, 22), range(24, 25), range(2, 5)].forEach((nextRange) => {
      zoomRange = getReconciledLineChartZoomRange(nextRange, zoomRange);

      expect(zoomRange.min.getTime()).to.be.at.least(nextRange.min.getTime());
      expect(zoomRange.max.getTime()).to.be.at.most(nextRange.max.getTime());
      expect(zoomRange.min.getTime()).to.be.lessThan(zoomRange.max.getTime());
    });
  });

  it('shows the full new range after a reset rather than reapplying initial zoom', () => {
    const baseRange = range(20, 25);
    const historicRange = range(2, 5);

    expectRange(
      getInitialLineChartZoomRange(baseRange, 'last', timeframeEnumSmall.day),
      range(24, 25),
    );
    expectRange(getReconciledLineChartZoomRange(baseRange, null), baseRange);
    expectRange(
      getReconciledLineChartZoomRange(historicRange, null),
      historicRange,
    );
  });

  it('supports datasets containing only a single timestamp', () => {
    const singlePointRange = range(22, 22);

    [null, range(2, 5), range(20, 25), singlePointRange].forEach(
      (zoomRange) => {
        expectRange(
          getReconciledLineChartZoomRange(singlePointRange, zoomRange),
          singlePointRange,
        );
      },
    );
  });

  it('expands a single-point zoom when more data becomes available', () => {
    const fullRange = range(20, 25);

    expectRange(
      getReconciledLineChartZoomRange(fullRange, range(22, 22)),
      fullRange,
    );
  });

  it('recovers from invalid or reversed previous zoom bounds', () => {
    const fullRange = range(20, 25);

    [
      range(24, 21),
      { min: new Date('invalid'), max: date(23) },
      { min: date(21), max: new Date('invalid') },
    ].forEach((zoomRange) => {
      expectRange(
        getReconciledLineChartZoomRange(fullRange, zoomRange),
        fullRange,
      );
    });
  });
});
