import { ReactElement } from 'react';

type PageHeadlineProps = {
  headline: string;
  fontColor?: string;
  fontSize?: string;
  isHeadlineBold?: boolean;
};

export default function PageHeadline(props: PageHeadlineProps): ReactElement {
  const { headline, fontColor, fontSize, isHeadlineBold = true } = props;

  return (
    <div
      style={{ color: fontColor || 'white', fontSize: fontSize || '1.5rem' }}
      className={`mx-auto ${isHeadlineBold === false ? '' : 'font-bold'}`}
    >
      {headline}
    </div>
  );
}
