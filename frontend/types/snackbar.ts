export type SnackbarState = {
  id: number;
  open: boolean;
  message: string;
  status: 'success' | 'error' | 'warning' | 'info';
  timerId?: NodeJS.Timeout;
};

export type SnackbarContextType = {
  snackbars: SnackbarState[];
  openSnackbar: (message: string, status: SnackbarState['status']) => void; // Updated line
  closeSnackbar: (id: number) => void;
};
