import React, { useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import { AuthContextProvider } from "context/auth-provider";
import { ArchitectureContextProvider } from "context/architecture-provider";

import { Spinner } from "components/elements/spinner";

export const queryClient = new QueryClient();

const LoginPage = React.lazy(() =>
  import(/* webpackPrefetch: true */ "pages/login-page").then((module) => ({
    default: module.LoginPage,
  }))
);

const DashboardsPage = React.lazy(() =>
  import(/* webpackPrefetch: true */ "pages/dashboards-page").then(
    (module) => ({
      default: module.DashboardsPage,
    })
  )
);

function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [editMode, setEditMode] = useState(true);

  const handleSetEditMode = (input: boolean) => {
    setEditMode(input);
  };

  return (
    <React.Suspense fallback={<Spinner />}>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <ArchitectureContextProvider>
            <BrowserRouter>
              <Switch>
                <Route exact path="/login">
                  <LoginPage
                    handleLogin={() => {
                      setLoggedIn(true);
                    }}
                    enableEditMode={() => {
                      setEditMode(true);
                    }}
                  />
                </Route>
                <Route path="*">
                  <DashboardsPage
                    setLoggedIn={setLoggedIn}
                    loggedIn={loggedIn}
                    editMode={editMode}
                    setEditMode={handleSetEditMode}
                  />
                </Route>
              </Switch>
            </BrowserRouter>
          </ArchitectureContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </React.Suspense>
  );
}

export default App;
