// Schema für den Import/Export von Themes (CorporateInfo).
// Whitelist: nur hier aufgeführte Felder werden importiert/exportiert.
// Identitätsfelder (id, tenantId, createdAt, updatedAt) gehören bewusst NICHT dazu.
import { fontFamilyEnum, menuArrowDirectionEnum, SidebarLogo } from '@/types';
import sanitizeCSSInjection from '@/utils/sanitizeHtml';

const COLOR_FIELDS = [
  'barChartAxisLabelFontColor',
  'barChartAxisLineColor',
  'barChartFilterColor',
  'barChartFilterTextColor',
  'barChartGridColor',
  'barChartLegendFontColor',
  'barChartTicksFontColor',
  'cancelButtonColor',
  'cancelHoverButtonColor',
  'coloredSliderArrowColor',
  'coloredSliderBigValueFontColor',
  'coloredSliderLabelFontColor',
  'dashboardFontColor',
  'dashboardPrimaryColor',
  'dashboardSecondaryColor',
  'degreeChart180BgColor',
  'degreeChart180FillColor',
  'degreeChart180FontColor',
  'degreeChart360BgColor',
  'degreeChart360FillColor',
  'degreeChart360FontColor',
  'fontColor',
  'headerFontColor',
  'headerPrimaryColor',
  'headerSecondaryColor',
  'iconWithLinkFontColor',
  'iconWithLinkIconColor',
  'informationTextFontColor',
  'lineChartAxisLabelFontColor',
  'lineChartAxisLineColor',
  'lineChartFilterColor',
  'lineChartFilterTextColor',
  'lineChartGridColor',
  'lineChartLegendFontColor',
  'lineChartTicksFontColor',
  'measurementChartAxisLabelFontColor',
  'measurementChartAxisLineColor',
  'measurementChartAxisTicksFontColor',
  'measurementChartBarColor',
  'measurementChartBigValueFontColor',
  'measurementChartCardsBgColor',
  'measurementChartCardsFontColor',
  'measurementChartGridColor',
  'measurementChartLabelFontColor',
  'measurementChartTopButtonBgColor',
  'measurementChartTopButtonFontColor',
  'measurementChartTopButtonHoverColor',
  'measurementChartTopButtonInactiveBgColor',
  'menuActiveColor',
  'menuActiveFontColor',
  'menuCornerColor',
  'menuCornerFontColor',
  'menuFontColor',
  'menuHoverColor',
  'menuHoverFontColor',
  'menuPrimaryColor',
  'menuSecondaryColor',
  'panelBorderColor',
  'panelFontColor',
  'panelPrimaryColor',
  'panelSecondaryColor',
  'pieChartFontColor',
  'saveButtonColor',
  'saveHoverButtonColor',
  'scrollbarBackground',
  'scrollbarColor',
  'sliderCurrentFontColor',
  'sliderMaximumFontColor',
  'sliderGeneralFontColor',
  'sliderCurrentColor',
  'sliderMaximumColor',
  'stageableChartFontColor',
  'stageableChartTicksFontColor',
  'tableFontColor',
  'tableHeaderColor',
  'tableOddRowColor',
  'tableEvenRowColor',
  'weatherWarningBgColor',
  'weatherWarningHeadlineColor',
  'weatherInstructionsColor',
  'weatherAlertDescriptionColor',
  'weatherDateColor',
  'weatherWarningButtonBackgroundColor',
  'weatherWarningButtonIconColor',
  'wertFontColor',
  'widgetBorderColor',
  'widgetFontColor',
  'widgetPrimaryColor',
  'widgetSecondaryColor',
  'widgetPreviewBackgroundColor',
  'listviewBackgroundColor',
  'listviewItemBackgroundColor',
  'listviewItemBorderColor',
  'listviewTitleFontColor',
  'listviewDescriptionFontColor',
  'listviewCounterFontColor',
  'listviewFilterButtonBackgroundColor',
  'listviewFilterButtonBorderColor',
  'listviewFilterButtonFontColor',
  'listviewFilterButtonHoverBackgroundColor',
  'listviewArrowIconColor',
  'listviewBackButtonBackgroundColor',
  'listviewBackButtonHoverBackgroundColor',
  'listviewBackButtonFontColor',
  'listviewMapButtonBackgroundColor',
  'listviewMapButtonHoverBackgroundColor',
  'listviewMapButtonFontColor',
  'dateSelectorBorderColor',
  'dateSelectorBackgroundColorSelected',
  'dateSelectorFontColorSelected',
  'dateSelectorFontColorUnselected',
] as const;

const TEXT_FIELDS = [
  'barChartAxisLabelSize',
  'barChartAxisTicksFontSize',
  'barChartLegendFontSize',
  'coloredSliderBigValueFontSize',
  'coloredSliderLabelFontSize',
  'coloredSliderUnitFontSize',
  'cssStyleInjectionValue',
  'dashboardHeadlineFontSize',
  'degreeChart180FontSize',
  'degreeChart180UnitFontSize',
  'degreeChart360FontSize',
  'degreeChart360UnitFontSize',
  'headerTitleAdmin',
  'headerTitleDashboards',
  'iconWithLinkFontSize',
  'iconWithLinkIconSize',
  'informationTextFontSize',
  'lineChartAxisLabelSize',
  'lineChartAxisTicksFontSize',
  'lineChartLegendFontSize',
  'measurementChartBigValueFontSize',
  'panelBorderRadius',
  'panelBorderSize',
  'panelHeadlineFontSize',
  'pieChartFontSize',
  'stageableChartFontSize',
  'stageableChartTicksFontSize',
  'titleBar',
  'wertFontSize',
  'wertUnitFontSize',
  'widgetBorderRadius',
  'widgetBorderSize',
  'widgetHeadlineFontSize',
  'widgetSubheadlineFontSize',
  'listviewItemBorderRadius',
  'listviewItemBorderSize',
  'listviewTitleFontSize',
  'listviewTitleFontWeight',
  'listviewDescriptionFontSize',
  'listviewCounterFontSize',
] as const;

const COLOR_LIST_FIELDS = [
  'barChartCurrentValuesColors',
  'lineChartCurrentValuesColors',
  'measurementChartCardsIconColors',
  'measurementChartCurrentValuesColors',
  'pieChartCurrentValuesColors',
] as const;

const BOOLEAN_FIELDS = [
  'isPanelHeadlineBold',
  'isWidgetHeadlineBold',
  'showHeaderLogo',
  'showMenuLogo',
  'showInfoButtonsOnMobile',
  'useColorTransitionHeader',
  'useColorTransitionMenu',
] as const;

// Bild-Felder: werden nur mit "Mit Bilder" importiert/exportiert.
const IMAGE_ID_FIELDS = [
  'headerLogoId',
  'faviconLogoId',
  'menuLogoId',
] as const;
const IMAGE_FIELDS = [...IMAGE_ID_FIELDS, 'sidebarLogos'] as const;

// Felder, die bewusst nie aus einer Datei übernommen werden (kein Hinweis nötig)
const IGNORED_FIELDS = new Set([
  'id',
  'tenantId',
  'createdAt',
  'updatedAt',
  'headerLogo',
  'menuLogo',
  'logo',
  // veraltete DB-Spalte (nicht mehr im Typ), steckt aber in älteren Exporten
  'barChartAxisLabelColor',
]);

// Bei diesen Feldern ist `null` ein echter Wert. Bei allen anderen heißt `null`
// "nicht gesetzt": der aktuelle Wert bleibt erhalten.
const NULLABLE_FIELDS = new Set<string>([
  'headerLogoLinkUrl',
  ...IMAGE_ID_FIELDS,
]);

const MAX_TEXT = 500;
const MAX_CSS = 100_000;
const MAX_COLOR_LIST = 50;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLOR_REGEX =
  /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|transparent|(rgb|rgba|hsl|hsla)\([0-9.,%\s/-]+\))$/i;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isUuid = (v: unknown): v is string =>
  typeof v === 'string' && UUID_REGEX.test(v);
const isColor = (v: unknown): v is string =>
  typeof v === 'string' && COLOR_REGEX.test(v);

// --- Regeln: liefern fertige Fehlermeldungen inkl. Feldname (leer = gültig) ---
type Rule = (value: unknown, key: string) => string[];

const rule =
  (isValid: (v: unknown) => boolean, message: string): Rule =>
  (v, key) =>
    isValid(v) ? [] : [`${key}: ${message}`];

const colorRule = rule(isColor, 'keine gültige Farbe.');
const colorListRule = rule(
  (v) => Array.isArray(v) && v.length <= MAX_COLOR_LIST && v.every(isColor),
  'Liste gültiger Farben erwartet.',
);
const booleanRule = rule((v) => typeof v === 'boolean', 'true/false erwartet.');
const textRule = (max: number): Rule =>
  rule(
    (v) => typeof v === 'string' && v.length <= max,
    `Text (max. ${max} Zeichen) erwartet.`,
  );
const uuidRule = rule(isUuid, 'UUID oder null erwartet.');
const oneOfRule = (allowed: string[]): Rule =>
  rule(
    (v) => typeof v === 'string' && allowed.includes(v),
    `erlaubt: ${allowed.join(' / ')}`,
  );

// fontFamily wird ungeprüft in ein <style> der Layouts geschrieben (CSS-Injection),
// darum nur die Werte aus dem Dropdown.
const fontFamilyRule = oneOfRule(Object.values(fontFamilyEnum));
const arrowDirectionRule = oneOfRule(Object.values(menuArrowDirectionEnum));

// Link des Header-Logos: leer, relativer Pfad ("/x") oder http(s)-URL.
// Kein "javascript:", "data:" etc. und kein protokoll-relatives "//host".
const isSafeLinkUrl = (v: unknown): boolean => {
  if (typeof v !== 'string') return false;
  if (v === '' || /^\/(?![/\\])\S*$/.test(v)) return true;
  try {
    return ['http:', 'https:'].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};
const linkUrlRule = rule(
  (v) => isSafeLinkUrl(v) && (v as string).length <= MAX_TEXT,
  'http(s)-URL oder relativer Pfad erwartet.',
);

const LOGO_TEXT_FIELDS = ['logoName', 'format', 'size'] as const;
// Obergrenzen = Spaltentypen in der DB (logo_height/logo_width: smallint, order: integer)
const LOGO_INT_FIELDS = {
  logoHeight: 32767,
  logoWidth: 32767,
  order: 2147483647,
} as const;
const DATA_IMAGE_REGEX =
  /^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/i;

const isIntBetween = (v: unknown, max: number): boolean =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max;

const sidebarLogosRule: Rule = (value, key) => {
  if (!Array.isArray(value)) return [`${key}: muss eine Liste sein.`];

  const errors: string[] = [];
  const seenIds = new Set<string>();
  value.forEach((entry, i) => {
    const at = `${key}[${i}]`;
    if (!isPlainObject(entry)) {
      errors.push(`${at}: muss ein Objekt sein.`);
      return;
    }
    // UUIDs sind case-insensitive: "ABC…" und "abc…" sind dieselbe ID
    if (!isUuid(entry.id)) errors.push(`${at}.id: keine gültige UUID.`);
    else if (seenIds.has(entry.id.toLowerCase()))
      errors.push(`${at}.id: doppelt vorhanden.`);
    else seenIds.add(entry.id.toLowerCase());

    if (typeof entry.logo !== 'string' || !DATA_IMAGE_REGEX.test(entry.logo))
      errors.push(`${at}.logo: Bild als "data:image/…;base64,…" erforderlich.`);
    for (const f of LOGO_TEXT_FIELDS) {
      const v = entry[f];
      if (typeof v !== 'string' || (f === 'logoName' && v.trim() === ''))
        errors.push(`${at}.${f}: Text erforderlich.`);
    }
    for (const [f, max] of Object.entries(LOGO_INT_FIELDS)) {
      if (!isIntBetween(entry[f], max))
        errors.push(`${at}.${f}: Ganzzahl von 0 bis ${max} erforderlich.`);
    }
  });
  return errors;
};

// Übernimmt nur bekannte Felder; Logos gehören immer dem aktuellen Mandanten,
// nie dem Mandanten aus der Datei.
const normalizeSidebarLogos = (
  logos: Record<string, unknown>[],
  tenantId: string | undefined,
): SidebarLogo[] =>
  logos.map((l) => ({
    id: l.id as string,
    tenantId: tenantId as string,
    logo: l.logo as string,
    logoName: l.logoName as string,
    logoHeight: l.logoHeight as number,
    logoWidth: l.logoWidth as number,
    order: l.order as number,
    format: l.format as string,
    size: l.size as string,
  }));

// Farben, die nur als style-Objekt verwendet werden (React setzt sie per CSSOM): ein
// ungültiger Wert wird übersprungen (aktueller Wert bleibt) statt den Import abzubrechen.
// Bsp.: DEFAULT_CI enthält "#FFFFF" (5 Ziffern). Streng bleiben nur Felder, die in ein
// <style> interpoliert werden: dort wäre ein ungeprüfter Wert eine CSS-Injection.
const STRICT_COLOR_FIELDS = new Set<string>([
  'scrollbarBackground',
  'scrollbarColor',
]);
const SKIPPABLE_FIELDS = new Set<string>([
  ...COLOR_FIELDS.filter((k) => !STRICT_COLOR_FIELDS.has(k)),
  ...COLOR_LIST_FIELDS,
]);

// Schema: Feldname -> Regel. Die Schlüssel sind gleichzeitig die Whitelist.
const forAll = (keys: readonly string[], r: Rule): Record<string, Rule> =>
  Object.fromEntries(keys.map((k) => [k, r]));

// Map statt Objekt: bei einem Objekt würden Schlüssel wie "constructor" oder "__proto__"
// aus dem Prototyp als Regel gefunden.
const RULES = new Map<string, Rule>(
  Object.entries({
    ...forAll(COLOR_FIELDS, colorRule),
    ...forAll(TEXT_FIELDS, textRule(MAX_TEXT)),
    ...forAll(COLOR_LIST_FIELDS, colorListRule),
    ...forAll(BOOLEAN_FIELDS, booleanRule),
    ...forAll(IMAGE_ID_FIELDS, uuidRule),
    cssStyleInjectionValue: textRule(MAX_CSS),
    headerLogoLinkUrl: linkUrlRule,
    fontFamily: fontFamilyRule,
    menuArrowDirection: arrowDirectionRule,
    sidebarLogos: sidebarLogosRule,
  }),
);

export const THEME_FIELD_KEYS: string[] = [...RULES.keys()];

export type ThemeParseResult = {
  /** validierte, bereinigte Felder (nur Whitelist, keine id/tenantId) */
  theme: Record<string, unknown>;
  errors: string[];
  warnings: string[];
};

/**
 * Parst und validiert den Inhalt einer Theme-Datei. Wirft nie.
 * Ist `errors` nicht leer, darf nichts importiert werden.
 * - unbekannte Felder werden verworfen (Warnung), Identitätsfelder still
 * - fehlende Felder bleiben unverändert
 */
export function parseThemeFile(
  text: string,
  tenantId?: string,
): ThemeParseResult {
  const theme: Record<string, unknown> = {};
  const errors: string[] = [];
  const warnings: string[] = [];
  const fail = (message: string): ThemeParseResult => ({
    theme,
    errors: [message],
    warnings,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    return fail('Die Datei enthält kein gültiges JSON.');
  }
  if (!isPlainObject(parsed))
    return fail('Die Datei muss ein JSON-Objekt enthalten.');

  const unknownKeys: string[] = [];
  const skippedColors: string[] = [];
  for (const [key, value] of Object.entries(parsed)) {
    const keyRule = RULES.get(key);
    if (!keyRule) {
      if (!IGNORED_FIELDS.has(key)) unknownKeys.push(key);
      continue;
    }
    if (value === null) {
      if (NULLABLE_FIELDS.has(key)) theme[key] = null;
      continue;
    }

    const problems = keyRule(value, key);
    if (problems.length > 0) {
      if (SKIPPABLE_FIELDS.has(key)) skippedColors.push(key);
      else errors.push(...problems);
      continue;
    }

    let result = value;
    if (key === 'sidebarLogos') {
      result = normalizeSidebarLogos(
        value as Record<string, unknown>[],
        tenantId,
      );
    } else if (key === 'cssStyleInjectionValue') {
      // gleicher Filter wie beim Rendern in den Layouts: Unzulässiges wird entfernt
      result = sanitizeCSSInjection(value as string);
      if (result !== (value as string).trim())
        warnings.push(
          'cssStyleInjectionValue: unzulässige oder umformatierte Teile wurden entfernt.',
        );
    }
    theme[key] = result;
  }

  if (unknownKeys.length > 0)
    warnings.push(
      `Unbekannte Felder wurden ignoriert: ${unknownKeys.join(', ')}`,
    );
  if (skippedColors.length > 0)
    warnings.push(
      `Ungültige Farbwerte wurden übersprungen (aktueller Wert bleibt): ${skippedColors.join(', ')}`,
    );
  if (errors.length === 0 && Object.keys(theme).length === 0)
    errors.push(
      skippedColors.length > 0
        ? 'Die Datei enthält keine gültigen Theme-Werte.'
        : 'Die Datei enthält keine bekannten Theme-Felder.',
    );

  return { theme, errors, warnings };
}

/** Entfernt aus einem Theme alle Bild-Felder ("ohne Bilder"). */
export function omitImageFields(
  theme: Record<string, unknown>,
): Record<string, unknown> {
  const copy = { ...theme };
  for (const k of IMAGE_FIELDS) delete copy[k];
  return copy;
}

/** Erzeugt die Export-Daten: nur Whitelist-Felder, ohne id/tenantId; Bilder optional. */
export function buildThemeExport(
  corporateInfo: object | undefined,
  withImages: boolean,
): Record<string, unknown> {
  const source = (corporateInfo ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of THEME_FIELD_KEYS) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return withImages ? out : omitImageFields(out);
}
