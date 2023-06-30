import { CardContent } from "@mui/material";
import Card from "@mui/material/Card";

import borderRadius from "theme/border-radius";
import colors from "theme/colors";

let cardStyle = {
  margin: "10px",
  backgroundColor: colors.widgetBackground,
  borderRadius: borderRadius.componentRadius,
};

type WidgetCardProps = {
  children: React.ReactNode;
};

export function WidgetCard(props: WidgetCardProps) {
  const { children } = props;

  return (
    <Card style={{ ...cardStyle }} elevation={0}>
      <CardContent style={{padding:"0px"}}>{children}</CardContent>
    </Card>
  );
}
