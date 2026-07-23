import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlanBarService } from './data.service';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [PlanBarService, AuthService],
  exports: [PlanBarService],
  imports: [HttpModule],
})
export class DataModule {}
