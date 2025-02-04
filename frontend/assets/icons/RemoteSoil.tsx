import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function RemoteSoil(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = 24 } = props;
  return (
    <svg
      width="20"
      height={height}
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.99995 18.0684C8.89995 18.0684 7.95829 17.6767 7.17495 16.8934C6.39162 16.11 5.99995 15.1684 5.99995 14.0684C5.99995 12.9684 6.39162 12.0267 7.17495 11.2434C7.95829 10.46 8.89995 10.0684 9.99995 10.0684C11.1 10.0684 12.0416 10.46 12.825 11.2434C13.6083 12.0267 14 12.9684 14 14.0684C14 15.1684 13.6083 16.11 12.825 16.8934C12.0416 17.6767 11.1 18.0684 9.99995 18.0684ZM9.99995 16.0684C10.55 16.0684 11.021 15.8727 11.413 15.4814C11.8043 15.0894 12 14.6184 12 14.0684C12 13.5184 11.8043 13.0477 11.413 12.6564C11.021 12.2644 10.55 12.0684 9.99995 12.0684C9.44995 12.0684 8.97929 12.2644 8.58795 12.6564C8.19595 13.0477 7.99995 13.5184 7.99995 14.0684C7.99995 14.6184 8.19595 15.0894 8.58795 15.4814C8.97929 15.8727 9.44995 16.0684 9.99995 16.0684ZM1.76449 5.03954C1.35046 5.37894 0.745187 5.38426 0.353592 5.01921C-0.0703158 4.62404 -0.0798759 3.95186 0.362814 3.57785C1.52429 2.59658 2.82833 1.80175 4.27495 1.19336C6.05828 0.443359 7.96662 0.0683594 9.99995 0.0683594C12.0333 0.0683594 13.9416 0.443359 15.725 1.19336C17.1716 1.80175 18.4756 2.59658 19.6371 3.57785C20.0798 3.95186 20.0702 4.62404 19.6463 5.01921C19.2547 5.38426 18.6494 5.37894 18.2354 5.03954C17.2314 4.21647 16.1195 3.54707 14.9 3.03136C13.3833 2.38936 11.75 2.06836 9.99995 2.06836C8.24995 2.06836 6.61662 2.38936 5.09995 3.03136C3.88036 3.54707 2.76854 4.21647 1.76449 5.03954ZM15.9737 8.45446C15.5935 8.81495 15.0036 8.81557 14.5762 8.51258C14.0624 8.14837 13.5037 7.84596 12.9 7.60536C12 7.24736 11.0333 7.06836 9.99995 7.06836C8.96662 7.06836 8.00428 7.24736 7.11295 7.60536C6.50964 7.84795 5.94644 8.15336 5.42333 8.52159C4.99542 8.82282 4.40794 8.82114 4.02516 8.46431C3.59306 8.06151 3.59184 7.37187 4.06653 7.02026C4.7516 6.51284 5.50007 6.09554 6.31195 5.76836C7.47062 5.30169 8.69995 5.06836 9.99995 5.06836C11.3 5.06836 12.525 5.30169 13.675 5.76836C14.4886 6.09854 15.2397 6.52049 15.9282 7.03422C16.3924 7.38061 16.394 8.05589 15.9737 8.45446Z"
        fill={fontColor}
      />
    </svg>
  );
}
