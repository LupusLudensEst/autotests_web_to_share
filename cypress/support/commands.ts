// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(email?: string, pass?: string): typeof login;
    getBySel(selector: string): typeof getBySel;
    getBySelLike(selector: string): typeof getBySelLike;
    parseXlsx(inputFile: string);
    paste(text: string);
  }
}

function login(email, pass): void {
  // TODO:: logIn without using UI
  cy.visit('/');
  cy.get('[data-cy=email-input]').type(email || 'test_cypress@neuro.net');
  cy.get('[data-cy=password-input]').type(pass || 'test_cypresS6');
  cy.get('[data-cy=sign-in-btn]').click();
  cy.contains('Agents');
}

function getBySel(selector): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-cy=${selector}]`);
}
function getBySelLike(selector): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-cy*=${selector}]`);
}

Cypress.Commands.add('login', login);
Cypress.Commands.add('getBySel', getBySel);
Cypress.Commands.add('getBySelLike', getBySelLike);
Cypress.Commands.add('parseXlsx', (inputFile) => {
  return cy.task('parseXlsx', { filePath: inputFile });
});
Cypress.Commands.add('paste', { prevSubject: true }, (selector, pastePayload) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
  cy.wrap(selector).then(($destination) => {
    const pasteEvent = Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
      clipboardData: {
        getData: () => pastePayload,
      },
    });
    $destination[0].dispatchEvent(pasteEvent);
  });
});
