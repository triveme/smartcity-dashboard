'use client';
import { ReactElement } from 'react';

interface ImageProps {
  imageBase64?: string;
  imageUrl?: string;
}

export default function ImageComponent(props: ImageProps): ReactElement {
  const { imageUrl, imageBase64 } = props;

  if (!imageUrl && !imageBase64) {
    return <div>ERROR with Image</div>;
  }

  const imageSrc = imageUrl || `data:image/jpg;base64,${imageBase64}`;

  return (
    <div className="flex h-full items-center">
      <img src={imageSrc} className="max-h-full mx-auto" alt="Image" />
    </div>
  );
}
