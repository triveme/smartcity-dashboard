import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto, DefectReportDto } from './dto/mail.dto';
import { Public } from '@app/auth-helper/PublicDecorator';
import { AuthenticatedRequest } from '@app/auth-helper';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('send')
  async sendMail(
    @Body() sendMailDto: SendMailDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() request: AuthenticatedRequest,
  ): Promise<string> {
    try {
      await this.mailService.sendAutomatedMail(sendMailDto);
      return 'Mail sent successfully';
    } catch (error) {
      throw new HttpException(
        'Failed to send mail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('defect-report')
  async sendDefectReport(
    @Body() defectReportDto: DefectReportDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() request: AuthenticatedRequest,
  ): Promise<string> {
    try {
      await this.mailService.sendDefectReport(defectReportDto);
      return 'Defect report submitted successfully';
    } catch (error) {
      throw new HttpException(
        'Failed to submit defect report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
