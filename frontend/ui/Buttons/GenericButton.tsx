import { ReactElement } from 'react';

type GenericButtonProps = {
  label: string;
  handleClick: () => void;
  fontColor: string;
};

export default function GenericButton(props: GenericButtonProps): ReactElement {
  const { label, handleClick, fontColor } = props;

  const fontStyle = {
    color: fontColor ?? 'bg-[#FFFFFF]',
  };

  return (
    <div className="py-4 flex justify-center items-center content-center">
      <button
        style={fontStyle}
        className="p-4 h-10 w-full rounded-lg flex justify-center items-center content-center hover:bg-[#2B3244] transition-colors ease-in-out duration-300"
        onClick={handleClick}
      >
        <div>{label}</div>
      </button>
    </div>
  );
}
