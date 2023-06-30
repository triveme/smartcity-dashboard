import React from "react";
import { createRoot } from "react-dom/client";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { getDesignTokens } from "theme/theme";


const theme = createTheme(getDesignTokens("dark"));
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <ThemeProvider theme={theme}>
    <React.StrictMode>
      <CssBaseline />
      <App />
    </React.StrictMode>
  </ThemeProvider>
)
reportWebVitals();
