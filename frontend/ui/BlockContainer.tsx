import { CSSProperties, ReactElement } from 'react';

type BlockStyle = {
  borderWidth: string;
  borderRadius: string;
  borderColor: string;
  fontColor: string;
  backgroundColor: string;
};

export default function BlockContainer({
  children,
  props,
}: {
  children: React.ReactNode;
  props: BlockStyle;
}): ReactElement {
  const blockStyle: CSSProperties = {
    borderWidth: props.borderWidth,
    borderRadius: props.borderRadius,
    borderColor: props.borderColor,
    color: props.fontColor,
    background: props.backgroundColor,
  };
  return (
    <div
      className="h-60 col-span-4 flex justify-center items-center hover:bg-[#ffffff50] cursor-pointer"
      style={blockStyle}
    >
      {' '}
      {children}
    </div>
  );
}
