import TextField from "@mui/material/TextField";

type SmallFieldProps = {
  value: number | string | undefined;
  onChange: (e: any) => void;
  onBlur?: () => void;
  type: string;
  label: string;
  placeholder?: string;
  customStyle?: object;
  multiline?: boolean;
};

export function SmallField(props: SmallFieldProps) {
  const {
    value,
    onChange,
    onBlur,
    type,
    label,
    placeholder,
    customStyle,
    multiline,
  } = props;
  
  return (
    <TextField
      id={"text-field-" + type + "-" + label}
      type={type}
      label={label}
      placeholder={placeholder ? placeholder : undefined}
      value={value}
      onChange={onChange}
      fullWidth
      variant="outlined"
      size="small"
      margin="dense"
      autoComplete="off"
      multiline={multiline}
      onBlur={onBlur}
      style={customStyle}
      inputProps={{}}
    />
  );
}
