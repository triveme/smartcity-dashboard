import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Widget } from '@app/postgres-db/schemas';

@Injectable()
export class ValidateWidgetPipe implements PipeTransform {
  transform(widget: Widget): Partial<Widget> {
    const errorsOccured: string[] = [];
    if (!widget.name) errorsOccured.push('Name muss ausgefüllt werden!');
    if (widget.height && widget.height < 400)
      errorsOccured.push('Die Höhe muss 400 oder mehr betragen!');
    if (widget.visibility === 'protected') {
      if (widget.readRoles.length === 0)
        errorsOccured.push('Leserechte müssen ausgefüllt werden!');
      if (widget.writeRoles.length === 0)
        errorsOccured.push('Schreibberechtigungen müssen ausgefüllt sein!');
    }
    if (errorsOccured.length > 0) {
      throw new HttpException(
        `Errors in widget: ${JSON.stringify(errorsOccured)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return widget;
  }
}
