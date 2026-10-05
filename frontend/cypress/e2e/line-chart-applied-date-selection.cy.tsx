import { act, createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useAppliedLineChartDateSelection } from '../../app/custom-hooks/useAppliedLineChartDateSelection';
import {
  getEffectiveLineChartDateRange,
  LineChartDateRange,
} from '../../utils/Charts/lineChartZoom';
import { ChartData } from '../../types';

type SelectionOptions = Parameters<typeof useAppliedLineChartDateSelection>[0];
type SelectionResult = ReturnType<typeof useAppliedLineChartDateSelection>;

describe('Applied line chart date selection', () => {
  const date = (day: number): Date => new Date(2026, 8, day, 12);
  const range = (min: number, max: number): LineChartDateRange => ({
    min: date(min),
    max: date(max),
  });
  const data = (days: number[]): ChartData[] => [
    {
      name: 'temperature',
      id: 'sensor',
      values: days.map((day) => [date(day).toISOString(), day]),
    },
  ];
  const baseData = data([20, 21, 22, 23, 24, 25]);
  const historicData = data([2, 3, 4, 5]);
  const newHistoricData = data([10, 11, 12]);
  const fullDateRange = range(20, 25);
  let root: Root;
  let container: HTMLDivElement;
  let options: SelectionOptions;
  let selection: SelectionResult;

  function Probe(props: SelectionOptions): null {
    selection = useAppliedLineChartDateSelection(props);
    return null;
  }

  const render = (): void => {
    act(() => root.render(createElement(Probe, options)));
  };
  const select = (dateRange: LineChartDateRange | null): void => {
    act(() => {
      selection.tryApplyAvailableDateSelection(dateRange ?? fullDateRange);
    });
    options = {
      ...options,
      effectiveDateRange: getEffectiveLineChartDateRange(
        fullDateRange,
        dateRange?.min ?? null,
        dateRange?.max ?? null,
      ),
    };
    render();
  };
  const apply = (
    dateRange: LineChartDateRange,
    chartData: ChartData[] | null,
  ): void => {
    act(() => selection.applyDateSelection(dateRange, chartData));
  };

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    options = {
      baseData,
      fullDateRange,
      effectiveDateRange: fullDateRange,
      isEnabled: true,
      extendedDateSelection: true,
    };
    render();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false });
  });

  it('keeps default data visible while selecting historic or mixed ranges', () => {
    select(range(2, 5));
    expect(selection.chartData).to.equal(baseData);
    select(range(4, 22));
    expect(selection.chartData).to.equal(baseData);
  });

  it('immediately switches from historic to fully available default data', () => {
    apply(range(2, 5), historicData);
    select(range(20, 25));
    expect(selection.chartData).to.deep.equal(baseData);
  });

  it('does not resurrect old historic data after applying default data', async () => {
    apply(range(2, 5), historicData);
    select(range(20, 25));
    apply(range(20, 25), null);
    const displayedBaseData = selection.chartData;

    select(range(10, 12));
    expect(selection.chartData).to.deep.equal(displayedBaseData);

    let resolveFetch!: (chartData: ChartData[]) => void;
    const fetch = new Promise<ChartData[]>((resolve) => {
      resolveFetch = resolve;
    });
    expect(selection.chartData).to.deep.equal(displayedBaseData);
    resolveFetch(newHistoricData);
    const result = await fetch;
    apply(range(10, 12), result);

    expect(selection.chartData).to.deep.equal(newHistoricData);
  });

  it('immediately applies available base ranges and clearing dates', () => {
    apply(range(20, 21), null);
    select(range(24, 25));
    expect(selection.chartData).to.deep.equal(data([24, 25]));
    select(null);
    expect(selection.chartData).to.deep.equal(baseData);
  });

  it('replaces historic data only when new historic or mixed results are applied', () => {
    apply(range(2, 5), historicData);
    select(range(4, 22));
    expect(selection.chartData).to.deep.equal(historicData);

    const mixedData = data([4, 5, 20, 21, 22]);
    apply(range(4, 22), mixedData);
    expect(selection.chartData).to.deep.equal(mixedData);

    select(range(1, 3));
    expect(selection.chartData).to.deep.equal(mixedData);
    const earlierHistoricData = data([1, 2, 3]);
    apply(range(1, 3), earlierHistoricData);
    expect(selection.chartData).to.deep.equal(earlierHistoricData);
  });

  it('preserves the last applied data when a new fetch fails', async () => {
    apply(range(2, 5), historicData);
    select(range(10, 12));

    try {
      await Promise.reject(new Error('Datasource unavailable'));
    } catch {
      expect(selection.chartData).to.deep.equal(historicData);
    }
  });

  it('applies empty results without falling back to default or old historic data', () => {
    apply(range(2, 5), historicData);
    apply(range(10, 12), []);
    expect(selection.chartData).to.deep.equal([]);

    select(range(20, 25));
    expect(selection.chartData).to.deep.equal(baseData);
  });

  it('refreshes default data inside the applied range rather than the draft range', () => {
    apply(range(20, 21), null);
    select(range(10, 12));
    const refreshedData = data([20, 21, 22, 23, 24, 25]);
    refreshedData[0].values[0][1] = 100;
    options = { ...options, baseData: refreshedData };
    render();

    expect(selection.chartData[0].values).to.deep.equal(
      refreshedData[0].values.slice(0, 2),
    );
  });

  it('still applies date edits immediately when historic selection is disabled', () => {
    options = { ...options, extendedDateSelection: false };
    render();
    select(range(20, 21));
    expect(selection.chartData).to.deep.equal(data([20, 21]));
    select(range(24, 25));
    expect(selection.chartData).to.deep.equal(data([24, 25]));
  });

  it('clears applied historic data when date selection is disabled', () => {
    apply(range(2, 5), historicData);
    options = { ...options, isEnabled: false };
    render();
    expect(selection.chartData).to.equal(baseData);

    options = { ...options, isEnabled: true };
    render();
    expect(selection.chartData).to.equal(baseData);
  });

  it('reuses historic subsets and expands them back to the full fetched range', () => {
    apply(range(2, 5), historicData);
    select(range(3, 4));
    expect(selection.chartData).to.deep.equal(data([3, 4]));
    select(range(2, 5));
    expect(selection.chartData).to.deep.equal(historicData);
  });

  it('reuses a fully covered historic range after displaying default data', () => {
    apply(range(2, 5), historicData);
    select(fullDateRange);
    expect(selection.chartData).to.deep.equal(baseData);
    select(range(3, 4));
    expect(selection.chartData).to.deep.equal(data([3, 4]));
  });

  it('uses requested coverage rather than the first and last returned points', () => {
    apply(range(2, 5), data([3, 4]));
    select(range(2, 3));
    expect(selection.chartData).to.deep.equal(data([3]));

    apply(range(10, 12), []);
    select(fullDateRange);
    select(range(10, 11));
    expect(selection.chartData).to.deep.equal([]);
  });

  it('does not apply a partially covered historic range or a gap between sources', () => {
    apply(range(2, 5), historicData);
    select(fullDateRange);
    const displayedBaseData = selection.chartData;
    select(range(4, 6));
    expect(selection.chartData).to.deep.equal(displayedBaseData);
    select(range(4, 22));
    expect(selection.chartData).to.deep.equal(displayedBaseData);
  });

  it('combines overlapping fetched and base coverage without duplicating points', () => {
    apply(range(18, 22), data([18, 19, 20, 21, 22]));
    select(range(19, 24));
    expect(selection.chartData).to.deep.equal(data([19, 20, 21, 22, 23, 24]));
  });

  it('requires fetching when the selection extends past all available coverage', () => {
    apply(range(18, 22), data([18, 19, 20, 21, 22]));
    select(range(19, 24));
    const availableData = selection.chartData;
    select(range(17, 24));
    expect(selection.chartData).to.deep.equal(availableData);
    apply(range(17, 24), data([17, 18, 19, 20, 21, 22, 23, 24]));
    expect(selection.chartData).to.deep.equal(
      data([17, 18, 19, 20, 21, 22, 23, 24]),
    );
  });
});
