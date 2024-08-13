import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import {
  ClimateProject,
  climateProjects,
} from '@app/postgres-db/schemas/climate-project.schema';

export function getClimateProject(title?: string): ClimateProject {
  title = title ? title : 'Test Climate Project';

  return {
    id: '',
    title: title,
    link: 'https://test.at',
    costsInCents: 1000,
    location: {
      lat: 9.444,
      lng: -9.444,
    },
    category: 'test',
    description: 'test description',
    imgPath: null,
    startAt: new Date(),
    endAt: new Date(),
    locationText: 'Hünfeld',
    timeHorizon: 'shortterm',
    responsible: 'Responsible User',
    writeRoles: [],
    readRoles: [],
    visibility: 'public',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createClimateProjectByObject(
  dbClient: DbType,
  climateProject: ClimateProject,
): Promise<ClimateProject> {
  climateProject.id = uuid();

  const createdClimateProjects = await dbClient
    .insert(climateProjects)
    .values(climateProject)
    .returning();

  return createdClimateProjects.length > 0 ? createdClimateProjects[0] : null;
}
