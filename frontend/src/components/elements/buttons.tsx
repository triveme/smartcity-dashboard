import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
// import LoginIcon from "@mui/icons-material/Login";

import colors from "theme/colors";

type SafeButtonProps = {
  onClick: () => void;
  text?: string;
  customStyle?: object;
};

export function SaveButton(props: SafeButtonProps) {
  const { onClick, text, customStyle } = props;

  return (
    <Button
      onClick={onClick}
      style={
        customStyle
          ? customStyle
          : {
              border: 0,
              backgroundColor: colors.primary,
              color: colors.white,
              fontWeight: "bold",
            }
      }
    >
      <SaveIcon style={{ marginRight: 6 }} />
      {text ? text : "Speichern"}
    </Button>
  );
}

type CancelButtonProps = {
  onClick: () => void;
  text?: string;
  noIcon?: boolean;
};

export function CancelButton(props: CancelButtonProps) {
  const { onClick, text, noIcon } = props;

  return (
    <Button
      onClick={onClick}
      style={{
        border: 0,
        backgroundColor: colors.edit,
        color: colors.white,
        fontWeight: "bold",
      }}
    >
      {noIcon ? null : <CancelIcon style={{ marginRight: 6 }} />}
      {text ? text : "Abbrechen"}
    </Button>
  );
}

type DeleteButtonProps = {
  onClick: () => void;
  text?: string;
};

export function DeleteButton(props: DeleteButtonProps) {
  const { onClick, text } = props;

  return (
    <Button
      onClick={onClick}
      style={{
        border: 0,
        backgroundColor: colors.primary,
        color: colors.white,
        fontWeight: "bold",
      }}
    >
      <DeleteIcon style={{ marginRight: 6 }} />
      {text ? text : "Löschen"}
    </Button>
  );
}

type AddButtonProps = {
  onClick: () => void;
  text: string;
};

export function AddButton(props: AddButtonProps) {
  const { onClick, text } = props;

  return (
    <Button
      variant="outlined"
      onClick={onClick}
      style={{
        border: 0,
        backgroundColor: colors.edit,
        color: colors.white,
        fontWeight: "bold",
      }}
      startIcon={<AddIcon />}
    >
      {text}
    </Button>
  );
}

type LoginButtonProps = {
  onClick: () => void;
  text: string;
};

export function LoginButton(props: LoginButtonProps) {
  const { onClick, text } = props;

  return (
    <Button
      variant="outlined"
      onClick={onClick}
      style={{
        border: 0,
        height: "40px",
        backgroundColor: colors.selectedDashboard,
        color: colors.white,
        fontWeight: "bold",
        textTransform: "none",
      }}
    >
      {text}
    </Button>
  );
}
