import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MapPopupContent, { Marker } from '../../components/Map/MapPopupContent';
import { getValueString } from '../../components/Map/MapLabelUtils';
import { MapModalWidget, Tab, tabComponentTypeEnum } from '../../types';
import { validateTab } from '../../validators/tabValidator';
import { combineWidgetAttributes } from '../../utils/combinedMapDataHelper';

describe('Inline map popup decimal places', () => {
  const marker: Marker = {
    position: [0, 0],
    title: 'Sensor',
    details: { temperature: { type: 'Number', value: 12.345678 } },
  };
  const mapWidget: MapModalWidget = {
    componentType: tabComponentTypeEnum.value,
    attributes: 'temperature',
    tiles: 1,
    chartMinimum: 0,
    chartMaximum: 100,
    chartUnit: '',
  };

  const renderPopup = (
    overrides: Partial<Parameters<typeof MapPopupContent>[0]> = {},
  ): string =>
    renderToStaticMarkup(
      createElement(MapPopupContent, {
        marker,
        isCombinedMap: false,
        decimalSeparator: ',',
        ...overrides,
      }),
    );

  it('defaults missing map popup precision to two decimals', () => {
    expect(renderPopup()).to.contain('12,35');
    expect(renderPopup({ isCombinedMap: true })).to.contain('12,35');
  });

  it('uses dedicated map popup precision and preserves explicit zero', () => {
    const tab = { mapPopupDecimalPlaces: 0 };
    expect(
      renderPopup({
        popupDecimalPlace: tab.mapPopupDecimalPlaces ?? 2,
      }),
    ).to.contain('<strong> 12 ');
  });

  it('ignores modal value-widget precision and ordering', () => {
    for (const mapWidgetValues of [
      [
        { ...mapWidget, decimalPlaces: 0 },
        { ...mapWidget, decimalPlaces: 5 },
      ],
      [
        { ...mapWidget, decimalPlaces: 5 },
        { ...mapWidget, decimalPlaces: 0 },
      ],
      [],
    ]) {
      const combined = combineWidgetAttributes([
        {
          tabs: [
            {
              componentType: tabComponentTypeEnum.map,
              mapPopupDecimalPlaces: 3,
              mapWidgetValues,
            },
          ],
        },
      ] as Parameters<typeof combineWidgetAttributes>[0]);

      expect(combined.popupDecimalPlace).to.deep.equal([3]);
    }
  });

  it('validates popup precision in the wizard', () => {
    const tab = { componentType: tabComponentTypeEnum.map } as Tab;
    for (const mapPopupDecimalPlaces of [undefined, 0, 2, 10]) {
      expect(
        validateTab({ ...tab, mapPopupDecimalPlaces })
          .mapPopupDecimalPlacesError,
      ).to.equal(undefined);
    }
    for (const mapPopupDecimalPlaces of [-1, 1.5, 11, NaN, Infinity]) {
      expect(
        validateTab({ ...tab, mapPopupDecimalPlaces })
          .mapPopupDecimalPlacesError,
      ).to.be.a('string');
    }
  });

  it('applies the supplied map precision to every numeric attribute', () => {
    const html = renderPopup({
      marker: {
        ...marker,
        details: {
          ...marker.details,
          humidity: { type: 'Number', value: 65.4321 },
        },
      },
      popupDecimalPlace: 3,
    });

    expect(html).to.contain('12,346');
    expect(html).to.contain('65,432');
  });

  it('keeps source map precision aligned independently of modal widgets', () => {
    const combined = combineWidgetAttributes([
      {
        name: 'Source A',
        tabs: [
          {
            componentType: tabComponentTypeEnum.map,
            mapObject: [marker.details],
            mapPopupDecimalPlaces: 0,
          },
        ],
      },
      {
        name: 'Source B',
        tabs: [
          {
            componentType: tabComponentTypeEnum.map,
            mapObject: [marker.details],
            mapWidgetValues: [{ ...mapWidget, decimalPlaces: 5 }],
          },
        ],
      },
      {
        name: 'Source C',
        tabs: [
          {
            componentType: tabComponentTypeEnum.map,
            mapObject: [marker.details],
            mapPopupDecimalPlaces: 3,
            mapWidgetValues: [{ ...mapWidget, decimalPlaces: 0 }],
          },
        ],
      },
    ] as Parameters<typeof combineWidgetAttributes>[0]);
    const popupDecimalPlaces = combined.popupDecimalPlace as number[];
    const mapObjects = combined.mapObject as Marker['details'][];

    expect(popupDecimalPlaces).to.deep.equal([0, 2, 3]);
    for (const [source, expectedValue] of ['12', '12,35', '12,346'].entries()) {
      const details = mapObjects[source];
      expect(
        renderPopup({
          marker: { ...marker, details, dataSource: source },
          isCombinedMap: true,
          popupDecimalPlace: popupDecimalPlaces[details.dataSource as number],
        }),
      ).to.contain(`<strong> ${expectedValue} `);
    }
  });

  it('uses configured precision for raw numbers on single maps', () => {
    expect(
      renderPopup({
        marker: { ...marker, details: { temperature: 12.345678 } },
        popupDecimalPlace: 3,
      }),
    ).to.contain('12,346');
  });

  it('formats numeric strings and precision above three decimal places', () => {
    expect(
      renderPopup({
        marker: {
          ...marker,
          details: { temperature: { type: 'Number', value: '12.345678' } },
        },
        decimalSeparator: '.',
        popupDecimalPlace: 5,
      }),
    ).to.contain('12.34568');
  });

  it('rounds numeric values wrapped in an NGSI Property', () => {
    expect(
      renderPopup({
        marker: {
          ...marker,
          details: {
            currentLevel: {
              type: 'Property',
              value: 4.01369571685791,
              observedAt: '2026-10-13T13:29:09.420Z',
            },
          },
        },
        popupDecimalPlace: 2,
      }),
    ).to.contain('4,01');
  });

  it('applies supplied and default precision to total consumption', () => {
    for (const isCombinedMap of [false, true]) {
      const overrides = {
        marker: {
          ...marker,
          details: { TOTALCONSUMPTION: { type: 'Number', value: 12.345678 } },
        },
        isCombinedMap,
      };

      expect(renderPopup(overrides)).to.contain('12,35');
      expect(renderPopup({ ...overrides, popupDecimalPlace: 3 })).to.contain(
        '12,346',
      );
      expect(renderPopup({ ...overrides, popupDecimalPlace: 0 })).to.contain(
        '<strong> 12 ',
      );
    }
  });

  it('preserves nonnumeric and missing values', () => {
    expect(getValueString({ type: 'Text', value: 'Active' }, ',', 0)).to.equal(
      'Active',
    );
    expect(getValueString({ type: 'Number', value: null }, ',', 3)).to.equal(
      'Keine Daten',
    );
  });
});
