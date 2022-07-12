import Button from "@mui/material/Button";

import { Box, IconButton, SvgIconProps } from "@mui/material";

type ToggleIconButtonProps = {
  onClick: () => void;
  text?: string;
  icon1: React.ReactElement<SvgIconProps>;
  icon2: React.ReactElement<SvgIconProps>;
  text1: string;
  text2: string;
  toggleIcon: boolean;
};

export function ToggleIconButton(props: ToggleIconButtonProps) {
  const { onClick, icon1, icon2, text1, text2, toggleIcon } = props;

  return (
    <Box display="flex" alignItems="center">
      <IconButton onClick={onClick}>{toggleIcon ? icon1 : icon2}</IconButton>
      {toggleIcon ? (
        <Button onClick={onClick}>{text1}</Button>
      ) : (
        <Button onClick={onClick}>{text2}</Button>
      )}
    </Box>
  );
}
