import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [DataService, AuthService],
  exports: [DataService],
  imports: [HttpModule],
})
export class DataModule {}
