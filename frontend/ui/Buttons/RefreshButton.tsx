import { ReactElement } from 'react';

type RefreshButtonProps = {
  handleClick: () => void;
};

export default function RefreshButton(props: RefreshButtonProps): ReactElement {
  const { handleClick } = props;

  return (
    <div className="text-[#2B3244]">
      <button
        className="p-2 bg-[#91D9FF] hover:bg-[#82C3E5] h-19 w-48 rounded-lg flex justify-evenly items-center align-middle content-center transition-colors ease-in-out duration-300"
        onClick={handleClick}
      >
        <div>Aktualisieren</div>
      </button>
    </div>
  );
}
