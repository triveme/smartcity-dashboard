import { PipeTransform, Injectable } from '@nestjs/common';
import { WidgetWithChildren } from '../widget/widget.service';
import { SanitizeTabDataPipe } from './tab-validator.pipe';
import { ValidateWidgetPipe } from './widget-validator.pipe';
import { SanitizeQueryConfigPipe } from './queryConfig-validator.pipe';

@Injectable()
export class ValidateWidgetWithChildrenPipe implements PipeTransform {
  transform(data: Partial<WidgetWithChildren>): Partial<WidgetWithChildren> {
    const result: Partial<WidgetWithChildren> = {};
    const tab = data.tab;
    const widget = data.widget;
    const queryConfig = data.queryConfig;
    new ValidateWidgetPipe().transform(widget);
    const validatedTab = new SanitizeTabDataPipe().transform(tab);
    result.tab = validatedTab;
    result.widget = widget;
    if (
      data.queryConfig &&
      tab.componentType !== 'Informationen' &&
      tab.componentType !== 'Bild' &&
      tab.componentType !== 'iFrame'
    ) {
      const validatedQueryConfig = new SanitizeQueryConfigPipe().transform({
        ...queryConfig,
        componentType: validatedTab.componentType,
        componentSubType: validatedTab.componentSubType,
      });
      result.queryConfig = validatedQueryConfig;
    }
    return data;
  }
}
