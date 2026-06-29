type HorizontalLegendLayoutArgs = {
  itemGap: number;
  itemWidth: number;
  items: string[];
  fontSize: string;
  iconTextGap: number;
  maxWidth: number;
  rowHeight: number;
  verticalPadding: number;
};

let measurementCanvas: HTMLCanvasElement | null = null;

function getLegendMeasurementContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!measurementCanvas) {
    measurementCanvas = document.createElement('canvas');
  }

  return measurementCanvas.getContext('2d');
}

function parseLegendFontSize(fontSize: string, fallback = 12): number {
  const parsedFontSize = Number.parseInt(fontSize, 10);
  return Number.isFinite(parsedFontSize) ? parsedFontSize : fallback;
}

function measureLegendTextWidth(text: string, fontSize: string): number {
  const resolvedFontSize = parseLegendFontSize(fontSize);
  const context = getLegendMeasurementContext();

  if (context) {
    context.font = `${resolvedFontSize}px sans-serif`;
    return context.measureText(text).width;
  }

  return text.length * resolvedFontSize * 0.62;
}

export function getHorizontalLegendLayout(args: HorizontalLegendLayoutArgs): {
  height: number;
  rowCount: number;
} {
  if (args.items.length === 0) {
    return {
      height: 0,
      rowCount: 0,
    };
  }

  const availableWidth = Math.max(args.maxWidth, 1);
  let rowCount = 1;
  let currentRowWidth = 0;

  args.items.forEach((item) => {
    const itemWidth =
      args.itemWidth +
      args.iconTextGap +
      measureLegendTextWidth(item, args.fontSize) +
      args.itemGap;

    if (currentRowWidth > 0 && currentRowWidth + itemWidth > availableWidth) {
      rowCount++;
      currentRowWidth = itemWidth;
      return;
    }

    currentRowWidth += itemWidth;
  });

  return {
    height: rowCount * args.rowHeight + args.verticalPadding,
    rowCount,
  };
}
