describe('Pages e2e test', () => {
  const pageUrl = '/admin/pages';
  const testUrl = 'test_url';
  function randomNumber(): number {
    return Math.floor(Math.random() * 1000) + 1;
  }

  beforeEach(() => {
    cy.intercept('GET', '/dashboards', (req) => {
      delete req.headers['if-none-match']; // prevents cache and always fetch new data
    }).as('getEntitiesRequest');
    cy.intercept('POST', '/dashboards').as('postEntityRequest');
    cy.intercept('PATCH', '/dashboards/*').as('patchEntityRequest');
    cy.intercept('DELETE', '/dashboards/*').as('deleteEntityRequest');
  });

  it('should show all Pages', () => {
    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);
    cy.wait('@getEntitiesRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.get('table tbody tr').should('have.lengthOf', response?.body.length);
      } else {
        cy.get('table tbody tr').should('have.lengthOf', 1); // 1 to show 'No Data Available'
      }
    });
  });

  it('should create Page visibility public', () => {
    const pageVisibility = 'public';
    let zeroItemsAtStart = false;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    cy.wait('@getEntitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        zeroItemsAtStart = true;
      }
    });

    cy.get('table tbody tr')
      .its('length')
      .then((itemsBefore) => {
        cy.get('button:contains("Neu erstellen")').click();
        cy.url().should('include', `${pageUrl}/edit`);

        cy.contains('label', 'Name')
          .next()
          .type(`test create ${pageVisibility} page`);
        cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
        cy.contains('label', 'Sichtbarkeit')
          .next()
          .find('select')
          .select(pageVisibility);
        cy.get('button:contains("Speichern")').click();

        cy.wait('@postEntityRequest').then(({ request, response }) => {
          expect(request.body.visibility).to.equal(pageVisibility);
          expect(response?.statusCode).to.equal(201);
          expect(response?.body.visibility).to.equal(pageVisibility);
        });
        cy.url().should('include', pageUrl);

        cy.get('table tbody tr').should(
          'have.length',
          // if zeroItemsAtStart = true, then we dont add 1
          // since 'table tbody tr' is already 1 due to 'No Data Available'
          zeroItemsAtStart ? itemsBefore : itemsBefore + 1,
        );
      });
  });

  it('should edit Page visibility public', () => {
    const pageVisibility = 'public';
    const pageName = `test create ${pageVisibility} page`;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    // create Page element
    cy.get('button:contains("Neu erstellen")').click();
    cy.url().should('include', `${pageUrl}/edit`);
    cy.contains('label', 'Name').next().type(pageName);
    cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
    cy.contains('label', 'Sichtbarkeit')
      .next()
      .find('select')
      .select(pageVisibility);
    cy.get('button:contains("Speichern")').click();

    // wait for post request to be completed
    cy.wait('@postEntityRequest');
    cy.url().should('include', pageUrl);

    // edit Page element
    cy.contains(pageName).click();
    cy.url().should('include', `${pageUrl}/edit`);
    cy.contains('label', 'Name').next().type(' EDIT');
    cy.get('button:contains("Speichern")').click();

    cy.wait('@patchEntityRequest').then(({ request, response }) => {
      expect(request.body.visibility).to.equal(pageVisibility);
      expect(response?.statusCode).to.equal(200);
      expect(response?.body.visibility).to.equal(pageVisibility);
    });
    cy.url().should('include', pageUrl);
  });

  it('should create Page visibility invisible', () => {
    const pageVisibility = 'invisible';
    let zeroItemsAtStart = false;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    cy.wait('@getEntitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        zeroItemsAtStart = true;
      }
    });

    cy.get('table tbody tr')
      .its('length')
      .then((itemsBefore) => {
        cy.get('button:contains("Neu erstellen")').click();
        cy.url().should('include', `${pageUrl}/edit`);

        cy.contains('label', 'Name')
          .next()
          .type(`test create ${pageVisibility} page`);
        cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
        cy.contains('label', 'Sichtbarkeit')
          .next()
          .find('select')
          .select(pageVisibility);
        cy.get('button:contains("Speichern")').click();

        cy.wait('@postEntityRequest').then(({ request, response }) => {
          expect(request.body.visibility).to.equal(pageVisibility);
          expect(response?.statusCode).to.equal(201);
          expect(response?.body.visibility).to.equal(pageVisibility);
        });
        cy.url().should('include', pageUrl);

        cy.get('table tbody tr').should(
          'have.length',
          // if zeroItemsAtStart = true, then we dont add 1
          // since 'table tbody tr' is already 1 due to 'No Data Available'
          zeroItemsAtStart ? itemsBefore : itemsBefore + 1,
        );
      });
  });

  it('should edit Page visibility invisible', () => {
    const pageVisibility = 'invisible';
    const pageName = `test create ${pageVisibility} page`;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    // create Page element
    cy.get('button:contains("Neu erstellen")').click();
    cy.url().should('include', `${pageUrl}/edit`);
    cy.contains('label', 'Name').next().type(pageName);
    cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
    cy.contains('label', 'Sichtbarkeit')
      .next()
      .find('select')
      .select(pageVisibility);
    cy.get('button:contains("Speichern")').click();

    // wait for post request to be completed
    cy.wait('@postEntityRequest');
    cy.url().should('include', pageUrl);

    // edit Page element
    cy.contains(pageName).click();
    cy.url().should('include', `${pageUrl}/edit`);
    cy.contains('label', 'Name').next().type(' EDIT');
    cy.get('button:contains("Speichern")').click();

    cy.wait('@patchEntityRequest').then(({ request, response }) => {
      expect(request.body.visibility).to.equal(pageVisibility);
      expect(response?.statusCode).to.equal(200);
      expect(response?.body.visibility).to.equal(pageVisibility);
    });
    cy.url().should('include', pageUrl);
  });

  it('should create Page visibility protected', () => {
    const pageVisibility = 'protected';
    // available roles = ['Super Admin', 'Admin', 'Writer'];
    const readRolesSelected = ['Super Admin', 'Admin', 'Writer'];
    const writeRolesSelected = ['Writer'];
    let zeroItemsAtStart = false;

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    cy.wait('@getEntitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        zeroItemsAtStart = true;
      }
    });

    cy.get('table tbody tr')
      .its('length')
      .then((itemsBefore) => {
        cy.get('button:contains("Neu erstellen")').click();
        cy.url().should('include', `${pageUrl}/edit`);

        cy.contains('label', 'Name')
          .next()
          .type(`test create ${pageVisibility} page`);
        cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
        cy.contains('label', 'Sichtbarkeit')
          .next()
          .find('select')
          .select(pageVisibility);

        // read rights
        cy.contains('label', 'Lese-Rechte').next().click();
        readRolesSelected.forEach((role) => {
          cy.contains('label', new RegExp(`^${role}$`)).click();
        });
        cy.get('body').click(0, 0); // click outside to close select dropdown

        // write rights
        cy.contains('label', 'Schreibe-Rechte').next().click();
        writeRolesSelected.forEach((role) => {
          cy.contains('label', new RegExp(`^${role}$`)).click();
        });
        cy.get('body').click(0, 0); // click outside to close select dropdown

        cy.get('button:contains("Speichern")').click();

        cy.wait('@postEntityRequest').then(({ request, response }) => {
          expect(request.body.visibility).to.equal(pageVisibility);
          expect(request.body.readRoles).to.deep.equal(readRolesSelected);
          expect(request.body.writeRoles).to.deep.equal(writeRolesSelected);
          expect(response?.statusCode).to.equal(201);
          expect(response?.body.visibility).to.equal(pageVisibility);
          expect(response?.body.readRoles).to.deep.equal(readRolesSelected);
          expect(response?.body.writeRoles).to.deep.equal(writeRolesSelected);
        });
        cy.url().should('include', pageUrl);

        cy.get('table tbody tr').should(
          'have.length',
          // if zeroItemsAtStart = true, then we dont add 1
          // since 'table tbody tr' is already 1 due to 'No Data Available'
          zeroItemsAtStart ? itemsBefore : itemsBefore + 1,
        );
      });
  });

  // TODO: currently fails as got a bug
  // when edit, does not prefill the read and write roles
  it.skip('should edit Page visibility protected (edit name)', () => {
    const pageVisibility = 'protected';
    const pageName = `test create ${pageVisibility} page`;
    // available roles = ['Super Admin', 'Admin', 'Writer'];
    const readRolesSelected = ['Super Admin', 'Admin', 'Writer'];
    const writeRolesSelected = ['Writer'];

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    cy.get('button:contains("Neu erstellen")').click();
    cy.url().should('include', `${pageUrl}/edit`);

    cy.contains('label', 'Name').next().type(pageName);
    cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
    cy.contains('label', 'Sichtbarkeit')
      .next()
      .find('select')
      .select(pageVisibility);

    // read rights
    cy.contains('label', 'Lese-Rechte').next().click();
    readRolesSelected.forEach((role) => {
      cy.contains('label', new RegExp(`^${role}$`)).click();
    });
    cy.get('body').click(0, 0); // click outside to close select dropdown

    // write rights
    cy.contains('label', 'Schreibe-Rechte').next().click();
    writeRolesSelected.forEach((role) => {
      cy.contains('label', new RegExp(`^${role}$`)).click();
    });
    cy.get('body').click(0, 0); // click outside to close select dropdown
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(
      ({ request: createRequest, response: createResponse }) => {
        expect(createRequest.body.visibility).to.equal(pageVisibility);
        expect(createRequest.body.readRoles).to.deep.equal(readRolesSelected);
        expect(createRequest.body.writeRoles).to.deep.equal(writeRolesSelected);
        expect(createResponse?.statusCode).to.equal(201);
        expect(createResponse?.body.visibility).to.equal(pageVisibility);
        expect(createResponse?.body.readRoles).to.deep.equal(readRolesSelected);
        expect(createResponse?.body.writeRoles).to.deep.equal(
          writeRolesSelected,
        );
      },
    );

    cy.url().should('include', pageUrl);

    // edit Page element
    cy.contains(pageName).click();
    cy.url().should('include', `${pageUrl}/edit`);
    cy.contains('label', 'Name').next().type(' EDIT');
    cy.get('button:contains("Speichern")').click();

    cy.wait('@patchEntityRequest').then(
      ({ request: editRequest, response: editResponse }) => {
        expect(editRequest.body.visibility).to.equal(pageVisibility);
        expect(editRequest.body.readRoles).to.deep.equal(readRolesSelected);
        expect(editRequest.body.writeRoles).to.deep.equal(writeRolesSelected);
        expect(editResponse?.statusCode).to.equal(200);
        expect(editResponse?.body.visibility).to.equal(pageVisibility);
        expect(editResponse?.body.readRoles).to.deep.equal(readRolesSelected);
        expect(editResponse?.body.writeRoles).to.deep.equal(writeRolesSelected);
      },
    );
    cy.url().should('include', pageUrl);
  });

  it('should edit Page visibility protected (edit read & write roles)', () => {
    const pageVisibility = 'protected';
    const pageName = `test create ${pageVisibility} page`;
    // available roles = ['Super Admin', 'Admin', 'Writer'];
    const readRolesSelected = ['Super Admin', 'Admin', 'Writer'];
    const readRolesEdited = ['Writer'];
    const writeRolesSelected = ['Super Admin', 'Admin', 'Writer'];
    const writeRolesEdited = ['Writer'];

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    cy.get('button:contains("Neu erstellen")').click();
    cy.url().should('include', `${pageUrl}/edit`);

    cy.contains('label', 'Name').next().type(pageName);
    cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
    cy.contains('label', 'Sichtbarkeit')
      .next()
      .find('select')
      .select(pageVisibility);

    // create read rights
    cy.contains('label', 'Lese-Rechte').next().click();
    readRolesSelected.forEach((role) => {
      cy.contains('label', new RegExp(`^${role}$`)).click();
    });
    cy.get('body').click(0, 0); // click outside to close select dropdown

    // create write rights
    cy.contains('label', 'Schreibe-Rechte').next().click();
    writeRolesSelected.forEach((role) => {
      cy.contains('label', new RegExp(`^${role}$`)).click();
    });
    cy.get('body').click(0, 0); // click outside to close select dropdown
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(
      ({ request: createRequest, response: createResponse }) => {
        expect(createRequest.body.visibility).to.equal(pageVisibility);
        expect(createRequest.body.readRoles).to.deep.equal(readRolesSelected);
        expect(createRequest.body.writeRoles).to.deep.equal(writeRolesSelected);
        expect(createResponse?.statusCode).to.equal(201);
        expect(createResponse?.body.visibility).to.equal(pageVisibility);
        expect(createResponse?.body.readRoles).to.deep.equal(readRolesSelected);
        expect(createResponse?.body.writeRoles).to.deep.equal(
          writeRolesSelected,
        );
      },
    );
    cy.url().should('include', pageUrl);

    // edit Page element
    cy.contains(pageName).click();
    cy.url().should('include', `${pageUrl}/edit`);
    cy.contains('label', 'Name').next().type(' EDIT');

    // edit read rights
    cy.contains('label', 'Lese-Rechte').next().click();
    readRolesEdited.forEach((role) => {
      cy.contains('label', new RegExp(`^${role}$`)).click();
    });
    cy.get('body').click(0, 0); // click outside to close select dropdown

    // edit write rights
    cy.contains('label', 'Schreibe-Rechte').next().click();
    writeRolesEdited.forEach((role) => {
      cy.contains('label', new RegExp(`^${role}$`)).click();
    });
    cy.get('body').click(0, 0); // click outside to close select dropdown
    cy.get('button:contains("Speichern")').click();

    cy.wait('@patchEntityRequest').then(
      ({ request: editRequest, response: editResponse }) => {
        expect(editRequest.body.visibility).to.equal(pageVisibility);
        expect(editRequest.body.readRoles).to.deep.equal(readRolesEdited);
        expect(editRequest.body.writeRoles).to.deep.equal(writeRolesEdited);
        expect(editResponse?.statusCode).to.equal(200);
        expect(editResponse?.body.visibility).to.equal(pageVisibility);
        expect(editResponse?.body.readRoles).to.deep.equal(readRolesEdited);
        expect(editResponse?.body.writeRoles).to.deep.equal(writeRolesEdited);
      },
    );
    cy.url().should('include', pageUrl);
  });

  it('should delete Page', () => {
    const pageVisibility = 'public';
    const pageName = 'test delete page';

    cy.visit('/');
    cy.contains('Seiten').click();
    cy.url().should('include', pageUrl);

    cy.get('table tbody tr')
      .its('length')
      .then((itemsBefore) => {
        cy.get('button:contains("Neu erstellen")').click();
        cy.url().should('include', `${pageUrl}/edit`);

        cy.contains('label', 'Name').next().type(pageName);
        cy.contains('label', 'Url').next().type(`${testUrl}${randomNumber()}`);
        cy.contains('label', 'Sichtbarkeit')
          .next()
          .find('select')
          .select(pageVisibility);
        cy.get('button:contains("Speichern")').click();

        cy.wait('@postEntityRequest').then(({ request, response }) => {
          expect(request.body.visibility).to.equal(pageVisibility);
          expect(response?.statusCode).to.equal(201);
          expect(response?.body.visibility).to.equal(pageVisibility);
        });
        cy.url().should('include', pageUrl);

        // delete Page
        cy.contains(pageName)
          .parent()
          .find('button > svg[data-icon="trash-can"]')
          .click();

        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
          cy.get('table tbody tr').should('have.length', itemsBefore);
        });
      });
  });
});
