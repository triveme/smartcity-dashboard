import { Module } from '@nestjs/common';
import { QueryConfigService } from './query-config.service';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [QueryConfigService, AuthService],
})
export class QueryConfigModule {}
