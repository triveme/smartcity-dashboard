import { createElement, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DatePicker from 'react-datepicker';
import { ReadOnlyDatePickerInput } from '../../ui/Charts/Components/LineChartDateRangeControls';
import FilterButton from '../../ui/Buttons/FilterButton';
import {
  calculateEndDate,
  calculateStartDate,
  getLatestAllowedDate,
  shiftDateByMonths,
} from '../../utils/dateTimeHelper';
import {
  filterLineChartDataByValidDates,
  getXMinMax,
} from '../../utils/Charts/lineChartUtil';
import { getInitialLineChartZoomRange } from '../../utils/Charts/lineChartZoom';
import { getXAxisBounds } from '../../utils/Charts/chartHelper';
import {
  extendedTimeFrameValues,
  getDefaultExtendedTimeframe,
} from '../../utils/enumMapper';
import { validateTab } from '../../validators/tabValidator';
import { validateWidgetWithChildren } from '../../validators/widgetValidator';
import { EMPTY_QUERY_CONFIG, EMPTY_WIDGET } from '../../utils/objectHelper';
import {
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  Tab,
  timeframeEnumSmall,
} from '../../types';

describe('Historic date selection', () => {
  const now = new Date(2026, 9, 5, 10, 15);
  const fullDateRange = {
    min: new Date(2026, 8, 20),
    max: new Date(2026, 9, 5, 9, 30),
  };
  const tab = {
    componentType: tabComponentTypeEnum.diagram,
    componentSubType: tabComponentSubTypeEnum.lineChart,
  } as Tab;
  const queryConfig = {
    ...EMPTY_QUERY_CONFIG,
    extendedDateSelection: true,
    timeframe: 'week',
  };

  beforeEach(() => {
    cy.stub(Date, 'now').returns(now.getTime());
  });

  it('defaults only to supported query timeframes', () => {
    extendedTimeFrameValues
      .filter((option) => option.value !== '')
      .forEach((option) => {
        expect(getDefaultExtendedTimeframe(option.value)).to.equal(
          option.value,
        );
      });

    [undefined, null, '', 'live', 'hour', 'user_defined'].forEach(
      (timeframe) => {
        expect(getDefaultExtendedTimeframe(timeframe)).to.equal(undefined);
      },
    );
  });

  it('rejects missing or unsupported historic timeframes in both line chart wizards', () => {
    [
      tabComponentSubTypeEnum.lineChart,
      tabComponentSubTypeEnum.lineChartDynamic,
    ].forEach((componentSubType) => {
      [undefined, '', '   ', 'live', 'hour', 'user_defined'].forEach(
        (extendedTimeframe) => {
          const invalidTab = { ...tab, componentSubType, extendedTimeframe };

          expect(
            validateTab(invalidTab, queryConfig).extendedTimeframeError,
          ).to.be.a('string');
          expect(
            validateWidgetWithChildren(
              {
                widget: { ...EMPTY_WIDGET, height: 500 },
                tab: invalidTab,
                queryConfig,
              },
              'ngsi-ld',
            ).extendedTimeframeError,
          ).to.be.a('string');
        },
      );
    });
  });

  it('allows configured historic timeframes and does not require one when disabled', () => {
    extendedTimeFrameValues
      .filter((option) => option.value !== '')
      .forEach((option) => {
        expect(
          validateTab({ ...tab, extendedTimeframe: option.value }, queryConfig)
            .extendedTimeframeError,
        ).to.equal(undefined);
      });
    expect(
      validateTab(tab, { ...queryConfig, extendedDateSelection: false })
        .extendedTimeframeError,
    ).to.equal(undefined);
    expect(
      validateTab(
        { ...tab, extendedDateSelection: true },
        { ...queryConfig, extendedDateSelection: false },
      ).extendedTimeframeError,
    ).to.equal(undefined);
    expect(
      validateTab({ ...tab, extendedDateSelection: true })
        .extendedTimeframeError,
    ).to.be.a('string');
  });

  it('caps normalized ends at the latest data timestamp and at now', () => {
    const start = new Date(2026, 9, 1);
    const futureDataEnd = new Date(2026, 9, 10);

    expect(
      calculateEndDate('week', start, fullDateRange.max)?.getTime(),
    ).to.equal(fullDateRange.max.getTime());
    expect(calculateEndDate('week', start, futureDataEnd)?.getTime()).to.equal(
      now.getTime(),
    );
    expect(getLatestAllowedDate(futureDataEnd).getTime()).to.equal(
      now.getTime(),
    );
    expect(
      calculateEndDate(
        'day',
        new Date(2026, 8, 1),
        fullDateRange.max,
      )?.getTime(),
    ).to.equal(new Date(2026, 8, 1, 23, 59, 59, 999).getTime());
  });

  it('clamps month, quarter, and year shifts to the destination month', () => {
    const cases = [
      {
        date: new Date(2026, 0, 31),
        months: 1,
        expected: new Date(2026, 1, 28),
      },
      {
        date: new Date(2024, 0, 31),
        months: 1,
        expected: new Date(2024, 1, 29),
      },
      {
        date: new Date(2026, 2, 31),
        months: -1,
        expected: new Date(2026, 1, 28),
      },
      {
        date: new Date(2026, 0, 31),
        months: 3,
        expected: new Date(2026, 3, 30),
      },
      {
        date: new Date(2026, 4, 31),
        months: -3,
        expected: new Date(2026, 1, 28),
      },
      {
        date: new Date(2024, 1, 29),
        months: 12,
        expected: new Date(2025, 1, 28),
      },
      {
        date: new Date(2024, 1, 29),
        months: 24,
        expected: new Date(2026, 1, 28),
      },
      {
        date: new Date(2024, 1, 29),
        months: 36,
        expected: new Date(2027, 1, 28),
      },
      {
        date: new Date(2024, 1, 29),
        months: -12,
        expected: new Date(2023, 1, 28),
      },
      {
        date: new Date(2026, 11, 31),
        months: 1,
        expected: new Date(2027, 0, 31),
      },
    ];

    cases.forEach(({ date, months, expected }) => {
      const originalTime = date.getTime();
      expect(shiftDateByMonths(date, months).getTime()).to.equal(
        expected.getTime(),
      );
      expect(date.getTime()).to.equal(originalTime);
    });

    const dateWithTime = new Date(2026, 0, 31, 10, 15, 30, 123);
    expect(shiftDateByMonths(dateWithTime, 1).getTime()).to.equal(
      new Date(2026, 1, 28, 10, 15, 30, 123).getTime(),
    );
  });

  it('uses clamped calendar arithmetic for both historic boundaries', () => {
    expect(
      calculateEndDate(
        'month',
        new Date(2026, 0, 31),
        fullDateRange.max,
      )?.getTime(),
    ).to.equal(new Date(2026, 1, 28, 23, 59, 59, 999).getTime());
    expect(
      calculateStartDate('month', new Date(2026, 2, 31))?.getTime(),
    ).to.equal(new Date(2026, 1, 28).getTime());
    expect(
      calculateEndDate(
        'quarter',
        new Date(2026, 0, 31),
        fullDateRange.max,
      )?.getTime(),
    ).to.equal(new Date(2026, 3, 30, 23, 59, 59, 999).getTime());
    expect(
      calculateEndDate(
        'year',
        new Date(2024, 1, 29),
        fullDateRange.max,
      )?.getTime(),
    ).to.equal(new Date(2025, 1, 28, 23, 59, 59, 999).getTime());
    expect(
      calculateStartDate('year', new Date(2024, 1, 29))?.getTime(),
    ).to.equal(new Date(2023, 1, 28).getTime());
  });

  it('also clamps initial zoom and normalized axis month boundaries', () => {
    const range = { min: new Date(2026, 0, 31), max: new Date(2026, 2, 31) };
    expect(
      getInitialLineChartZoomRange(
        range,
        'first',
        timeframeEnumSmall.month,
      ).max.getTime(),
    ).to.equal(new Date(2026, 1, 28).getTime());
    expect(
      getInitialLineChartZoomRange(
        range,
        'last',
        timeframeEnumSmall.month,
      ).min.getTime(),
    ).to.equal(new Date(2026, 1, 28).getTime());
    expect(
      getXAxisBounds(
        [{ name: 'temperature', values: [[range.max.toISOString(), 1]] }],
        'month',
        true,
      ).min,
    ).to.equal(new Date(2026, 1, 28).getTime());
  });

  it('keeps inputs read-only after datepicker cloning without blocking calendar opening', () => {
    const picker = new DatePicker({
      ...DatePicker.defaultProps,
      customTimeInput: undefined,
      selected: new Date(2026, 8, 1),
      dateFormat: 'yyyy-MM-dd',
      customInput: createElement(ReadOnlyDatePickerInput),
      onChange: () => {},
    });
    const openCalendar = cy.stub(picker, 'setOpen');
    const renderedInput = picker.renderDateInput();

    expect(renderToStaticMarkup(renderedInput).toLowerCase()).to.contain(
      'readonly=""',
    );
    expect(
      renderToStaticMarkup(
        createElement(ReadOnlyDatePickerInput, { readOnly: false }),
      ).toLowerCase(),
    ).to.contain('readonly=""');
    renderedInput.props.onClick();
    expect(openCalendar).to.have.been.calledWith(true);
  });

  it('returns no bounds for empty series or exclusively invalid timestamps', () => {
    expect(getXMinMax([])).to.equal(null);
    expect(getXMinMax([{ name: 'empty', values: [] }])).to.equal(null);
    expect(
      getXMinMax([
        {
          name: 'invalid',
          values: [
            ['invalid-date', 1],
            ['', 2],
          ],
        },
      ]),
    ).to.equal(null);
  });

  it('ignores invalid timestamps while preserving valid values and source data', () => {
    const validTime = new Date(2026, 8, 1).toISOString();
    const data = [
      {
        name: 'temperature',
        values: [
          ['invalid-date', 1],
          [validTime, 2],
        ] as [string, number][],
      },
    ];
    const filtered = filterLineChartDataByValidDates(data);

    expect(filtered[0].values).to.deep.equal([[validTime, 2]]);
    expect(data[0].values).to.have.length(2);
    expect(getXMinMax(data)?.min.getTime()).to.equal(
      new Date(validTime).getTime(),
    );
    expect(getXMinMax(data)?.max.getTime()).to.equal(
      new Date(validTime).getTime(),
    );
    expect(
      getXMinMax(
        filterLineChartDataByValidDates([
          { name: 'invalid', values: [['invalid-date', 1]] },
        ]),
      ),
    ).to.equal(null);
  });

  it('disables the desktop attribute selectors during a fetch', () => {
    const buttons = FilterButton({
      attributes: ['temperature'],
      clickedAttribute: 'temperature',
      onClick: () => {},
      filterColor: '#FFFFFF',
      filterTextColor: '#000000',
      disabled: true,
    });
    const props = buttons.props as {
      children: ReactElement<{ disabled: boolean }>[];
    };

    expect(props.children[0].props.disabled).to.equal(true);
  });
});
