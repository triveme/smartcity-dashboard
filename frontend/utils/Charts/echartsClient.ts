'use client';

import * as echarts from 'echarts';
// @ts-expect-error echarts locale has no typings
import deLocale from 'echarts/lib/i18n/langDE';

export const ECHARTS_LOCALE = 'DE';

echarts.registerLocale(ECHARTS_LOCALE, deLocale);

export { echarts };
