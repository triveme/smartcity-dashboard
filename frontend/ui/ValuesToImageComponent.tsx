'use client';

import { getTabImageById } from '@/api/tab-image.service';
import { Tab, TabImage, ValueToImageData } from '@/types';
import Image from 'next/image';
import { ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

type ValuesToImageComponentProps = {
  tab: Tab;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData: any;
};

export default function ValuesToImageComponent(
  props: ValuesToImageComponentProps,
): ReactElement {
  const { tab, tabData } = props;
  const auth = useAuth();

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [values] = useState<ValueToImageData[]>(tab.valuesToImages || []);
  const [imageBase64, setImageBase64] = useState<string>('');

  const getTabValue = (): string => {
    if (tab.textValue && tab.textValue.length > 0) {
      return tab.textValue;
    } else if (tabData.textValue && tabData.textValue.length > 0) {
      return tabData.textValue;
    } else if (tab.chartValues && tab.chartValues.length > 0) {
      return tab.chartValues[tab.chartValues.length - 1].toString();
    } else if (tabData.chartValues && tabData.chartValues.length > 0) {
      return tabData.chartValues[tabData.chartValues.length - 1].toString();
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

  useEffect(() => {
    if (values && values.length && imageBase64.length == 0) {
      let imageId: string | undefined = undefined;
      const tabValue = getTabValue();

      const filteredMinOnly = values.filter((x) => x.max.length == 0);
      if (filteredMinOnly && filteredMinOnly.length) {
        for (const minOnly of filteredMinOnly) {
          if (tabValue.toLowerCase() == minOnly.min.toLowerCase()) {
            imageId = minOnly.imageId;
            break;
          }
        }
      }
      if (imageId) {
        getImage(imageId).then((img: TabImage | undefined) => {
          if (img && img.imageBase64) {
            setImageBase64(img.imageBase64);
          }
        });
      }
    }
  }, [values, imageBase64, setImageBase64]);

  return (
    <div className="flex h-full items-center justify-center">
      {imageBase64 && imageBase64.length > 0 ? (
        <div className="relative w-full h-full">
          <Image
            src={imageBase64}
            className="mx-auto object-contain"
            fill
            alt={
              tabData.textValue ||
              tabData.chartValues[tabData.chartValues.length - 1] ||
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
