import { useState } from "react";
import { Link, useHistory } from "react-router-dom";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { getAuthToken } from "clients/auth-client";
import { useAuthContext } from "context/auth-provider";

import { SmallField } from "components/elements/text-fields";
import { LoginButton } from "components/elements/buttons";

import smartCityLogo from "assets/logoSmartCity.png";
import loginBackground from "assets/loginBackground.png";
import colors from "theme/colors";
import borderRadius from "theme/border-radius";
import { getDashboardArchitecture } from "clients/architecture-client";
import { cloneDeep } from "lodash";
import { useArchitectureContext } from "context/architecture-provider";
import { BUTTON_TEXTS, LOGIN_TITLE } from "constants/text";

type LoginPageProps = {
  handleLogin: VoidFunction;
  enableEditMode: VoidFunction;
};

export function LoginPage(props: LoginPageProps) {
  const { enableEditMode } = props;
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const { setArchitectureContext } = useArchitectureContext();

  const { setAuthContext } = useAuthContext();

  let history = useHistory();

  const refreshDashboardData = (isAdmin: boolean) => {
    getDashboardArchitecture({
      dashboardUrl: "",
      isAdmin: isAdmin,
      queryEnabled: true,
    })
      .then((architectureData) => {
        setArchitectureContext({
          initialArchitectureContext: cloneDeep(architectureData),
          currentArchitectureContext: cloneDeep(architectureData),
          dashboardUrl: "",
          queryEnabled: true,
          isLoading: true,
        });
        history.replace("/");
      })
      .catch((e) => {
        console.log(
          "Seitenaufbau konnte nicht abgerufen & aktualisiert werden."
        );
      });
  };

  const login = () => {
    if (userName.length > 2 && userPassword.length > 7) {
      getAuthToken({
        username: userName,
        password: userPassword,
      })
        .then((authData) => {
          refreshDashboardData(true);
          setAuthContext({ authToken: authData.accessToken });
          enableEditMode();
          console.log("Logged in as " + authData.roles[0]);
        })
        .catch((e) => {
          alert(
            "Das Backend (frontend-service) scheint nicht erreichbar zu sein."
          );
        });
    } else {
      alert("Passwort oder Benutzername zu kurz");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        backgroundImage: `url(${loginBackground})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        marginLeft={10}
        display={{
          xs: "none",
          sm: "none",
          md: "none",
          lg: "none",
          xl: "block",
        }}
      ></Box>
      <Paper
        style={{
          minWidth: 360,
          maxWidth: 420,
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.backgroundColor,
        }}
        elevation={0}
      >
        <Box
          style={{
            maxWidth: 320,
            minWidth: 320,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRadius: 0,
          }}
        >
          <Box
            style={{
              backgroundColor: colors.primary,
              paddingTop: 10,
              paddingBottom: 5,
              justifyContent: "center",
              display: "flex",
              marginBottom: 16,
              borderRadius: borderRadius.componentRadius,
            }}
          >
            <img
              height="62px"
              src={smartCityLogo}
              alt="logo smart city"
            />
          </Box>
          <Typography variant="h1" paddingTop={1}>
            {LOGIN_TITLE}
          </Typography>
          <SmallField
            label="Nutzername"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            customStyle={{ marginBottom: 16 }}
          />
          <SmallField
            label="Passwort"
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            customStyle={{ marginBottom: 16, color: colors.edit }}
          />
          <Box paddingTop={2} width="100%" display="grid">
            <LoginButton onClick={login} text={BUTTON_TEXTS.LOGIN} />
          </Box>
          <Box
            paddingTop={2}
            width="100%"
            fontSize="10px"
            display="flex"
            justifyContent="space-evenly"
          >
            <Link
              to="/impressum"
              style={{ color: colors.text, textDecoration: "none" }}
            >
              Impressum
            </Link>
            <Link
              to="/datenschutzerklaerung"
              style={{ color: colors.text, textDecoration: "none" }}
            >
              Datenschutzerklärung
            </Link>
            <Link
              to="/nutzungsbedingungen"
              style={{ color: colors.text, textDecoration: "none" }}
            >
              Nutzungsbedingungen
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
