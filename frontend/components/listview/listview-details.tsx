'use client';

import { InterestingPlace } from '@/types/dataModels';
import React from 'react';

type ListViewDetailsProps = {
  info: InterestingPlace;
  handleBackClick: () => void;
  handleDisplayOnMapClick: (markerId: string, lat: number, lng: number) => void;
  index: number;
  poiBackgroundColor?: string;
  headlineYellowColor?: string;
  headlineGrayColor?: string;
  iconColor?: string;
  // Button styling props
  listviewBackButtonBackgroundColor?: string;
  listviewBackButtonHoverBackgroundColor?: string;
  listviewBackButtonFontColor?: string;
  listviewMapButtonBackgroundColor?: string;
  listviewMapButtonHoverBackgroundColor?: string;
  listviewMapButtonFontColor?: string;
};

// Headline Yellow Component
const HeadlineYellow = ({
  text,
  color = '#FCD34D',
}: {
  text: string;
  color?: string;
}): React.JSX.Element => (
  <h3 className="text-lg font-bold" style={{ color }}>
    {text}
  </h3>
);

// Headline Gray Component
const HeadlineGray = ({
  text,
  color = '#6B7280',
}: {
  text: string;
  color?: string;
}): React.JSX.Element => (
  <p className="text-sm" style={{ color }}>
    {text}
  </p>
);

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

// Back Button Component
const BackButton = ({
  onClick,
  text,
  backgroundColor = '#E5E7EB',
  hoverBackgroundColor = '#D1D5DB',
  fontColor = '#374151',
}: {
  onClick: () => void;
  text: string;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  fontColor?: string;
}): React.JSX.Element => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
    style={{
      backgroundColor,
      color: fontColor,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = hoverBackgroundColor;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = backgroundColor;
    }}
  >
    <span className="text-lg">←</span>
    {text}
  </button>
);

// Display On Map Button Component
const DisplayOnMapButton = ({
  onClick,
  backgroundColor = '#3B82F6',
  hoverBackgroundColor = '#2563EB',
  fontColor = '#FFFFFF',
}: {
  onClick: () => void;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  fontColor?: string;
}): React.JSX.Element => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
    style={{
      backgroundColor,
      color: fontColor,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = hoverBackgroundColor;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = backgroundColor;
    }}
  >
    <span className="text-lg">📍</span>
    Auf Karte anzeigen
  </button>
);

export function ListViewDetails(
  props: ListViewDetailsProps,
): React.JSX.Element {
  const {
    info,
    handleBackClick,
    handleDisplayOnMapClick,
    index,
    poiBackgroundColor = '#F9FAFB',
    headlineYellowColor = '#FCD34D',
    headlineGrayColor = '#6B7280',
    listviewBackButtonBackgroundColor = '#E5E7EB',
    listviewBackButtonHoverBackgroundColor = '#D1D5DB',
    listviewBackButtonFontColor = '#374151',
    listviewMapButtonBackgroundColor = '#3B82F6',
    listviewMapButtonHoverBackgroundColor = '#2563EB',
    listviewMapButtonFontColor = '#FFFFFF',
  } = props;

  // Defensive programming: handle cases where location or coordinates might be undefined
  console.log('INFO: ', info);
  const coordinates = info.location?.coordinates || [0, 0];
  const markerId = `Marker-${coordinates[0]}-${coordinates[1]}-${index}`;
  const lat = coordinates[1];
  const lng = coordinates[0];

  return (
    <div className="h-full w-full flex-[0_0_33%] flex flex-col p-3">
      <div
        className="overflow-y-auto flex flex-col gap-3 p-3 justify-between"
        style={{ backgroundColor: poiBackgroundColor }}
      >
        <div className="flex flex-row p-0">
          {info.image && info.image !== 'none' ? (
            <div className="flex flex-col flex-grow pr-3 flex-[0_0_35%] relative max-w-32">
              <img
                src={info.image}
                alt={
                  info.creator !== null
                    ? `${info.name} - ${info.creator}`
                    : `POI Bild: ${info.name}`
                }
                className="rounded-lg w-full min-w-28"
              />
              {info.creator && <CopyrightElement creator={info.creator} />}
            </div>
          ) : null}
          <div className="h-full flex flex-col flex-[0_0_65%] justify-between">
            <div className="pl-0 h-full flex flex-col content-start items-start justify-around">
              <div>
                <HeadlineYellow text={info.name} color={headlineYellowColor} />
                <p className="text-sm">
                  {info.types && info.types.length > 0
                    ? info.types.map((type: string) => {
                        return type.toString() + ' ';
                      })
                    : null}
                </p>
              </div>
              <div className="flex flex-row content-center items-center">
                <HeadlineGray text={info.address} color={headlineGrayColor} />
              </div>
            </div>
          </div>
        </div>

        {info.description && info.description.trim() && (
          <div className="flex flex-col">
            <h4
              className="font-semibold text-sm"
              style={{ color: headlineYellowColor }}
            >
              Beschreibung:
            </h4>
            <p className="text-sm" style={{ color: headlineGrayColor }}>
              {info.description}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {info.contactName && info.contactName.trim() && (
            <div className="flex flex-col">
              <h4
                className="font-semibold text-sm"
                style={{ color: headlineYellowColor }}
              >
                Kontakt Name:
              </h4>
              <p className="text-sm" style={{ color: headlineGrayColor }}>
                {info.contactName}
              </p>
            </div>
          )}

          {info.contactPhone && info.contactPhone.trim() && (
            <div className="flex flex-col">
              <h4
                className="font-semibold text-sm"
                style={{ color: headlineYellowColor }}
              >
                Telefon:
              </h4>
              <p className="text-sm" style={{ color: headlineGrayColor }}>
                {info.contactPhone}
              </p>
            </div>
          )}

          {info.email && info.email.trim() && (
            <div className="flex flex-col">
              <h4
                className="font-semibold text-sm"
                style={{ color: headlineYellowColor }}
              >
                E-Mail:
              </h4>
              <a
                href={`mailto:${info.email}`}
                className="text-sm hover:underline"
                style={{ color: headlineGrayColor }}
              >
                {info.email}
              </a>
            </div>
          )}

          {info.website && info.website.trim() && (
            <div className="flex flex-col">
              <h4
                className="font-semibold text-sm"
                style={{ color: headlineYellowColor }}
              >
                Website:
              </h4>
              <a
                href={
                  info.website.startsWith('http')
                    ? info.website
                    : `https://${info.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
                style={{ color: headlineGrayColor }}
              >
                {info.website}
              </a>
            </div>
          )}

          {info.participants && info.participants.trim() && (
            <div className="flex flex-col">
              <h4
                className="font-semibold text-sm"
                style={{ color: headlineYellowColor }}
              >
                Teilnehmer:
              </h4>
              <p className="text-sm" style={{ color: headlineGrayColor }}>
                {info.participants}
              </p>
            </div>
          )}

          {info.supporter && info.supporter.trim() && (
            <div className="flex flex-col">
              <h4
                className="font-semibold text-sm"
                style={{ color: headlineYellowColor }}
              >
                Unterstützer:
              </h4>
              <p className="text-sm" style={{ color: headlineGrayColor }}>
                {info.supporter}
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div>
          <div className="flex flex-col md:flex-row gap-2">
            <BackButton
              onClick={handleBackClick}
              text={'ZURÜCK'}
              backgroundColor={listviewBackButtonBackgroundColor}
              hoverBackgroundColor={listviewBackButtonHoverBackgroundColor}
              fontColor={listviewBackButtonFontColor}
            />
            <DisplayOnMapButton
              onClick={() => handleDisplayOnMapClick(markerId, lat, lng)}
              backgroundColor={listviewMapButtonBackgroundColor}
              hoverBackgroundColor={listviewMapButtonHoverBackgroundColor}
              fontColor={listviewMapButtonFontColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
