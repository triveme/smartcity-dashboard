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

// ReactDOM.render(
//   <ThemeProvider theme={theme}>
//     <React.StrictMode>
//       <CssBaseline />
//       <App />
//     </React.StrictMode>
//   </ThemeProvider>,
//   document.getElementById("root")
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
