import { Box, Typography } from "@mui/material";

import colors from "theme/colors";

type ContactProps = {
  name: string;
  companyName: string;
  department: string;
  address: string;
  city: string;
};

export function Contact(props: ContactProps) {
  const { name, companyName, department, address, city } = props;

  return (
    <div>
      {/* <img
        src={ContactPicture}
        width={"100%"}
        alt="Contact"
        style={{ borderRadius: borderRadius.componentRadius }}
      /> */}

      <Typography variant="h3" marginTop={2} marginBottom={1}>
        {name}
      </Typography>
      <Box sx={{ fontSize: "12px", lineHeight: 2, color: colors.textDark }}>
        {companyName} <br />
        <table style={{ borderSpacing: 0 }}>
          <tbody>
            <tr>
              <td>{department}</td>
            </tr>
            <tr>
              <td> {address} </td>
            </tr>
            <tr>
              <td>{city} </td>
            </tr>
          </tbody>
        </table>
      </Box>
    </div>
  );
}
