'use client';
import { ReactElement } from 'react';

type WizardFileUploadProps = {
  setFile: (file: File | undefined) => void;
};

export default function WizardFileUpload(
  props: WizardFileUploadProps,
): ReactElement {
  const { setFile } = props;

  return (
    <div className="h-14 block border-4 border-[#59647D] rounded-lg">
      <input
        type="file"
        name="file"
        onChange={(e): void => setFile(e.target.files?.[0])}
        accept=".jpg, .jpeg, .png"
        className="p-3 text-white text-base bg-transparent h-full w-full"
      />
    </div>
  );
}
