'use client';

import { getTabImageById } from '@/api/tab-image.service';
import { MapModalWidget, Tab, TabImage, ValueToImageData } from '@/types';
import Image from 'next/image';
import { ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

type ValuesToImageComponentProps = {
  tab?: Tab;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData?: any;
  modal?: MapModalWidget;
  value?: string;
};

export default function ValuesToImageComponent(
  props: ValuesToImageComponentProps,
): ReactElement {
  const { tab, tabData, modal, value } = props;
  const auth = useAuth();

  // if(modal && queryId && entityId && attribute){
  //   const {data} = useQuery({
  //     queryKey: ['chartData'],
  //     queryFn: () => fetchOnDemandChartData(queryId, entityId, attribute)
  //   });
  // }

  const [values] = useState<ValueToImageData[]>(
    tab?.valuesToImages || modal?.valuesToImages || [],
  );
  const [imageBase64, setImageBase64] = useState<string>('');

  const getTabValue = (): string => {
    if (value !== undefined) {
      return value;
    }
    if (tab !== undefined) {
      if (tab.textValue && tab.textValue.length > 0) {
        return tab.textValue;
      } else if (tabData.textValue && tabData.textValue.length > 0) {
        return tabData.textValue;
      } else if (tab.chartValues && tab.chartValues.length > 0) {
        return tab.chartValues[tab.chartValues.length - 1].toString();
      } else if (tabData.chartValues && tabData.chartValues.length > 0) {
        return tabData.chartValues[tabData.chartValues.length - 1].toString();
      }
    }

    return '';
  };

  const getImage = async (id: string): Promise<TabImage | undefined> => {
    const found = await getTabImageById(auth.user?.access_token || '', id);
    if (found) {
      return found;
    }
    return undefined;
  };

  // Match helper: supports strings, single numbers, and inclusive numeric ranges like "10-20".
  const matchesRule = (rawValue: string, ruleMin: string): boolean => {
    const valueStr = (rawValue ?? '').trim();
    const rule = (ruleMin ?? '').trim();
    if (!rule || !valueStr) return false;

    // Try numeric compare for the tab value
    const toNum = (s: string): number | null => {
      if (s === undefined || s === null) return null;
      const normalized = s.replace(',', '.').trim();
      if (normalized === '') return null;
      const n = Number(normalized);
      return Number.isFinite(n) ? n : null;
    };

    const valueNum = toNum(valueStr);

    // Range: a-b or a–b (en dash), inclusive on both sides; only if both are numeric
    const rangeMatch = rule.match(
      /^\s*(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)\s*$/,
    );
    if (rangeMatch && valueNum !== null) {
      const a = toNum(rangeMatch[1])!;
      const b = toNum(rangeMatch[2])!;
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      return valueNum >= lo && valueNum <= hi;
    }

    // Single numeric value
    const ruleNum = toNum(rule);
    if (ruleNum !== null && valueNum !== null) {
      return valueNum === ruleNum;
    }

    // Fallback: case-insensitive string equality
    return valueStr.toLowerCase() === rule.toLowerCase();
  };

  useEffect(() => {
    if (values && values.length && imageBase64.length === 0) {
      console.log('!');
      const tabValue = getTabValue();
      let imageId: string | undefined;
      console.log(tabValue);

      for (const rule of values) {
        if (matchesRule(tabValue, rule.min)) {
          imageId = rule.imageId;
          break;
        }
      }
      console.log(imageId);

      if (imageId) {
        getImage(imageId).then((img: TabImage | undefined) => {
          if (img?.imageBase64) {
            setImageBase64(img.imageBase64);
          }
        });
      }
    }
  }, [values]);

  return (
    <div className="flex h-full items-center justify-center">
      {imageBase64 && imageBase64.length > 0 ? (
        <div className="relative w-full h-full">
          <Image
            src={imageBase64}
            className="mx-auto object-contain"
            fill
            alt={
              tabData?.textValue ||
              tabData?.chartValues[tabData?.chartValues.length - 1] ||
              value ||
              ''
            }
          />
        </div>
      ) : (
        <div>Kein Bild</div>
      )}
    </div>
  );
}
