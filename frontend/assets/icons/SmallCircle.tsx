import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function SmallCircle(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = 24 } = props;

  function getIconSize(height?: string | number): number {
    if (typeof height === 'number' && Number.isFinite(height)) {
      // Configure icon size by changing multiplier
      return height * 0.75;
    }

    if (typeof height === 'string') {
      const parsed = Number.parseFloat(height);
      if (Number.isFinite(parsed)) {
        // Configure icon size by changing multiplier
        return parsed * 0.75;
      }
    }
    // Configure icon size by changing multiplier
    return 24 * 0.75;
  }

  console.log('Height : ', getIconSize(height));

  return (
    <svg
      width={getIconSize(height)}
      height={getIconSize(height)}
      fill=""
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
    >
      <path
        d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z"
        fill={fontColor}
      />
    </svg>
  );
}
