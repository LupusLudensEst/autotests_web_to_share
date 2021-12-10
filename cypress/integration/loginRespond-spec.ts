describe('Testing of login to get respond', () => {

  it('Signup and get request with respond', () => { //.only - before it
    cy.intercept('POST', 'https://cms-dev-v3.neuro.net/api/v2/rbac/auth').as('respondLogin');

    cy.login()
    cy.wait('@respondLogin').should(({ request, response }) => {
      cy.log("Response: " + JSON.stringify(response));
      cy.log("Request: " + JSON.stringify(request));
    })
  })

  it.only('Create agent and get request with respond', () => { //.only - before it
    cy.intercept('POST', 'https://cms-dev-v3.neuro.net/api/v2/rbac/agent').as('respondAgent');
    cy.login()
    // Click on 'Create agent' button
    cy.get('button.mat-flat-button').click()
    // Click on 'Cross' button to close 'Create agent' pop-up
    cy.get('.mat-focus-indicator.app-icon-button.mat-icon-button.mat-button-base').click()
    // Click on 'Create agent' button
    cy.wait(1000)
    cy.get('[fxlayout="row wrap"] > [fxlayout="row"] > .mat-focus-indicator > .mat-button-wrapper').click()
    // Send 'QaTestAgentName' to 'Agent name' field
    cy.get('[data-placeholder="Agent name"]').type('QaTestAgentName')
    // Click on 'All companies' button
    cy.wait(1000)
    // cy.get('#mat-select-70 > .mat-select-trigger > .mat-select-arrow-wrapper > .mat-select-arrow').click()
    // cy.get('#mat-select-value-15 > .mat-select-placeholder').click()
    cy.get('.nui-selector-self.ng-invalid > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').click()
    // Click on 'All companies' field, send 'asidorov@neuro.net'
    cy.get('.mat-select-search-inner > .mat-select-search-input').click().type('asidorov@neuro.net')
    // Click on 'asidorov@neuro.net'
    // cy.get('#mat-option-170 > .mat-option-text').click()
    cy.get('#mat-option-172 > .mat-option-text').click()
    // Click on 'Create' button
    cy.get('.mat-dialog-actions > .mat-flat-button > .mat-button-wrapper').click()
    // Go back to main page
    cy.wait(1000)
    // cy.get('[aria-describedby="cdk-describedby-message-26"] > [data-cy="sidebar-menu-item-link"] > .mat-list-item-content > .ng-star-inserted').click()
    cy.get('[aria-describedby="cdk-describedby-message-26"] > [data-cy="sidebar-menu-item-link"] > .mat-list-item-content > .ng-star-inserted').click()
    // Send 'QaTestAgentName' to search field
    cy.wait(1000)
    cy.get('#mat-input-13').type('QaTestAgentName')
    // Verify 'QaTestAgentName' agent is here listed
    cy.get("[data-cy='agent-card-name']").contains('QaTestAgentName')

    cy.wait('@respondAgent').should(({ request, response }) => {
      cy.log("Response: " + JSON.stringify(response));
      cy.log("Request: " + JSON.stringify(request));
    })
  })
});


