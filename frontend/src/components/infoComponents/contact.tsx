import { Box, Typography } from "@mui/material";
import ContactPicture from "assets/KontaktAlexanderSuessemilch.png";
import borderRadius from "theme/border-radius";
import colors from "theme/colors";

type ContactProps = {
  name: string;
};

export function Contact(props: ContactProps) {
  const { name } = props;

  return (
    <div>
      <img
        src={ContactPicture}
        width={"100%"}
        alt="Contact"
        style={{ borderRadius: borderRadius.componentRadius }}
      />

      <Typography variant="h3" marginTop={2} marginBottom={1}>
        {name}
      </Typography>
      <Box sx={{ fontSize: "12px", lineHeight: 2, color: colors.textDark }}>
        EDAG Engineering GmbH <br />
        <table style={{ borderSpacing: 0 }}>
          <tbody>
            <tr>
              <td>Telefon:</td>
              <td>0661 6000 – 25854 </td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>
                <a
                  href="mailto:Alexander.suessemilch@edag.com"
                  style={{ color: colors.iconColor }}
                >
                  Alexander.suessemilch@edag.com
                </a>
              </td>
            </tr>
            <tr>
              <td>LinkedIn:</td>
              <td>
                <a
                  style={{ lineBreak: "anywhere", color: colors.iconColor }}
                  href="https://www.linkedin.com/in/asuessemilch/"
                >
                  www.linkedin.com/in/asuessemilch/
                </a>{" "}
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    </div>
  );
}
