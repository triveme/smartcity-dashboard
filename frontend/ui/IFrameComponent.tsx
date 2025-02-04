import { ReactElement } from 'react';

type IFrameComponentProps = {
  src: string;
};

export default function IFrameComponent(
  props: IFrameComponentProps,
): ReactElement {
  const { src } = props;
  return <iframe src={src} className="w-full h-full overflow-auto" />;
}
