import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MapPopupContent, { Marker } from '../../components/Map/MapPopupContent';
import { getValueString } from '../../components/Map/MapLabelUtils';
import { MapModalWidget, tabComponentTypeEnum } from '../../types';
import {
  combineWidgetAttributes,
  getMapPopupDecimalPlace,
} from '../../utils/combinedMapDataHelper';

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

  it('defaults missing value-widget precision to two decimals', () => {
    expect(getMapPopupDecimalPlace()).to.equal(2);
    expect(getMapPopupDecimalPlace(null)).to.equal(2);
    expect(getMapPopupDecimalPlace([])).to.equal(2);
    expect(getMapPopupDecimalPlace([mapWidget])).to.equal(2);
    expect(renderPopup()).to.contain('12,35');
    expect(renderPopup({ isCombinedMap: true })).to.contain('12,35');
  });

  it('uses value-widget precision and preserves explicit zero', () => {
    expect(
      getMapPopupDecimalPlace([{ ...mapWidget, decimalPlaces: 0 }]),
    ).to.equal(0);
    expect(
      renderPopup({
        popupDecimalPlace: getMapPopupDecimalPlace([
          { ...mapWidget, decimalPlaces: 0 },
        ]),
      }),
    ).to.contain('<strong> 12 ');
  });

  it('ignores chart widgets and picks the first configured value widget', () => {
    expect(
      getMapPopupDecimalPlace([
        {
          ...mapWidget,
          componentType: tabComponentTypeEnum.diagram,
          decimalPlaces: 0,
        },
        mapWidget,
        { ...mapWidget, decimalPlaces: 3 },
        { ...mapWidget, decimalPlaces: 5 },
      ]),
    ).to.equal(3);
    expect(
      getMapPopupDecimalPlace([
        {
          ...mapWidget,
          componentType: tabComponentTypeEnum.diagram,
          decimalPlaces: 0,
        },
      ]),
    ).to.equal(2);
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

  it('keeps combined-source precision aligned when a source has no widgets', () => {
    const combined = combineWidgetAttributes([
      {
        name: 'Source A',
        tabs: [
          {
            mapObject: [marker.details],
            mapWidgetValues: [{ ...mapWidget, decimalPlaces: 0 }],
          },
        ],
      },
      {
        name: 'Source B',
        tabs: [{ mapObject: [marker.details] }],
      },
      {
        name: 'Source C',
        tabs: [
          {
            mapObject: [marker.details],
            mapWidgetValues: [{ ...mapWidget, decimalPlaces: 3 }],
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
