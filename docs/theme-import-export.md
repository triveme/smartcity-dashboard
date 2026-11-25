# Theme Import / Export (Corporate Identity)

Admins can export the current theme of a tenant to a JSON file and import such a file again,
for example to copy a look between tenants or to keep a backup.

**Where:** Admin → *Corporate Identity* → tab **Import/Export**.

**Source of truth for the allowed fields and rules:** `frontend/utils/themeSchema.ts`.

## Quick overview

| | Export | Import |
|---|---|---|
| Format | JSON (UTF-8, indented) | JSON (UTF-8, a BOM is tolerated) |
| Scope | The theme **as saved in the database** | Any subset of the allowed fields |
| Images | Checkbox *Mit Bilder exportieren* | Checkbox *Mit Bilder importieren* (set **before** choosing the file) |
| Identity fields (`id`, `tenantId`) | never written | never read |
| Effect | Downloads a file | Changes the wizard only. **Click *Speichern* to persist.** |

## Export

1. Optional: untick *Mit Bilder exportieren*.
2. Click *Theme exportieren*, enter a file name, click *Herunterladen*.

- Only whitelisted theme fields are written. Never exported: `id`, `tenantId`, `createdAt`,
  `updatedAt`, `headerLogo`, `menuLogo`, the legacy `logo` column and any unknown column.
- **With images** the file also contains `headerLogoId`, `faviconLogoId`, `menuLogoId` and
  `sidebarLogos` (full entries including the Base64 image). **Without images** these four keys
  are missing from the file.
- Unsaved edits in the wizard are **not** exported (the saved theme is used).
- File name: the `.json` ending is added automatically; characters `\ / : * ? " < > |` and
  control characters become `_`, leading dots are removed, maximum 100 characters, an empty
  name falls back to `corporate-identity-theme`.

## Import

1. Decide on *Mit Bilder importieren* (visible only while no file is selected).
2. Click *Theme importieren*, choose the file, click *Hochladen*.
3. A green message confirms the import. **Click *Speichern*** to write it to the database;
   until then the page still shows the old saved theme.

### What an import does

- **Partial files are fine.** A field that is missing in the file keeps its current value.
- A `null` value means "not set" and also keeps the current value. Exceptions where `null` is a
  real value: `headerLogoLinkUrl`, `headerLogoId`, `faviconLogoId`, `menuLogoId` (they clear the field).
- **Unknown fields** are ignored; a yellow hint lists them. `id`, `tenantId`, `createdAt`,
  `updatedAt`, `headerLogo`, `menuLogo`, `logo` and the legacy `barChartAxisLabelColor` are
  ignored silently.
- **Invalid colours are skipped** with a hint (the current value stays), they do not abort the import.
- **Any other invalid value aborts the whole import** (red message with up to 3 reasons,
  nothing is changed).
- A file without any usable field is rejected.

### Images

| Checkbox | Behaviour |
|---|---|
| **on** | Images in the file **replace** the current ones completely: `headerLogoId`, `faviconLogoId`, `menuLogoId` and the whole `sidebarLogos` list. A key that is **missing** in the file leaves that image untouched; an explicit `null` / `[]` clears it. |
| **off** | All image fields in the file are ignored. Current images stay unchanged. If the file contains **only** images, nothing is imported and a hint says so. |

Images are referenced **by ID**: `headerLogoId`, `faviconLogoId` and `menuLogoId` must be the UUID
of a logo that already exists in the database. Entries of `sidebarLogos` additionally carry the
image itself. `tenantId` inside `sidebarLogos` is always replaced by the current tenant.

## Allowed values

| Field type | Rule |
|---|---|
| Colours (e.g. `headerPrimaryColor`) | `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `transparent`, `rgb()/rgba()/hsl()/hsla()` with plain numbers. No names (`red`), no `var()`, no `url()`. |
| `scrollbarBackground`, `scrollbarColor` | Same format, but **strict**: an invalid value aborts the import (these values are written into a `<style>` element). |
| Colour lists (`*CurrentValuesColors`, `measurementChartCardsIconColors`) | Array of up to 50 valid colours. One bad entry skips the whole list. |
| Text / sizes (`*FontSize`, `*BorderRadius`, titles, …) | String, max. 500 characters. |
| `fontFamily` | Only the dropdown values: Helvetica, Arial, Verdana, Tahoma, Gill Sans, Times New Roman, Georgia, Palatino, Courier, Lucida, Monaco. |
| `headerLogoLinkUrl` | Empty, a relative path (`/x`) or an `http(s)` URL. No `javascript:`, `data:` or `//host`. |
| `menuArrowDirection` | One of the values of `menuArrowDirectionEnum` (e.g. `Oben \| Unten`). |
| Booleans (`showHeaderLogo`, `isPanelHeadlineBold`, …) | `true` / `false` only. |
| `cssStyleInjectionValue` | Max. 100 000 characters. Run through the same sanitizer as the layouts; removed parts are reported as a hint. |
| `sidebarLogos[]` | `id` (unique UUID, case-insensitive), `logo` (`data:image/<type>;base64,…`), `logoName` (non-empty), `format`, `size` (text), `logoHeight`/`logoWidth` (integer 0–32767), `order` (integer ≥ 0). |

## Not allowed / limitations

- Changing the identity of the theme: `id` and `tenantId` in the file have no effect.
- Executable or external content in colours, `fontFamily`, links and logos (see table).
- Images that do not exist in the database: saving fails at the database (foreign key).
  Image IDs of another tenant are not rejected by the frontend; the backend does not check them either.
- The Logo tab shows the saved images. Opening it **before** *Speichern* can reset header and
  sidebar logos to the saved state.
- The CSS sanitizer is the existing `sanitizeCSSInjection`. Known gaps: protocol-relative
  `<link href="//host/…">`, `@import` and `url()` to external hosts are not removed, and very
  large inputs (~100 KB) take a few seconds to process.
- All checks run in the browser. They are a convenience and a first line of defence, not a
  replacement for validation in the backend.

## Example file

```json
{
  "titleBar": "Pastel",
  "headerPrimaryColor": "#BDB2FF",
  "headerFontColor": "#3B3355",
  "fontFamily": "Arial",
  "pieChartCurrentValuesColors": ["#A0C4FFff", "#FFADADff", "#BDB2FFff"],
  "showHeaderLogo": true
}
```

## Code

| File | Purpose |
|---|---|
| `frontend/utils/themeSchema.ts` | Field whitelist, validation rules, `parseThemeFile`, `buildThemeExport`, `omitImageFields` |
| `frontend/ui/Buttons/ThemeUploadButton.tsx` | Import UI and flow |
| `frontend/ui/Buttons/ThemeDowloadButton.tsx` | Export UI and flow |
| `frontend/utils/downloadHelper.ts` | `downloadThemeJSON`, `sanitizeFileName` |
| `frontend/components/Wizards/ImportExportCiWizard.tsx` | Wires both buttons into the wizard |
| `frontend/app/(dashboard)/[tenant]/admin/corporateidentity/page.tsx` | Wizard state and *Speichern* (PATCH `/corporate-infos/:id`) |
