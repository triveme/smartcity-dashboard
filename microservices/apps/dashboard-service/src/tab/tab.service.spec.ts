import { HttpException, HttpStatus } from '@nestjs/common';
import { NewTab, Tab } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { TabService } from './tab.service';

describe('TabService map popup decimal places', () => {
  const persistedTab = {
    id: 'map-tab',
    componentType: 'Karte',
    mapPopupDecimalPlaces: 2,
  } as Tab;
  const tabRepo = {
    create: jest.fn().mockResolvedValue(persistedTab),
    update: jest.fn().mockResolvedValue(persistedTab),
  };
  const service = new TabService(
    {} as never,
    tabRepo as never,
    {} as never,
    {} as never,
  );
  const mapTab: NewTab = {
    componentType: 'Karte',
    mapLatitude: 50,
    mapLongitude: 7,
  };

  beforeEach(() => jest.clearAllMocks());

  it.each([undefined, null, 0, 2, 10])(
    'passes precision %s through creation and update',
    async (mapPopupDecimalPlaces) => {
      const values = { ...mapTab, mapPopupDecimalPlaces };

      await expect(service.create(values)).resolves.toBe(persistedTab);
      expect(tabRepo.create).toHaveBeenCalledWith(values, undefined);
      await expect(service.update('map-tab', values)).resolves.toBe(
        persistedTab,
      );
      expect(tabRepo.update).toHaveBeenCalledWith('map-tab', values, undefined);
    },
  );

  it.each([-1, 0.5, 11, NaN, Infinity, '3'])(
    'rejects invalid precision %s before persistence',
    async (mapPopupDecimalPlaces) => {
      const values = { ...mapTab, mapPopupDecimalPlaces } as NewTab;
      const error = new HttpException(
        'Map popup decimal places must be an integer between 0 and 10',
        HttpStatus.BAD_REQUEST,
      );

      await expect(service.create(values)).rejects.toEqual(error);
      await expect(service.update('map-tab', values)).rejects.toEqual(error);
      expect(tabRepo.create).not.toHaveBeenCalled();
      expect(tabRepo.update).not.toHaveBeenCalled();
    },
  );

  it('does not overwrite popup precision in unrelated partial updates', async () => {
    const values = { mapAllowPopups: true };

    await service.update('map-tab', values);

    expect(tabRepo.update).toHaveBeenCalledWith('map-tab', values, undefined);
  });
});
