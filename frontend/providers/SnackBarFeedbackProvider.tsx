'use client';
import SnackBar from '@/ui/SnackBar';

import React, {
  createContext,
  ReactNode,
  useCallback,
  useState,
  useContext,
  useRef,
} from 'react';
import { SnackbarState, SnackbarContextType } from '@/types/snackbar';

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

type SnackbarProviderProps = {
  children: ReactNode;
};

// SnackbarProvider component
export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
}) => {
  const [snackbars, setSnackbars] = useState<SnackbarState[]>([]);
  const snackbarIdRef = useRef(0); // Ref to keep track of the last snackbar ID

  const closeSnackbar = useCallback((id: number) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  }, []);

  const openSnackbar = useCallback(
    (message: string, status: SnackbarState['status'] = 'info') => {
      const newSnackbar = {
        id: snackbarIdRef.current++,
        open: true,
        message,
        status,
      };

      setTimeout(() => {
        closeSnackbar(newSnackbar.id);
      }, 5000);

      setSnackbars((prev) => {
        // Check if the snackbars array has reached its limit
        if (prev.length >= 5) {
          const updatedSnackbars = prev.slice(1);
          return [...updatedSnackbars, newSnackbar];
        } else {
          return [...prev, newSnackbar];
        }
      });
    },
    [closeSnackbar],
  );

  return (
    <SnackbarContext.Provider
      value={{ snackbars, openSnackbar, closeSnackbar }}
    >
      {children}
      {snackbars.map(
        (snackbar) =>
          snackbar.open && (
            <SnackBar
              key={snackbar.id}
              id={snackbar.id} // Make sure to pass the 'id' prop
              message={snackbar.message}
              status={snackbar.status}
              onClose={(): void => closeSnackbar(snackbar.id)}
            />
          ),
      )}
    </SnackbarContext.Provider>
  );
};

// Custom hook to use the Snackbar context
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export default SnackbarContext;
