import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function Dry(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = 24 } = props;
  return (
    <svg
      width="18"
      height={height}
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_884_8463)">
        <path
          d="M2.44788 0.756482C2.66484 0.379677 3.15037 0.248989 3.52777 0.464915C3.90267 0.679411 4.02873 1.15494 3.81639 1.53107C3.42735 2.22021 3.04762 2.89813 2.64577 3.56342C1.71041 5.11232 1.71821 6.62225 2.6981 8.15667C3.31276 9.11764 3.97976 10.0597 4.19244 11.2278C4.40512 12.3925 4.34277 13.5316 3.80828 14.5861C3.33166 15.5268 2.79955 16.4387 2.26412 17.3762C2.04815 17.7544 1.57009 17.8896 1.19292 17.6719C0.819709 17.4564 0.686335 16.977 0.897507 16.6013C1.27 15.9387 1.63163 15.2891 2.01997 14.6563C2.99875 13.0584 3.01545 11.4894 1.9732 9.91492C1.66698 9.45281 1.37302 8.97845 1.11023 8.49073C0.226094 6.85386 0.115856 5.16354 0.938745 3.48547C1.39432 2.55917 1.9227 1.66855 2.44788 0.756482Z"
          fill={fontColor}
        />
        <path
          d="M16.8909 0.494615C17.2634 0.708619 17.3361 1.15065 17.1284 1.52666C16.7736 2.16908 16.4276 2.80306 16.0425 3.41323C15.0014 5.06457 15.0136 6.67026 16.0926 8.29934C16.7763 9.33157 17.4355 10.3772 17.5769 11.6655C17.6827 12.632 17.607 13.5718 17.1828 14.4292C16.6922 15.4212 16.1393 16.3831 15.583 17.3732C15.3684 17.7552 14.8807 17.8899 14.5001 17.6728C14.1235 17.4581 13.9949 16.9799 14.2054 16.6009C14.5494 15.9817 14.8866 15.3686 15.2619 14.78C16.351 13.0763 16.3265 11.4239 15.1907 9.75025C14.5905 8.86501 14.0103 7.96194 13.821 6.86736C13.615 5.68146 13.6963 4.5312 14.252 3.46111C14.7234 2.55398 15.2378 1.66976 15.7612 0.754484C15.9768 0.377651 16.5145 0.278342 16.8909 0.494615Z"
          fill={fontColor}
        />
        <path
          d="M9.10542 0.752305C9.32269 0.376702 9.8088 0.247603 10.1851 0.46365C10.5583 0.67793 10.6825 1.15049 10.4707 1.52513C10.0587 2.25388 9.65187 2.97662 9.23336 3.69286C8.37595 5.15936 8.4049 6.60136 9.28792 8.04782C9.94155 9.11791 10.6887 10.1368 10.8892 11.4329C11.0629 12.552 10.9526 13.6265 10.446 14.6231C9.97486 15.5493 9.44971 16.4487 8.91805 17.3789C8.70279 17.7555 8.22762 17.8909 7.85113 17.6754C7.47712 17.4614 7.34166 16.9821 7.55399 16.6071C7.96661 15.8783 8.37376 15.1563 8.79129 14.4394C9.64647 12.9729 9.62309 11.5253 8.73227 10.0844C8.41047 9.56443 8.07419 9.05333 7.78022 8.51772C6.88495 6.88642 6.7658 5.19276 7.57978 3.51135C8.03229 2.57677 8.56772 1.68184 9.10542 0.752305Z"
          fill={fontColor}
        />
      </g>
      <defs>
        <clipPath id="clip0_884_8463">
          <rect
            width="17.2384"
            height="18"
            fill="white"
            transform="translate(0.380859 0.0683594)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
