import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function PartlyCloudy(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = 24 } = props;
  return (
    <svg
      width="28"
      height={height}
      viewBox="0 0 20 18"
      fill={fontColor}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.83984 3.77397C9.58871 3.77397 9.37834 3.68888 9.20875 3.5187C9.03857 3.34911 8.95348 3.13874 8.95348 2.88761V1.11488C8.95348 0.863743 9.03857 0.653084 9.20875 0.482902C9.37834 0.313311 9.58871 0.228516 9.83984 0.228516C10.091 0.228516 10.3016 0.313311 10.4718 0.482902C10.6414 0.653084 10.7262 0.863743 10.7262 1.11488V2.88761C10.7262 3.13874 10.6414 3.34911 10.4718 3.5187C10.3016 3.68888 10.091 3.77397 9.83984 3.77397ZM14.2273 5.59102C14.0501 5.41374 13.9614 5.20692 13.9614 4.97056C13.9614 4.7342 14.0501 4.52738 14.2273 4.35011L15.4683 3.08704C15.6455 2.90977 15.8559 2.82113 16.0993 2.82113C16.3434 2.82113 16.554 2.90977 16.7313 3.08704C16.9086 3.26431 16.9972 3.47113 16.9972 3.70749C16.9972 3.94386 16.9086 4.15067 16.7313 4.32795L15.4683 5.59102C15.291 5.76829 15.0842 5.85692 14.8478 5.85692C14.6114 5.85692 14.4046 5.76829 14.2273 5.59102ZM16.9308 10.8649C16.6796 10.8649 16.4693 10.7798 16.2997 10.6096C16.1295 10.44 16.0444 10.2297 16.0444 9.97852C16.0444 9.72738 16.1295 9.51672 16.2997 9.34654C16.4693 9.17695 16.6796 9.09215 16.9308 9.09215H18.7035C18.9546 9.09215 19.165 9.17695 19.3346 9.34654C19.5048 9.51672 19.5898 9.72738 19.5898 9.97852C19.5898 10.2297 19.5048 10.44 19.3346 10.6096C19.165 10.7798 18.9546 10.8649 18.7035 10.8649H16.9308ZM15.4683 16.87L14.2273 15.6069C14.0501 15.4297 13.9614 15.2228 13.9614 14.9865C13.9614 14.7501 14.0501 14.5433 14.2273 14.366C14.4046 14.1887 14.6114 14.1001 14.8478 14.1001C15.0842 14.1001 15.291 14.1887 15.4683 14.366L16.7313 15.6069C16.9086 15.7842 16.9972 15.9946 16.9972 16.238C16.9972 16.4821 16.9086 16.6927 16.7313 16.87C16.554 17.0473 16.3434 17.1359 16.0993 17.1359C15.8559 17.1359 15.6455 17.0473 15.4683 16.87ZM4.21143 5.59102L2.94837 4.32795C2.77109 4.15067 2.68246 3.94386 2.68246 3.70749C2.68246 3.47113 2.77109 3.26431 2.94837 3.08704C3.12564 2.90977 3.3363 2.82113 3.58034 2.82113C3.8238 2.82113 4.03416 2.90977 4.21143 3.08704L5.45234 4.35011C5.62962 4.52738 5.71825 4.7342 5.71825 4.97056C5.71825 5.20692 5.62962 5.41374 5.45234 5.59102C5.27507 5.76829 5.06825 5.85692 4.83189 5.85692C4.59553 5.85692 4.38871 5.76829 4.21143 5.59102ZM4.52166 17.9558C3.29553 17.9558 2.2505 17.5238 1.38659 16.6599C0.522094 15.7954 0.0898438 14.7501 0.0898438 13.524C0.0898438 12.2978 0.522094 11.2525 1.38659 10.388C2.2505 9.52411 3.29553 9.09215 4.52166 9.09215H4.6103C4.81712 7.8217 5.40803 6.76545 6.38303 5.9234C7.35803 5.08136 8.5103 4.66033 9.83984 4.66033C11.3171 4.66033 12.5728 5.17738 13.6069 6.21147C14.641 7.24556 15.158 8.50124 15.158 9.97852C15.158 11.1308 14.8292 12.161 14.1715 13.0693C13.5144 13.9781 12.6614 14.6172 11.6126 14.9865C11.583 15.8137 11.2693 16.5154 10.6713 17.0916C10.0727 17.6677 9.35234 17.9558 8.5103 17.9558H4.52166ZM4.52166 16.1831H8.5103C8.87962 16.1831 9.19339 16.0537 9.45162 15.7948C9.71043 15.5366 9.83984 15.2228 9.83984 14.8535C9.83984 14.4842 9.71428 14.1704 9.46314 13.9122C9.212 13.6534 8.90178 13.524 8.53246 13.524H7.40234L6.95916 12.4603C6.75234 11.9728 6.42734 11.5852 5.98416 11.2974C5.54098 11.0091 5.05348 10.8649 4.52166 10.8649C3.78303 10.8649 3.15518 11.1234 2.63814 11.6404C2.12109 12.1575 1.86257 12.7853 1.86257 13.524C1.86257 14.2626 2.12109 14.8904 2.63814 15.4075C3.15518 15.9245 3.78303 16.1831 4.52166 16.1831ZM11.1694 13.2581C11.8342 12.9922 12.3695 12.5673 12.7755 11.9835C13.182 11.4002 13.3853 10.7319 13.3853 9.97852C13.3853 9.00352 13.0381 8.16886 12.3438 7.47454C11.6495 6.78022 10.8148 6.43306 9.83984 6.43306C8.93871 6.43306 8.15959 6.72497 7.5025 7.30879C6.84482 7.89202 6.45689 8.61942 6.33871 9.49102C6.84098 9.71261 7.28416 10.0154 7.66825 10.3995C8.05234 10.7836 8.35518 11.2342 8.57678 11.7512C9.13814 11.7512 9.64425 11.8916 10.0951 12.1723C10.5454 12.4529 10.9035 12.8149 11.1694 13.2581Z"
        fill={fontColor}
      />
    </svg>
  );
}
