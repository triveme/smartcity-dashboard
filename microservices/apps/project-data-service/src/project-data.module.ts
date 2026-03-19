import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { ScheduleModule } from '@nestjs/schedule';
import { DataModule } from '../../ngsi-service/src/data/data.module';
import { QueryModule } from '../../ngsi-service/src/query/query.module';
import { ConfigModule } from '@nestjs/config';
import { AuthHelperUtility, AuthHelperMiddleware } from '@app/auth-helper';
import { ProjectDataService } from './project-data.service';
import { ProjectDataController } from './project-data.controller';
import { DataService } from './data/data.service';
import { PictureDataService } from './picture-data.service';
import { InternalPictureDataService } from './data/picture.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    PostgresDbModule,
    DataModule,
    ScheduleModule.forRoot(),
    QueryModule,
  ],
  controllers: [ProjectDataController],
  providers: [
    ProjectDataService,
    PictureDataService,
    InternalPictureDataService,
    AuthHelperUtility,
    DataService,
  ],
})
export class ProjectDataModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'project*', method: RequestMethod.POST }, // Protect all methods in the "general-settings" route
      { path: 'project*', method: RequestMethod.PATCH }, // Protect all methods in the "general-settings" route
      { path: 'project*', method: RequestMethod.DELETE }, // Protect all methods in the "general-settings" route
    );
  }
}
