import { alpha, styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import colors from "theme/colors";

const CustomSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: colors.edit,
        '&:hover': {
            backgroundColor: alpha(colors.edit, theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: colors.edit,
    },
}));

export { CustomSwitch };