declare namespace Cypress {
  interface Chainable {
    keycloakLogin(username: string, password: string): Cypress.Chainable;
    keycloakLogout(): Cypress.Chainable;
    clearCache(): Cypress.Chainable;
  }
}
