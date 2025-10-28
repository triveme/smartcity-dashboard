export type Meta = Record<string, string | number>;

export interface ValueEntry {
  Meta: Meta;
  Time: Meta;
  Value: string | number;
}

export interface OutputEntry {
  Id: string;
  Descriptions: string[];
  Values: ValueEntry[];
}

export function parseCsvToJson(
  csvString: string,
  dataStartLine: number,
  timeGroupLineCount: number,
  idColumnIndex: number,
  firstValueColumnIndex: number,
): OutputEntry[] {
  const rows = csvString
    .trim()
    .split('\n')
    .map((line) => line.split(';'));
  const metaRows = rows.slice(0, dataStartLine);
  const timeGroupRows = metaRows.slice(0, timeGroupLineCount);
  const metaDataRows = metaRows.slice(timeGroupLineCount);
  const dataRows = rows.slice(dataStartLine);

  const colCount = rows[0].length;
  const result: OutputEntry[] = [];

  for (const dataRow of dataRows) {
    const id = dataRow[idColumnIndex];
    const descriptions = dataRow.slice(
      idColumnIndex + 1,
      firstValueColumnIndex,
    );
    const values: ValueEntry[] = [];

    for (let col = firstValueColumnIndex; col < colCount; col++) {
      const valueRaw = dataRow[col]?.trim();
      const value = valueRaw;

      const meta: Meta = {};
      for (const metaRow of metaDataRows) {
        const key = metaRow[0]?.trim();
        const valRaw = metaRow[col]?.trim();
        const val = valRaw && !isNaN(Number(valRaw)) ? Number(valRaw) : valRaw;
        if (key && val !== undefined) {
          meta[key] = val;
        }
      }

      const timeGroup: Meta = {};
      for (const timeRow of timeGroupRows) {
        const key = timeRow[0]?.trim();
        const valRaw = timeRow[col]?.trim();
        const val = valRaw && !isNaN(Number(valRaw)) ? Number(valRaw) : valRaw;
        if (key && val !== undefined) {
          timeGroup[key] = val;
        }
      }

      values.push({
        Meta: meta,
        Time: timeGroup,
        Value: value,
      });
    }

    result.push({
      Id: id,
      Descriptions: descriptions,
      Values: values,
    });
  }

  return result;
}
