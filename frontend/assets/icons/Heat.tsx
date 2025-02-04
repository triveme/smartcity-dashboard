import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function Heat(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = 24 } = props;
  return (
    <svg
      width="24"
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.9999 15.3104L23.3099 12.0004L19.9999 8.69043V4.00043H15.3099L11.9999 0.69043L8.68994 4.00043H3.99994V8.69043L0.689941 12.0004L3.99994 15.3104V20.0004H8.68994L11.9999 23.3104L15.3099 20.0004H19.9999V15.3104ZM11.9999 18.0004C8.68994 18.0004 5.99994 15.3104 5.99994 12.0004C5.99994 8.69043 8.68994 6.00043 11.9999 6.00043C15.3099 6.00043 17.9999 8.69043 17.9999 12.0004C17.9999 15.3104 15.3099 18.0004 11.9999 18.0004Z"
        fill={fontColor}
      />
    </svg>
  );
}
