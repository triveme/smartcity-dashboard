import { Widget } from '@/types';

describe('Pages e2e test', () => {
  const pageUrl = '/admin/pages';
  const testDashboardName = 'test dashboard panel';
  const testUrl = 'test_url';
  function randomNumber(): number {
    return Math.floor(Math.random() * 1000) + 1;
  }

  // create a Dashboard page
  before(() => {
    const pageVisibility = 'public';
    cy.intercept('POST', '/dashboards').as('postDashboardRequest');

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    cy.get('button:contains("Neu erstellen")').click();
    cy.url().should('include', `${pageUrl}/edit`);

    cy.contains('label', 'Name').next().type(testDashboardName);
    cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
    cy.contains('label', 'Sichtbarkeit')
      .next()
      .find('select')
      .select(pageVisibility);
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postDashboardRequest').then(({ request, response }) => {
      expect(request.body.visibility).to.equal(pageVisibility);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.visibility).to.equal(pageVisibility);
    });
    cy.url().should('include', pageUrl);
  });

  beforeEach(() => {
    // panels
    cy.intercept('GET', '/panels', (req) => {
      delete req.headers['if-none-match']; // prevents cache and always fetch new data
    }).as('getPanelsRequest');
    cy.intercept('POST', '/panels').as('postPanelRequest');
    cy.intercept('PATCH', '/panels/*').as('patchPanelRequest');
    cy.intercept('DELETE', '/panels/*').as('deletePanelRequest');
    // dashboards
    cy.intercept('GET', '/dashboards', (req) => {
      delete req.headers['if-none-match']; // prevents cache and always fetch new data
    }).as('getDashboardsRequest');
    cy.intercept('POST', '/dashboards').as('postDashboardRequest');
    cy.intercept('PATCH', '/dashboards/*').as('patchDashboardRequest');
    cy.intercept('DELETE', '/dashboards/*').as('deleteDashboardRequest');
    // widgets
    cy.intercept('GET', '/widgets', (req) => {
      delete req.headers['if-none-match']; // prevents cache and always fetch new data
    }).as('getWidgetsRequest');
    cy.intercept('POST', '/widgets-to-panels').as('postWidgetToPanelRequest');
    cy.intercept('DELETE', '/widgets-to-panels/**').as(
      'deleteWidgetToPanelRequest',
    );
  });

  it.only('should show all Pages', () => {
    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);
    cy.wait('@getDashboardsRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.get('table tbody tr').should('have.lengthOf', response?.body.length);
      } else {
        cy.get('table tbody tr').should('have.lengthOf', 1); // 1 to show 'No Data Available'
      }
    });
  });

  it.only('should create Panel', () => {
    const randomNumberGenerated = randomNumber();
    const panelName = 'test create panel' + randomNumberGenerated;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);
    cy.wait('@getDashboardsRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.contains(testDashboardName).click();

        cy.contains('div', `Dashboard ${testDashboardName}`).should('exist');
        cy.url().should('include', `${pageUrl}/edit`);

        // create Panel
        cy.get('button:contains("+ Panel hinzufügen")').click();
        cy.contains('div', 'Höhe / Breite').should('exist');
        cy.contains('label', 'Name').next().type(panelName);
        cy.get('.z-50 button:contains("Speichern")').click();
        cy.contains('div', 'Höhe / Breite').should('not.exist');

        // create Panel without dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        cy.get('button:contains("Speichern")').click();
        // save panel with dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        cy.url().should('include', pageUrl);
        cy.contains('Dashboardseiten');
        cy.contains(testDashboardName).click();
        cy.url().should('include', `${pageUrl}/edit`);
        cy.contains(panelName).should('exist');
      }
    });
  });

  it.only('should edit Panel', () => {
    const randomNumberGenerated = randomNumber();
    const panelName = 'test create panel' + randomNumberGenerated;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);
    cy.wait('@getDashboardsRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.contains(testDashboardName).click();

        cy.contains('div', `Dashboard ${testDashboardName}`).should('exist');
        cy.url().should('include', `${pageUrl}/edit`);

        // create Panel
        cy.get('button:contains("+ Panel hinzufügen")').click();
        cy.contains('div', 'Höhe / Breite').should('exist');
        cy.contains('label', 'Name').next().type(panelName);
        cy.get('.z-50 button:contains("Speichern")').click();
        cy.contains('div', 'Höhe / Breite').should('not.exist');

        // create panel without dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        cy.get('button:contains("Speichern")').click();
        // save panel with dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        cy.url().should('include', pageUrl);
        cy.contains('Dashboardseiten');
        cy.contains(testDashboardName).click();
        cy.url().should('include', `${pageUrl}/edit`);
        cy.contains(panelName).should('exist');
        cy.contains(panelName).click();

        // edit Panel
        cy.contains(panelName)
          .contains(randomNumberGenerated)
          .siblings('.flex')
          .find('button > svg[data-icon="pen"]')
          .click();

        cy.contains('div', 'Höhe / Breite').should('exist');
        cy.contains('label', 'Name').next().type(' EDIT');
        cy.get('.z-50 button:contains("Speichern")').click();

        let numberOfPanels;
        cy.get('svg[data-icon="pen"]')
          .its('length')
          .then((length) => {
            numberOfPanels = length;
            for (let i = 0; i < numberOfPanels; i++) {
              // get the last panel api response
              if (i === numberOfPanels - 1) {
                cy.wait('@patchPanelRequest').then(({ response }) => {
                  expect(response?.statusCode).to.equal(200);
                  expect(response?.body.name).to.contains('EDIT');
                });
              } else {
                cy.wait('@patchPanelRequest');
              }
            }
          });
        cy.contains('div', 'Höhe / Breite').should('not.exist');
      }
    });
  });

  it.only('should delete Panel', () => {
    const randomNumberGenerated = randomNumber();
    const panelName = 'test create panel' + randomNumberGenerated;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);
    cy.wait('@getDashboardsRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.contains(testDashboardName).click();

        cy.contains('div', `Dashboard ${testDashboardName}`).should('exist');
        cy.url().should('include', `${pageUrl}/edit`);

        // create Panel
        cy.get('button:contains("+ Panel hinzufügen")').click();
        cy.contains('div', 'Höhe / Breite').should('exist');
        cy.contains('label', 'Name').next().type(panelName);
        cy.get('.z-50 button:contains("Speichern")').click();
        cy.contains('div', 'Höhe / Breite').should('not.exist');

        // create Panel without dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        cy.get('button:contains("Speichern")').click();
        // save panel with dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        cy.url().should('include', pageUrl);
        cy.contains('Dashboardseiten');
        cy.contains(testDashboardName).click();
        cy.url().should('include', `${pageUrl}/edit`);
        cy.contains(panelName).should('exist');

        // delete Panel
        cy.contains(panelName)
          .contains(randomNumberGenerated)
          .siblings('.flex')
          .find('button > svg[data-icon="trash-can"]')
          .click();

        cy.wait('@deletePanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
      }
    });
  });

  it.only('should add Widget to Panel', () => {
    const randomNumberGenerated = randomNumber();
    const panelName = 'test create panel' + randomNumberGenerated;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);
    cy.wait('@getDashboardsRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.contains(testDashboardName).click();

        cy.contains('div', `Dashboard ${testDashboardName}`).should('exist');
        cy.url().should('include', `${pageUrl}/edit`);

        // create Panel
        cy.get('button:contains("+ Panel hinzufügen")').click();
        cy.contains('div', 'Höhe / Breite').should('exist');
        cy.contains('label', 'Name').next().type(panelName);
        cy.get('.z-50 button:contains("Speichern")').click();
        cy.contains('div', 'Höhe / Breite').should('not.exist');

        // create Panel without dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        // add Widget
        cy.contains('div', panelName)
          .parent()
          .parent()
          .find('button:contains("+ Widget hinzufügen")')
          .should('exist')
          .click();

        let widget: Widget;
        cy.wait('@getWidgetsRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
          if (response?.body.length > 0) {
            widget = response?.body[0];

            cy.contains('Select a widget')
              .parent()
              .next()
              .find('input')
              .click()
              .type(widget.name);
            cy.contains(widget.name).click();

            cy.wait('@postWidgetToPanelRequest').then(({ response }) => {
              expect(response?.statusCode).to.equal(201);
              expect(response?.body.widgetId).to.equal(widget.id);
            });

            cy.contains('Select a widget').should('not.exist');
            cy.contains(widget.name).should('exist');
          }
        });
      }
    });
  });

  it.only('should delete Widget from Panel', () => {
    const randomNumberGenerated = randomNumber();
    const panelName = 'test create panel' + randomNumberGenerated;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);
    cy.wait('@getDashboardsRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.contains(testDashboardName).click();

        cy.contains('div', `Dashboard ${testDashboardName}`).should('exist');
        cy.url().should('include', `${pageUrl}/edit`);

        // create Panel
        cy.get('button:contains("+ Panel hinzufügen")').click();
        cy.contains('div', 'Höhe / Breite').should('exist');
        cy.contains('label', 'Name').next().type(panelName);
        cy.get('.z-50 button:contains("Speichern")').click();
        cy.contains('div', 'Höhe / Breite').should('not.exist');

        // create Panel without dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        // add Widget
        cy.contains('div', panelName)
          .parent()
          .parent()
          .find('button:contains("+ Widget hinzufügen")')
          .should('exist')
          .click();

        let widget: Widget;
        cy.wait('@getWidgetsRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
          if (response?.body.length > 0) {
            widget = response?.body[0];

            cy.contains('Select a widget')
              .parent()
              .next()
              .find('input')
              .click()
              .type(widget.name);
            cy.contains(widget.name).click();

            cy.wait('@postWidgetToPanelRequest').then(({ response }) => {
              expect(response?.statusCode).to.equal(201);
              expect(response?.body.widgetId).to.equal(widget.id);
            });

            cy.contains('Select a widget').should('not.exist');
            cy.contains(widget.name).should('exist');

            // delete Widget
            cy.contains(widget.name)
              .parent()
              .find('button > svg[data-icon="trash-can"]')
              .click();

            cy.contains(widget.name).should('not.exist');
            cy.wait('@deleteWidgetToPanelRequest').then(({ response }) => {
              expect(response?.statusCode).to.equal(200);
            });
          }
        });
      }
    });
  });

  it.only('should not allow widgets already added', () => {
    const randomNumberGenerated = randomNumber();
    const panelName = 'test create panel' + randomNumberGenerated;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);
    cy.wait('@getDashboardsRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.contains(testDashboardName).click();

        cy.contains('div', `Dashboard ${testDashboardName}`).should('exist');
        cy.url().should('include', `${pageUrl}/edit`);

        // create Panel
        cy.get('button:contains("+ Panel hinzufügen")').click();
        cy.contains('div', 'Höhe / Breite').should('exist');
        cy.contains('label', 'Name').next().type(panelName);
        cy.get('.z-50 button:contains("Speichern")').click();
        cy.contains('div', 'Höhe / Breite').should('not.exist');

        // create Panel without dashboard id
        cy.wait('@patchPanelRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });

        // add Widget
        cy.contains('div', panelName)
          .parent()
          .parent()
          .find('button:contains("+ Widget hinzufügen")')
          .should('exist')
          .click();

        let firstWidget: Widget;
        cy.wait('@getWidgetsRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
          // have at least 2 widgets
          if (response?.body.length > 1) {
            firstWidget = response?.body[0];

            // select first Widget to add
            cy.contains('Select a widget')
              .parent()
              .next()
              .find('input')
              .click()
              .type(firstWidget.name);
            cy.contains(firstWidget.name).click();

            cy.wait('@postWidgetToPanelRequest').then(({ response }) => {
              expect(response?.statusCode).to.equal(201);
              expect(response?.body.widgetId).to.equal(firstWidget.id);
            });

            cy.contains('Select a widget').should('not.exist');
            cy.contains(firstWidget.name).should('exist');

            cy.contains('div', panelName)
              .parent()
              .parent()
              .find('button:contains("+ Widget hinzufügen")')
              .should('exist')
              .click();

            // check first Widget not included in the dropdown
            cy.contains('Select a widget')
              .parent()
              .next()
              .find('input')
              .click();
            cy.get('.absolute')
              .contains(new RegExp('^' + firstWidget.name + '$'))
              .should('not.exist');
          }
        });
      }
    });
  });
});
