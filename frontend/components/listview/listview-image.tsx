'use client';

import { InterestingPlace } from '@/types/dataModels';
import React, { useState } from 'react';

type ListViewImageProps = {
  info: InterestingPlace;
};

// Copyright Element Component
const CopyrightElement = ({
  creator,
}: {
  creator: string;
}): React.JSX.Element => (
  <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
    © {creator}
  </div>
);

export function ListViewImage(
  props: ListViewImageProps,
): React.JSX.Element | null {
  const { info } = props;
  const [imageError, setImageError] = useState(false);

  const handleImageError = (): void => {
    if (!imageError) {
      setImageError(true);
    }
  };

  // use imagePreview if available, otherwise use image if available, otherwise use empty string
  const src =
    info.imagePreview && info.imagePreview.trim()
      ? info.imagePreview
      : info.image && info.image.trim() && info.image !== 'none'
        ? info.image
        : '';

  // Only render the image container if there's actually an image to show
  const hasImage = !imageError && src && src.trim();

  // Don't render anything if there's no image
  if (!hasImage) {
    return null; // Return null to completely hide the component
  }

  const hasCreator = info.creator && info.creator.trim();

  return (
    <div className="flex flex-col flex-grow pr-1 flex-[0_0_30%] min-w-24 max-w-32 relative">
      <img
        className="h-full w-full rounded-lg object-cover"
        src={src}
        alt={
          info.creator && info.creator.trim()
            ? `${info.creator}`
            : `POI Bild: ${info.name}`
        }
        onError={handleImageError}
      />
      {hasCreator && <CopyrightElement creator={info.creator} />}
    </div>
  );
}
