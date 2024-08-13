/* eslint-disable @typescript-eslint/explicit-function-return-type */
/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('keycloakLogin', (username, password) => {
  const kcRoot = 'http://localhost:8080';
  const kcRealm = 'testrealm';
  const kcClient = 'scs-frontend';
  const kcRedirectUri = 'http://localhost:3000/admin';
  const loginPageRequest = {
    url: `${kcRoot}/realms/${kcRealm}/protocol/openid-connect/auth`,
    qs: {
      client_id: kcClient,
      redirect_uri: kcRedirectUri,
      state: createUUID(),
      nonce: createUUID(),
      response_mode: 'fragment',
      response_type: 'code',
      scope: 'openid',
    },
  };
  // Opens the keycloak login page, fill in the form with username and password and submit.
  return cy.request(loginPageRequest).then(submitLoginForm);
  ////////////
  function submitLoginForm(response: { body: string }) {
    const _el = document.createElement('html');
    _el.innerHTML = response.body;

    const loginForm = _el.getElementsByTagName('form');
    const isAlreadyLoggedIn = !loginForm.length;
    if (isAlreadyLoggedIn) {
      return;
    }
    return cy.request({
      form: true,
      method: 'POST',
      url: loginForm[0].action,
      followRedirect: false,
      body: {
        username: username,
        password: password,
      },
    });
  }

  // Copy-pasted code from keycloak javascript client
  function createUUID() {
    const s: string[] = [];
    const hexDigits: string = '0123456789abcdef';
    for (let i: number = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    // s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[19] = hexDigits.substr((parseInt(s[19], 16) & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    const uuid = s.join('');
    return uuid;
  }
});

Cypress.Commands.add('keycloakLogout', () => {
  const kcRoot = 'http://localhost:8080';
  const kcRealm = 'testrealm';
  return cy.request({
    url: `${kcRoot}/realms/${kcRealm}/protocol/openid-connect/logout`,
    followRedirect: false,
  });
});

Cypress.Commands.add('clearCache', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});
