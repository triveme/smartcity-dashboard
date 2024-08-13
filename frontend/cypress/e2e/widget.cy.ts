describe('Widgets e2e test', () => {
  const widgetPageUrl = '/admin/widgets';
  const testMessage = 'test message';

  beforeEach(() => {
    cy.intercept('GET', '/widgets', (req) => {
      delete req.headers['if-none-match']; // prevents cache and always fetch new data
    }).as('getEntitiesRequest');
    cy.intercept('POST', '/widgets/with-children').as('postEntityRequest');
    cy.intercept('PATCH', '/widgets/with-children/*').as('patchEntityRequest');
    cy.intercept('DELETE', '/widgets/*').as('deleteEntityRequest');
  });

  it('should show all Widgets', () => {
    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);
    cy.wait('@getEntitiesRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.get('table tbody tr').should('have.lengthOf', response?.body.length);
      } else {
        cy.get('table tbody tr').should('have.lengthOf', 1); // 1 to show 'No Data Available'
      }
    });
  });

  it('should create widget type Text', () => {
    const widgetType = 'Text';

    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    cy.contains('Neu erstellen').click();
    cy.url().should('include', `${widgetPageUrl}/edit`);

    cy.contains('label', 'Name').next().type(`${widgetType} widget`);

    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);
    cy.get('.ql-container').eq(0).find('.ql-editor').type(testMessage);

    cy.contains('Speichern').click();

    cy.wait('@postEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });
    cy.url().should('include', widgetPageUrl);
  });

  it('should edit widget type Text', () => {
    const widgetType = 'Text';

    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    // create Widget element
    cy.get('button:contains("Neu erstellen")').click();
    cy.url().should('include', `${widgetPageUrl}/edit`);
    cy.contains('label', 'Name').next().type(`${widgetType} widget`);
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);
    cy.get('.ql-container').eq(0).find('.ql-editor').type(testMessage);
    cy.get('button:contains("Speichern")').click();
    cy.wait('@postEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });

    cy.url().should('include', widgetPageUrl);

    // edit Widget element
    cy.contains(`${widgetType} widget`).click();
    cy.url().should('include', `${widgetPageUrl}/edit`);
    cy.contains('label', 'Name').next().type(' EDIT');
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);
    cy.get('.ql-container').eq(0).find('.ql-editor').type(' EDIT');
    cy.get('button:contains("Speichern")').click();

    cy.wait('@patchEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(200);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });
    cy.url().should('include', widgetPageUrl);
  });

  // TODO: Update for new input fields
  it.skip('should create widget type Diagramm', () => {
    const widgetType = 'Diagramm';
    // chartTypes = 180° Chart, 360° Chart, Pie Chart, Linien Chart, Balken Chart
    const chartType = 'Balken Chart';

    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    cy.contains('Neu erstellen').click();
    cy.url().should('include', `${widgetPageUrl}/edit`);

    cy.contains('label', 'Name')
      .next()
      .type(`${widgetType} - ${chartType} widget`);

    // Tab configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);

    cy.contains('label', 'Typ').next().find('select').select(chartType);

    // Query configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();

    cy.contains('label', 'Intervall (in Sekunden)').next().type('60');
    cy.contains('label', 'Fiware-Service').next().type('123');
    cy.contains('label', 'Fiware-ServicePath').next().type('123');
    cy.contains('label', 'Fiware-Typ').next().type('123');

    cy.contains('label', 'Entitäts-IDs')
      .next()
      .click()
      .find('label')
      .first()
      .click();
    cy.get('body').click(0, 0); // click outside to close select dropdown

    cy.contains('label', 'Attribute')
      .next()
      .click()
      .find('label')
      .first()
      .click();
    cy.get('body').click(0, 0); // click outside to close select dropdown

    cy.contains('Speichern').click();

    cy.wait('@postEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });
    cy.url().should('include', widgetPageUrl);
  });

  // TODO: Update for new input fields
  it.skip('should create widget type Karte', () => {
    const widgetType = 'Karte';
    // mapTypes = Pin, Parken
    const mapType = 'Pin';

    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    cy.contains('Neu erstellen').click();
    cy.url().should('include', `${widgetPageUrl}/edit`);

    cy.contains('label', 'Name')
      .next()
      .type(`${widgetType} - ${mapType} widget`);

    // Tab configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);

    cy.contains('label', 'Karten Typ').next().find('select').select(mapType);

    // Query configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();

    cy.contains('label', 'Intervall (in Sekunden)').next().type('60');
    cy.contains('label', 'Fiware-Service').next().type('123');
    cy.contains('label', 'Fiware-ServicePath').next().type('123');
    cy.contains('label', 'Fiware-Typ').next().type('123');

    cy.contains('label', 'Entitäts-IDs')
      .next()
      .click()
      .find('label')
      .first()
      .click();
    cy.get('body').click(0, 0); // click outside to close select dropdown

    cy.contains('label', 'Attribute')
      .next()
      .click()
      .find('label')
      .first()
      .click();
    cy.get('body').click(0, 0); // click outside to close select dropdown

    cy.contains('Speichern').click();

    cy.wait('@postEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });
    cy.url().should('include', widgetPageUrl);
  });

  // TODO: Update for new input fields
  it.skip('should create widget type Wert', () => {
    const widgetType = 'Wert';

    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    cy.contains('Neu erstellen').click();
    cy.url().should('include', `${widgetPageUrl}/edit`);

    cy.contains('label', 'Name').next().type(`${widgetType} widget`);

    // Tab configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);

    // Query configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();

    cy.contains('label', 'Intervall (in Sekunden)').next().type('60');
    cy.contains('label', 'Fiware-Service').next().type('123');
    cy.contains('label', 'Fiware-ServicePath').next().type('123');
    cy.contains('label', 'Fiware-Typ').next().type('123');

    cy.contains('label', 'Entitäts-IDs')
      .next()
      .click()
      .find('label')
      .first()
      .click();
    cy.get('body').click(0, 0); // click outside to close select dropdown

    cy.contains('label', 'Attribute')
      .next()
      .click()
      .find('label')
      .first()
      .click();
    cy.get('body').click(0, 0); // click outside to close select dropdown

    cy.contains('Speichern').click();

    cy.wait('@postEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });
    cy.url().should('include', widgetPageUrl);
  });

  // TODO: Update for new input fields
  it.skip('should create widget type iFrame', () => {
    const widgetType = 'iFrame';
    const iframeUrl = 'https://www.google.com';

    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    cy.contains('Neu erstellen').click();
    cy.url().should('include', `${widgetPageUrl}/edit`);

    cy.contains('label', 'Name').next().type(`${widgetType} widget`);

    // Tab configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);
    cy.contains('label', 'URL').next().type(`${iframeUrl}`);

    // Query configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();

    cy.contains('label', 'Intervall (in Sekunden)').next().type('60');
    cy.contains('label', 'Fiware-Service').next().type('123');
    cy.contains('label', 'Fiware-ServicePath').next().type('123');
    cy.contains('label', 'Fiware-Typ').next().type('123');

    cy.contains('label', 'Entitäts-IDs')
      .next()
      .click()
      .find('label')
      .first()
      .click();
    cy.get('body').click(0, 0); // click outside to close select dropdown

    cy.contains('label', 'Attribute')
      .next()
      .click()
      .find('label')
      .first()
      .click();
    cy.get('body').click(0, 0); // click outside to close select dropdown

    cy.contains('Speichern').click();

    cy.wait('@postEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });
    cy.url().should('include', widgetPageUrl);
  });

  it('should create widget type Bild with URL image source', () => {
    const widgetType = 'Bild';
    // imageSources = Datei, URL
    const imageSource = 'URL';
    const imageUrl =
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRElXr3ft3qcJBMSTn9cOQPm6_JQGt5X9d-6w&usqp=CAU';
    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    cy.contains('Neu erstellen').click();
    cy.url().should('include', `${widgetPageUrl}/edit`);

    cy.contains('label', 'Name')
      .next()
      .type(`${widgetType} - ${imageSource} widget`);

    // Tab configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);
    cy.contains('label', 'Bild Quelle')
      .next()
      .find('select')
      .select(imageSource);
    cy.contains('label', 'Bild URL').next().type(`${imageUrl}`);

    cy.contains('Speichern').click();

    cy.wait('@postEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });
    cy.url().should('include', widgetPageUrl);
  });

  it('should create widget type Bild with Datei image source', () => {
    const widgetType = 'Bild';
    // imageSources = Datei, URL
    const imageSource = 'Datei';
    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    cy.contains('Neu erstellen').click();
    cy.url().should('include', `${widgetPageUrl}/edit`);

    cy.contains('label', 'Name')
      .next()
      .type(`${widgetType} - ${imageSource} widget`);

    // Tab configuration
    cy.get('button > svg[data-icon="chevron-down"]').should('exist').click();
    cy.contains('label', 'Komponente').next().find('select').select(widgetType);
    cy.contains('label', 'Bild Quelle')
      .next()
      .find('select')
      .select(imageSource);
    // create a fake file for testing purposes
    cy.get('input[type=file]').selectFile({
      contents: Cypress.Buffer.from('file contents'),
      fileName: 'fake_image.png',
      lastModified: Date.now(),
    });

    cy.contains('Speichern').click();

    cy.wait('@postEntityRequest').then(({ request, response }) => {
      expect(request.body.tab.componentType).to.equal(widgetType);
      expect(response?.statusCode).to.equal(201);
      expect(response?.body.tab.componentType).to.equal(widgetType);
    });
    cy.url().should('include', widgetPageUrl);
  });

  it('should delete Widget', () => {
    cy.visit('/');
    cy.contains('Widgets').click();
    cy.url().should('include', widgetPageUrl);

    cy.wait('@getEntitiesRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(200);
      if (response?.body.length > 0) {
        cy.get('button > svg[data-icon="trash-can"]').first().click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
      }
    });
  });
});
