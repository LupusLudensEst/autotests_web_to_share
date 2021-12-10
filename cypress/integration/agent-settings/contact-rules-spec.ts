describe('Agent-settings/Contact-rules Page', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept({
      method: 'DELETE',
      url: '**/agent_settings/time_slot/**',
    }).as('deleteSLot');

    cy.intercept({
      method: 'POST',
      url: '**/agent_settings/time_slot**',
    }).as('saveSLot');
  });

  it('Перейти в раздел Contact rules', () => {
    cy.get('[data-cy=agent-card]')
      .contains('[data-cy=agent-card-name]', 'cypress_agent')
      .click();
    cy.contains('contact rules').click();

    cy.contains('Set the number of attempts to call and the interval between attempts');
    cy.get('[data-cy=recall-count-button]').as('recallCount');
    cy.get('[data-cy=delay-button]').as('delay');

    cy.contains('Set agent’s works hours for outbound calls');
    cy.get('[data-cy=consider-subscribers-toggle]');
    cy.get('[data-cy=add-work-hours-button]');

    cy.get('@recallCount').click();

    cy.get('[data-cy=add-work-hours-button]')
      .click()
      .then(() => {
        cy.wait(1500);
      });
    cy.get('[data-cy=scheduler-item]')
      .first()
      .should('have.length.gt', 0)
      .as('firstScheduler');
    cy.wait(500);

    cy.get('[data-cy=day-of-week]')
      .first()
      .should('have.length.gt', 0)
      .as('dayOfWeek');
    cy.get('@firstScheduler')
      .find('[data-cy=edit-button]')
      .should('be.visible')
      .as('editButton');
    cy.get('@firstScheduler')
      .find('[data-cy=not-before]')
      .should('be.visible')
      .as('notBefore');
    cy.get('@firstScheduler')
      .find('[data-cy=not-after]')
      .should('be.visible')
      .as('notAfter');

    cy.get('@editButton')
      .should('be.visible')
      .click()
      .then(() => {
        cy.get('@notBefore')
          .should('be.visible')
          .type('10:10');
        cy.get('@notAfter')
          .should('be.visible')
          .type('13:10');
      });

    cy.get('@dayOfWeek')
      .should('be.visible')
      .click();

    cy.get('@firstScheduler')
      .find('[data-cy=confirm-button]')
      .should('be.visible')
      .as('confirmButton');
    cy.get('@confirmButton')
      .should('be.visible')
      .click({ force: true })
      .then(() => {
        cy.wait(500);
      });

    cy.wait('@saveSLot').then(() => {
      cy.log('saved slot');
    });
    cy.get('@recallCount')
      .should('be.enabled')
      .clear()
      .type('3');
    cy.get('@delay')
      .clear()
      .type('00:00:34');

    cy.get('@firstScheduler')
      .find('[data-cy=delete-week-scheduler-button]')
      .should('be.visible')
      .click()
      .then(() => {
        cy.wait(500);
      });

    cy.get('[color=warn]')
      .should('be.visible')
      .click();
    cy.wait('@deleteSLot').then(() => {
      cy.log('deleted slot');
    });
  });
});
