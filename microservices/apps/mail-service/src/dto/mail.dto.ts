export class SendMailDto {
  to: string;
  subject: string;
  body: string;
}

export class DefectReportDto {
  reporterEmail: string;
  defectDetails: string;
}
