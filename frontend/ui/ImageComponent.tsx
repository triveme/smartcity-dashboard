'use client';
import { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ImageProps {
  imageBase64?: string;
  imageUrl?: string;
  imageAllowJumpoff?: boolean;
  imageJumpoffUrl?: string;
}

export default function ImageComponent(props: ImageProps): ReactElement {
  const { imageUrl, imageBase64, imageAllowJumpoff, imageJumpoffUrl } = props;

  const isExternal = (url: string): boolean => {
    if (!url) return false;

    try {
      const parsedUrl = new URL(
        url,
        typeof window !== 'undefined' ? window.location.origin : '',
      );
      return (
        parsedUrl.origin !==
        (typeof window !== 'undefined' ? window.location.origin : '')
      );
    } catch (error) {
      // If URL is invalid or relative, assume it's internal
      return false;
    }
  };

  const ImageElement = imageBase64 ? (
    <div className="relative w-full h-full">
      <Image
        src={`data:image/jpg;base64,${imageBase64}`}
        className="mx-auto object-contain"
        alt="Image"
        fill
        sizes="100%"
      />
    </div>
  ) : (
    <div className="w-full h-full">
      <img
        src={imageUrl!}
        className="max-h-full mx-auto object-contain"
        alt="Image"
      />
    </div>
  );

  const externalLinkAttributes = isExternal(imageJumpoffUrl || '')
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  if (!imageUrl && !imageBase64) {
    return <div>ERROR with Image</div>;
  }

  return (
    <div className="flex h-full items-center">
      {imageAllowJumpoff && imageJumpoffUrl ? (
        <Link
          href={imageJumpoffUrl}
          {...externalLinkAttributes}
          className="h-full w-full"
        >
          <div className="w-full h-full">{ImageElement}</div>
        </Link>
      ) : (
        <div className="w-full h-full">{ImageElement}</div>
      )}
    </div>
  );
}
