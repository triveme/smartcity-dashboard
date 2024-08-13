import {
  DataModel,
  dataModels,
} from '@app/postgres-db/schemas/data-model.schema';
import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';

export function getDataModel(): DataModel {
  return {
    id: uuid(),
    model: {
      name: 'Dummy interesting place',
      types: ['Art', 'History'],
      address: {
        addressLocality: 'City',
        postalCode: '12345',
        streetAddress: 'Examplestreet 123',
      },
      image: 'https://example.com/image.jpg',
      imagePreview: 'https://example.com/image-preview.jpg',
      creator: 'John Doe',
      location: {
        type: 'Point',
        coordinates: [50.1234, 7.5678],
      },
      info: 'Ein Beispieltext mit Informationen über den Ort.',
      zoomprio: 'High',
    },
  };
}

export async function createDataModel(db: DbType): Promise<DataModel> {
  const createdDataModels = await db
    .insert(dataModels)
    .values(getDataModel())
    .returning();

  return createdDataModels.length > 0 ? createdDataModels[0] : null;
}
