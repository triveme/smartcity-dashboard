'use client';
import { ReactElement, useEffect, useState } from 'react';

type PharmacyComponentProps = {
  zipCode: number;
  details: string;
  borderColor: string;
  fontColor: string;
};

type PharmacyDetails = {
  name: string;
  kammer: string;
  id: number;
  apo_id: string;
  strasse: string;
  plz: number;
  ort: string;
  distanz: number;
  telefon: string;
  fax: string;
  email: string;
  startdatum: string;
  startzeit: string;
  enddatum: string;
  endzeit: string;
};

export default function PharmacyComponent(
  props: PharmacyComponentProps,
): ReactElement {
  const [data, setData] = useState<PharmacyDetails[]>();
  useEffect(() => {
    if (props.details !== '') {
      const json = JSON.parse(props.details);
      setData([json?.apotheken?.apotheke].flat());
    }
  }, [props.details]);

  const containerStyle = {
    marginRight: '16px',
    marginLeft: '16px',
    color: props.fontColor,
  };

  const dividerStyle = {
    backgroundColor: props.borderColor,
    height: '4px',
    marginTop: '16px',
    marginBottom: '16px',
  };

  return (
    <div className="overflow-y-auto flex-1 h-full text-left">
      {data?.map((pharmacy, index) => {
        const isLast = index === data.length - 1;
        return (
          <div key={pharmacy.id} style={containerStyle}>
            <p className="text-2xl font-bold">{pharmacy.name}</p>
            <p className="text-lg">{pharmacy.strasse}</p>
            <p className="text-lg font-bold">
              {pharmacy.plz} {pharmacy.ort}
            </p>
            <div className="py-4">
              <p className="text-sm">Telefon:</p>
              <p className="text-lg font-bold">{pharmacy.telefon}</p>
            </div>
            <p className="text-sm">Notdienstzeiten:</p>
            <div className="flex">
              <p className="text-lg pr-1">Von</p>
              <p className="text-lg font-bold">
                {pharmacy.startdatum} - {pharmacy.startzeit}
              </p>
              <p className="text-lg px-1">bis</p>
              <p className="text-lg font-bold">
                {pharmacy.enddatum} - {pharmacy.endzeit}
              </p>
            </div>
            {!isLast && <div style={dividerStyle}></div>}
          </div>
        );
      })}
    </div>
  );
}
