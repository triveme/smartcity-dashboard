import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import { Report, reports } from '@app/postgres-db/schemas/report.schema';
import { eq } from 'drizzle-orm';

export function getReport(title?: string): Report {
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
    imgPath: '/images/test.png',
    startAt: new Date(),
    endAt: new Date(),
    contactPerson: 'Test User',
    county: 'Steinbach',
    comment: 'This is just a testing entity',
    adminComment: 'This is just a testing entity, commented by admin.',
    lastModifiedBy: 'Admin User',
    redirection: 'Not yet planned',
    address: 'Unter Muehle 1',
    referenceNumber: 'AD-227529',
    email: 'test@test.com',
    phone: '+1 555 728',
    writeRoles: [],
    readRoles: [],
    visibility: 'public',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createReportByObject(
  dbClient: DbType,
  report: Report,
): Promise<Report> {
  report.id = uuid();

  const createdReports = await dbClient
    .insert(reports)
    .values(report)
    .returning();

  return createdReports.length > 0 ? createdReports[0] : null;
}

export async function getReportFromDb(
  dbClient: DbType,
  id: string,
): Promise<Report> {
  const createdReports = await dbClient
    .select()
    .from(reports)
    .where(eq(reports.id, id));

  return createdReports.length > 0 ? createdReports[0] : null;
}
