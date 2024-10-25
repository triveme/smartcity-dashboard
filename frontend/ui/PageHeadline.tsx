import { ReactElement } from 'react';

type PageHeadlineProps = {
  headline: string;
  fontColor?: string;
};

export default function PageHeadline(props: PageHeadlineProps): ReactElement {
  const { headline, fontColor } = props;

  return (
    <div
      style={{ color: fontColor || 'white' }}
      className="text-2xl mr-auto font-bold overflow-hidden overflow-ellipsis whitespace-nowrap"
    >
      {headline}
    </div>
  );
}
