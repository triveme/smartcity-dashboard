import { ReactElement } from 'react';

type TooltipProps = {
  text: string;
  children: ReactElement;
};

const Tooltip = ({ text, children }: TooltipProps): ReactElement => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute z-10 p-2 w-full  text-xs text-white break-words bg-gray-100 rounded-lg shadow-lg invisible group-hover:visible transition-opacity duration-300 -mt-8 left-1/2 transform -translate-x-1/2 scale-75 group-hover:scale-100 ">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
