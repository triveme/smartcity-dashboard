import { parseCsvToJson } from './csv-parser';
import { csvInput1, csvInput2 } from './csv-parser-test-data';

describe('CSVParserTest', () => {
  it('should parse csv to json 1', () => {
    const result = parseCsvToJson(csvInput1, 4, 2, 0, 2);

    expect(result.length).toBe(2);
    expect(result[0].Values.length).toBe(9);
    expect(result[0].Descriptions).toStrictEqual(['Main-Kinzig-Kreis']);
    expect(result[0].Id).toBe('6435000');
    expect(result.length).toBe(2);
    expect(result[1].Values.length).toBe(9);
    expect(result[1].Descriptions).toStrictEqual(['Bad Orb, Stadt']);
    expect(result[1].Id).toBe('6435001');
  });

  it('should parse csv to json 2', () => {
    const result = parseCsvToJson(csvInput2, 4, 2, 0, 2);

    expect(result.length).toBe(30);
  });

  it('includes all metadata rows dynamically', () => {
    const result = parseCsvToJson(csvInput1, 4, 2, 0, 2);
    const first = result[0].Values[0].Meta;
    expect(first).toHaveProperty('Geschlecht');
    expect(first).toHaveProperty('Altersklasse');
  });
  it('includes all time rows dynamically', () => {
    const result = parseCsvToJson(csvInput1, 4, 2, 0, 2);
    const first = result[0].Values[0].Time;
    expect(first).toHaveProperty('Jahr');
    expect(first).toHaveProperty('Quartal');
  });
});
