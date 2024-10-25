import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto, DefectReportDto } from './dto/mail.dto';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('send')
  async sendMail(@Body() sendMailDto: SendMailDto): Promise<string> {
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
