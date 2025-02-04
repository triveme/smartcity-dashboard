import {
  generalSettings,
  GeneralSettings,
} from '@app/postgres-db/schemas/general-settings.schema';
import { v4 as uuid } from 'uuid';
import { DbType } from '@app/postgres-db';

export function getGeneralSetting(tenant: string): GeneralSettings {
  return {
    id: uuid(),
    tenant: tenant,
    information: 'https://test.de/information.html',
    imprint: 'https://test.de/imprint.html',
    privacy: 'https://test.de/privacy.html',
    allowThemeSwitching: false,
    disclaimer: 'Test Disclaimer',
  };
}

export async function createGeneralSettingsByObject(
  dbClient: DbType,
  generalSettingValue: GeneralSettings,
): Promise<GeneralSettings> {
  const result = await dbClient
    .insert(generalSettings)
    .values(generalSettingValue)
    .returning();

  return result.length > 0 ? result[0] : null;
}
