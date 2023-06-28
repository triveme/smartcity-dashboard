import Typography from "@mui/material/Typography";
import colors from "theme/colors";

type TypographyProps = {
  text: string;
}

export function HeadlineYellow (props: TypographyProps) {
  const { text } = props;

  return (
    <Typography
      variant="h3"
      color={colors.iconColor}
    >
      {text}
    </Typography>
  );
};

export function HeadlineGray (props: TypographyProps) {
  const { text } = props;

  return (
    <Typography
      variant="subtitle2"
      color={colors.subheadline}
      paddingTop={"5px"}
    >
      {text}
    </Typography>
  );
};