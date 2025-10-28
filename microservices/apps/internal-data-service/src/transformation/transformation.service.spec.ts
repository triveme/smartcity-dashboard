import { TransformationService } from './transformation.service';

describe('TransfomrationServiceTest CSV Time Parser', () => {
  const service = new TransformationService();

  it('parse year explizit', () => {
    const resultG = service.convertMetaToTimeIndex({
      Jahr: 2020,
    });
    const resultE = service.convertMetaToTimeIndex({
      Year: 2020,
    });
    const expecteds = ['2020-01-01T11:00:00.000Z', '2020-01-01T12:00:00.000Z'];
    expect(expecteds).toContain(resultG);
    expect(expecteds).toContain(resultE);
  });
  it('parse year and month explizit', () => {
    const resultG = service.convertMetaToTimeIndex({
      Jahr: 2020,
      Monat: 8,
    });
    const resultE = service.convertMetaToTimeIndex({
      Year: 2020,
      Month: 8,
    });
    const expecteds = ['2020-08-01T10:00:00.000Z', '2020-08-01T12:00:00.000Z'];
    expect(expecteds).toContain(resultG);
    expect(expecteds).toContain(resultE);
  });
  it('parse timestamp', () => {
    const timeInputs = [
      '13.02.2025', // 2025-02-13T11:00:00.000Z
      '13/02/2025', // 2025-02-13T11:00:00.000Z
      '13-02-2025', // 2025-02-13T11:00:00.000Z
      '2025.02.13', // 2025-02-13T11:00:00.000Z
      '2025-02-13', // 2025-02-13T11:00:00.000Z
      '2025/02/13', // 2025-02-13T11:00:00.000Z
      '2025-02-13', // 2025-02-13T11:00:00.000Z
    ];

    const results = timeInputs.map((input) => {
      return service.convertMetaToTimeIndex({
        '': input,
      });
    });
    const expecteds = ['2025-02-13T11:00:00.000Z', '2025-02-13T12:00:00.000Z'];
    results.forEach((r) => {
      expect(expecteds).toContain(r);
    });

    const result = service.convertMetaToTimeIndex({
      '': '13.02.2025',
    });
    const resultG = service.convertMetaToTimeIndex({
      Zeit: '13.02.2025',
    });
    const resultE = service.convertMetaToTimeIndex({
      Time: '2025.02.13',
    });
    const resultE2 = service.convertMetaToTimeIndex({
      Time: '2025-02-13',
    });
    expect(expecteds).toContain(result);
    expect(expecteds).toContain(resultG);
    expect(expecteds).toContain(resultE);
    expect(expecteds).toContain(resultE2);
  });
  it('parse incomplete timestamp', () => {
    const timeInputs = [
      '05.2025', // 2025-05-01T10:00:00.000Z
      '05/2025', // 2025-05-01T10:00:00.000Z
      '2025.05', // 2025-05-01T10:00:00.000Z
      '2025/05', // 2025-05-01T10:00:00.000Z
      '2025-05', // 2025-05-01T10:00:00.000Z
    ];
    const results = timeInputs.map((input) => {
      return service.convertMetaToTimeIndex({
        '': input,
      });
    });
    const expecteds = ['2025-05-01T10:00:00.000Z', '2025-05-01T12:00:00.000Z'];

    results.forEach((r) => {
      expect(expecteds).toContain(r);
    });
  });
  it('parse year only timestamp', () => {
    const timeInputs = [
      '2025', // 2025-01-01T10:00:00.000Z
    ];
    const results = timeInputs.map((input) => {
      return service.convertMetaToTimeIndex({
        '': input,
      });
    });
    const expecteds = ['2025-01-01T11:00:00.000Z', '2025-01-01T12:00:00.000Z'];
    results.forEach((r) => {
      expect(expecteds).toContain(r);
    });
  });
  it('parse full timestamp', () => {
    const timeInputs = [
      '13.01.2025 15:30', // 2025-01-13T14:30:00.000Z
      '13-01-2025 15:30', // 2025-01-13T14:30:00.000Z
      '13/01/2025 15:30', // 2025-01-13T14:30:00.000Z
      '13.01.2025T15:30', // 2025-01-13T14:30:00.000Z
      '13-01-2025T15:30', // 2025-01-13T14:30:00.000Z
      '13/01/2025T15:30', // 2025-01-13T14:30:00.000Z
      '2025.01.13 15:30', // 2025-01-13T14:30:00.000Z
      '2025.01.13T15:30', // 2025-01-13T14:30:00.000Z
      '2025-01-13 15:30', // 2025-01-13T14:30:00.000Z
      '2025-01-13T15:30', // 2025-01-13T14:30:00.000Z
      '2025/01/13 15:30', // 2025-01-13T14:30:00.000Z
      '2025/01/13T15:30', // 2025-01-13T14:30:00.000Z
    ];
    const results = timeInputs.map((input) => {
      return service.convertMetaToTimeIndex({
        '': input,
      });
    });
    const expecteds = ['2025-01-13T14:30:00.000Z', '2025-01-13T15:30:00.000Z'];
    results.forEach((r) => {
      expect(expecteds).toContain(r);
    });
  });
  it('parse year range', () => {
    const timeInputs = [
      '2015-2024', // 2015-01-01T11:00:00.000Z';
      '2015-2005', // 2015-01-01T11:00:00.000Z';
      '2015-2015', // 2015-01-01T11:00:00.000Z';
      '2015', // 2015-01-01T11:00:00.000Z';
    ];
    const results = timeInputs.map((input) => {
      return service.convertMetaToTimeIndex({
        Jahr: input,
      });
    });
    const expecteds = ['2015-01-01T11:00:00.000Z', '2015-01-01T12:00:00.000Z'];
    results.forEach((r) => {
      expect(expecteds).toContain(r);
    });
  });
  it('timestamp use over explicit', () => {
    const result = service.convertMetaToTimeIndex({
      Time: 2022,
      Jahr: 2020,
      Monat: 8,
    });
    const expecteds = ['2022-01-01T11:00:00.000Z', '2022-01-01T12:00:00.000Z'];
    expect(expecteds).toContain(result);
  });
  it('get label', () => {
    const result1 = service.convertMetaToTimeLabel({
      Jahr: 2022,
      Quartal: 'Q1',
    });
    const result2 = service.convertMetaToTimeLabel({
      Jahr: '2015-2024',
    });
    const expected1 = 'Jahr: 2022, Quartal: Q1';
    expect(result1).toBe(expected1);
    const expected2 = 'Jahr: 2015-2024';
    expect(result2).toBe(expected2);
  });
});
