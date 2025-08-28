'use client';
import { ReactElement } from 'react';

type WizardJSONUploadProps = {
  setFile: (file: File | undefined) => void;
};

export default function WizardJSONUpload(
  props: WizardJSONUploadProps,
): ReactElement {
  const { setFile } = props;

  return (
    <div className="h-14 block border-4 border-[#59647D] rounded-lg">
      <input
        type="file"
        name="file"
        onChange={(e): void => setFile(e.target.files?.[0])}
        accept=".json, .geojson"
        className="p-3 text-white text-base bg-transparent h-full w-full"
      />
    </div>
  );
}
