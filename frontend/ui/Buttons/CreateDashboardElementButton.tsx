import { ReactElement } from 'react';

type CreateDashboardElementButtonProps = {
  label: string;
  handleClick: () => void;
};

export default function CreateDashboardElementButton(
  props: CreateDashboardElementButtonProps,
): ReactElement {
  const { label, handleClick } = props;

  return (
    <div className="py-4 flex justify-center items-center content-center">
      <button
        className="p-4 bg-[#59647D] hover:bg-[#505A70] h-10 w-full rounded-lg text-white flex justify-center items-center content-center transition-colors ease-in-out duration-300"
        onClick={handleClick}
      >
        <div>{label}</div>
      </button>
    </div>
  );
}
