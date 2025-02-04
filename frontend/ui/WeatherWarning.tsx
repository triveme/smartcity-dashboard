'use client';
import React, { ReactElement, useState } from 'react';

import { WeatherWarningType } from '@/types';

type WeatherWarningProps = {
  data: WeatherWarningType[];
  backgroundColor: string;
  headlineColor: string;
  instructionsColor: string;
  alertDescriptionColor: string;
  dateColor: string;
  buttonBackgroundColor: string;
  buttonIconColor: string;
};

export default function WeatherWarning(
  props: WeatherWarningProps,
): ReactElement {
  const {
    data,
    backgroundColor,
    headlineColor,
    instructionsColor,
    alertDescriptionColor,
    dateColor,
    buttonBackgroundColor,
    buttonIconColor,
  } = props;

  const currentDate = new Date();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeWarnings = data.filter(
    (warning) =>
      new Date(warning.validFrom) <= currentDate &&
      new Date(warning.validTo) >= currentDate,
  );

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePrevClick = (): void => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? activeWarnings.length - 1 : prevIndex - 1,
    );
  };

  const handleNextClick = (): void => {
    setCurrentIndex((prevIndex) =>
      prevIndex === activeWarnings.length - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <div className="p-4 relative">
      {activeWarnings.length > 0 ? (
        <>
          <div className="overflow-hidden relative">
            <div
              className="mb-4 p-4 border rounded-lg shadow-md w-full"
              style={{
                backgroundColor: backgroundColor,
              }}
            >
              <div
                className="mb-2"
                style={{
                  color: headlineColor,
                }}
              >
                <span className="font-bold text-lg">
                  {activeWarnings[currentIndex].subCategory}
                </span>
                <span className="ml-2 text-sm">
                  Stufe {activeWarnings[currentIndex].severity}
                </span>
              </div>
              <div className="mb-2 break-words whitespace-normal">
                <span
                  className="block text-sm"
                  style={{
                    color: instructionsColor,
                  }}
                >
                  {activeWarnings[currentIndex].instructions}
                </span>
                <span
                  className="block text-sm"
                  style={{
                    color: alertDescriptionColor,
                  }}
                >
                  {activeWarnings[currentIndex].alertDescription}
                </span>
              </div>
              <div
                className="text-sm"
                style={{
                  color: dateColor,
                }}
              >
                <span className="mr-2">
                  Gültig von{' '}
                  {formatDate(activeWarnings[currentIndex].validFrom)}
                </span>
                <span>
                  bis {formatDate(activeWarnings[currentIndex].validTo)}
                </span>
              </div>
            </div>
          </div>
          {activeWarnings.length > 1 && (
            <>
              <button
                className="absolute top-1/2 left-0 transform -translate-y-1/2 p-2 rounded-full"
                onClick={handlePrevClick}
                style={{
                  color: buttonIconColor,
                  backgroundColor: buttonBackgroundColor,
                }}
              >
                &lt;
              </button>
              <button
                className="absolute top-1/2 right-0 transform -translate-y-1/2 p-2 rounded-full"
                onClick={handleNextClick}
                style={{
                  color: buttonIconColor,
                  backgroundColor: buttonBackgroundColor,
                }}
              >
                &gt;
              </button>
            </>
          )}
        </>
      ) : (
        <div
          className="text-center"
          style={{
            color: alertDescriptionColor,
          }}
        >
          Keine aktiven Warnungen
        </div>
      )}
    </div>
  );
}
