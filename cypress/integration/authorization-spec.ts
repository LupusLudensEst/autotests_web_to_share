describe('Authorization Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Авторизация в CMS, проверка полей и кнопок', () => {
    cy.contains('Sign in');
    cy.get('.app-main-logo');
    cy.getBySel('email-input'); // cy.get('[data-cy=email-input]'); the same. just for example
    cy.get('[data-cy=password-input]');
    cy.get('[data-cy=sign-in-btn]').should('have.text', ' Sign in ');
    cy.get('[data-cy=forgot-password-btn]').contains(' Forgot your password? ');
  });

  it('Авторизация в CMS с валидным “Email” и валидным “Password”', () => {
    cy.get('[data-cy=email-input]').type('test_permisson@neuro.net');
    cy.get('[data-cy=password-input]').type('test_permissoN6');
    cy.get('[data-cy=sign-in-btn]').click();
    cy.contains('Agents');
  });

  it('Авторизация в CMS с валидным “Email” и невалидным “Password”', () => {
    cy.get('[data-cy=email-input]').type('test_permisson@neuro.net');
    cy.get('[data-cy=password-input]').type('xz');
    cy.get('[data-cy=sign-in-btn]').click();
    cy.contains('Wrong password');
  });

  it('Авторизация в CMS с невалидным “Email” и невалидным “Password”', () => {
    cy.get('[data-cy=email-input]').type('ololo');
    cy.get('[data-cy=password-input]').type('xzxz');
    cy.get('[data-cy=sign-in-btn]').click();
    cy.contains('Wrong email address');
  });

  it('Авторизация в CMS с пустым “Email” и пустым “Password”', () => {
    cy.get('[data-cy=sign-in-btn]').click();
    cy.contains('Required field');
  });
});
