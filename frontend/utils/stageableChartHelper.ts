export function getStageLabel(
  value: number,
  texts: string[],
  boundaries: number[],
): string {
  if (texts.length === 0) {
    return '';
  }

  for (let i = 0; i < boundaries.length; i++) {
    if (value <= boundaries[i]) {
      return texts[i];
    }
  }

  return texts[texts.length - 1] || '';
}

export function getAxisLabelRich(
  colors: string[],
  fallbackColor: string | undefined,
  fontSize: number,
): Record<string, { color?: string; fontSize: number }> {
  return colors.reduce<Record<string, { color?: string; fontSize: number }>>(
    (acc, color, index) => {
      acc[`axisLabelStage${index}`] = {
        color: color || fallbackColor,
        fontSize,
      };
      return acc;
    },
    {
      axisLabelDefault: {
        color: fallbackColor,
        fontSize,
      },
    },
  );
}

export function getAxisLabelStyleName(
  value: number,
  boundaries: number[],
  richConfig: Record<string, { color?: string; fontSize: number }>,
): string {
  // Prop-/Spaltenname ist historisch "usePreviousStageColorOnBoundary",
  // faerbt eine Grenzwert-Beschriftung aber bewusst mit der Farbe der
  // naechsten (nicht der vorherigen) Stufe - siehe
  // docs/stageable-chart-grenzwerte-checkbox-investigation.md. Ein Wert,
  // der exakt auf einer Grenze liegt, gehoert daher zur folgenden Stufe;
  // per strikt-kleiner-Vergleich rutscht er in die naechsthoehere Stufe.
  // Fallback (kein i erfuellt value < boundaries[i], d.h. value liegt auf
  // oder jenseits der letzten Grenze): es gibt keine "naechste" Stufe mehr,
  // daher bleibt es bei der letzten Stufe selbst statt bei axisLabelDefault.
  let stageIndex = Math.max(boundaries.length - 1, 0);
  for (let i = 0; i < boundaries.length; i++) {
    if (value < boundaries[i]) {
      stageIndex = i;
      break;
    }
  }
  return richConfig[`axisLabelStage${stageIndex}`]
    ? `axisLabelStage${stageIndex}`
    : 'axisLabelDefault';
}
