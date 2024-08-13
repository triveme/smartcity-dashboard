describe('Widgets e2e test', () => {
  const menuPageUrl = '/admin/menu';
  const testUrl = 'test_url';

  beforeEach(() => {
    cy.intercept('GET', '/dashboards', (req) => {
      delete req.headers['if-none-match']; // prevents cache and always fetch new data
    }).as('getDashboardsRequest');
    cy.intercept('GET', '/groupingElements', (req) => {
      delete req.headers['if-none-match']; // prevents cache and always fetch new data
    }).as('getEntitiesRequest');
    cy.intercept('POST', '/groupingElements').as('postEntityRequest');
    cy.intercept('PATCH', '/groupingElements/*').as('patchEntityRequest');
    cy.intercept('DELETE', '/groupingElements/*').as('deleteEntityRequest');
  });

  it('should show all Groups', () => {
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);
    cy.wait('@getEntitiesRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.get('*[class^="flex flex-col gap-4 items-end"]').as('menuElements');
        cy.get('@menuElements').should('have.lengthOf', response?.body.length);
      } else {
        cy.get(response?.body.length).should('have.lengthOf', 0);
      }
    });
  });

  it('should create element type Dashboard', () => {
    const elementType = 'Dashboardseite';
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    cy.wait('@getDashboardsRequest').then(({ response }) => {
      if (response?.body.length > 0) {
        cy.get('button:contains("+ Element hinzufügen")').last().click();
        cy.contains('div', 'Element bearbeiten').should('exist');
        cy.contains('label', 'Elementtyp')
          .next()
          .find('select')
          .select(elementType);
        cy.contains('label', 'Dashboard').next().find('select').select(0);
        cy.get('button:contains("Speichern")').click();

        cy.wait('@postEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(201);
          const dashboardElement = response?.body;
          expect(dashboardElement.isDashboard).to.be.true;
        });
        cy.contains('div', 'Element bearbeiten').should('not.exist');
      }
    });
  });

  it('should delete element type Dashboard', () => {
    const elementType = 'Dashboardseite';
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    // create dashboard element
    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Dashboard').next().find('select').select(0);
    cy.get('button:contains("Speichern")').click();

    // delete dashboard element
    cy.wait('@postEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
      const dashboardElement = response?.body;
      cy.contains(dashboardElement.name)
        .parent()
        .find('button > svg[data-icon="trash-can"]')
        .click();
      cy.wait('@deleteEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
    });
  });

  it('should create element type Group (parent)', () => {
    const elementType = 'Gruppe';
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);

    cy.contains('label', 'Name').next().type('test create parent group');
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
      const groupElement = response?.body;
      expect(groupElement.isDashboard).to.be.false;
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');
  });

  it('should create element type Group (child)', () => {
    const elementType = 'Gruppe';
    const parentGroupName = 'test create parent child group';
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    // create parent Group
    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Name').next().type(parentGroupName);
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    // create child Group
    cy.contains(parentGroupName)
      .parent()
      .parent()
      .find('button')
      .contains('+ Element hinzufügen')
      .click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Name').next().type('test create child group');
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
      const groupElement = response?.body;
      expect(groupElement.isDashboard).to.be.false;
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');
  });

  it('should delete element type Group (parent)', () => {
    const elementType = 'Gruppe';
    const parentGroupName = 'test delete parent group';
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    // create group element
    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Name').next().type(parentGroupName);
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    // delete group element
    cy.contains(parentGroupName)
      .parent()
      .find('button > svg[data-icon="trash-can"]')
      .click();

    cy.wait('@deleteEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
    });
  });

  it('should delete element type Group (child)', () => {
    const elementType = 'Gruppe';
    const parentGroupName = 'test delete parent group';
    const childGroupName = 'test delete child group';
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    // create parent Group
    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Name').next().type(parentGroupName);
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    // create child Group
    cy.contains(parentGroupName)
      .parent()
      .parent()
      .find('button')
      .contains('+ Element hinzufügen')
      .click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Name').next().type(childGroupName);
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    // delete child Group
    cy.contains(childGroupName)
      .parent()
      .find('button > svg[data-icon="trash-can"]')
      .click();

    cy.wait('@deleteEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
    });

    // delete parent Group
    cy.contains(parentGroupName)
      .parent()
      .find('button > svg[data-icon="trash-can"]')
      .click();
  });

  it('should edit element type Group (parent)', () => {
    const elementType = 'Gruppe';
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    // create Group element
    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);

    cy.contains('label', 'Name').next().type('test create parent group');
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');

    // edit Group element
    cy.contains('test create parent group')
      .parent()
      .find('button > svg[data-icon="pen"]')
      .click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Name').next().type(' EDIT');
    cy.get('button:contains("Speichern")').click();

    cy.wait('@patchEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      expect(response?.body.name).to.contains('EDIT');
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');
  });

  it('should edit element type Group (child)', () => {
    const elementType = 'Gruppe';
    const parentGroupName = 'test create parent group';
    const childGroupName = 'test create child group';
    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    // create parent Group
    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);

    cy.contains('label', 'Name').next().type(parentGroupName);
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');

    // create child Group
    cy.contains(parentGroupName)
      .parent()
      .parent()
      .find('button')
      .contains('+ Element hinzufügen')
      .click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Name').next().type(childGroupName);
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');

    // edit child Group
    cy.contains(childGroupName)
      .parent()
      .find('button > svg[data-icon="pen"]')
      .click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Name').next().type(' EDIT');
    cy.get('button:contains("Speichern")').click();

    cy.wait('@patchEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      expect(response?.body.name).to.contains('EDIT');
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');
  });

  it.only('should edit element position (move up)', () => {
    const elementType = 'Gruppe';
    const firstElementName = 'test first element position';
    const secondElementName = 'test second element position';

    cy.visit('/');
    cy.contains('Menu').click();
    cy.url().should('include', menuPageUrl);

    // create first parent Group
    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Name').next().type(firstElementName);
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');

    // create second parent Group
    cy.get('button:contains("+ Element hinzufügen")').last().click();
    cy.contains('div', 'Element bearbeiten').should('exist');
    cy.contains('label', 'Elementtyp')
      .next()
      .find('select')
      .select(elementType);
    cy.contains('label', 'Name').next().type(secondElementName);
    cy.contains('label', 'Url').next().type(testUrl);
    cy.get('button:contains("Speichern")').click();

    cy.wait('@postEntityRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
    });
    cy.contains('div', 'Element bearbeiten').should('not.exist');

    // move second element up
    cy.contains(secondElementName)
      .parent()
      .find('button > svg[data-icon="chevron-up"]')
      .click();

    // check second element positon less than first in database
    cy.wait('@patchEntityRequest').then(
      ({ response: secondElementResponse }) => {
        expect(secondElementResponse?.statusCode).to.equal(200);
        const updatedSecondElementPosition =
          secondElementResponse?.body.position;

        cy.wait('@patchEntityRequest').then(
          ({ response: firstElementResponse }) => {
            expect(firstElementResponse?.statusCode).to.equal(200);
            const updatedFirstElementPosition =
              firstElementResponse?.body.position;
            expect(updatedSecondElementPosition).to.be.lessThan(
              updatedFirstElementPosition,
            );
          },
        );
      },
    );

    // check second element positon higher than first in page UI
    cy.contains(secondElementName)
      .parent()
      .then(($el) => $el.position().top)
      .then((secondElemPosition) => {
        cy.contains(firstElementName)
          .parent()
          .then(($el) => $el.position().top)
          .then((firstElemPosition) => {
            expect(secondElemPosition).to.be.greaterThan(firstElemPosition);
          });
      });
  });
});
