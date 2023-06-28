import Typography from "@mui/material/Typography";
import colors from "theme/colors";

type CopyrightProps = {
  creator: string;
}

export function CopyrightElement(props: CopyrightProps) {
  const { creator } = props;

  return(
    <div style={{display: "flex"}}>
      <Typography
        sx={{
          position: "relative",
          mt: "-17px",
          py: 0.4,
          pl: 0.5,
          background: colors.poiImageCopyrightBackground,
          width: "0px",
          flexGrow: 1,
          fontSize: "0.5rem"
        }}
        variant="body2"
        component="div"
        noWrap
      >
        &copy;: {creator}
      </Typography>
    </div>
  );
}