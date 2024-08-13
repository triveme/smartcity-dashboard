import React from 'react';

type IntervalButtonProps = {
  text: string;
  active: boolean;
  onClick: () => void;
};

export default function IntervalButton(
  props: IntervalButtonProps,
): React.ReactElement {
  const { text, active, onClick } = props;

  const activeClasses = 'bg-[#91D9FF] text-black border-[#C7D2EE]';

  const inactiveClasses = 'bg-transparent text-white border-[#DE507D]';

  return (
    <button
      className={`font-semibold py-2 px-2 border-2 rounded-full transition duration-300 ease-in-out ${
        active ? activeClasses : inactiveClasses
      } hover:bg-[#C7D2EE] hover:border-[#C7D2EE]`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
