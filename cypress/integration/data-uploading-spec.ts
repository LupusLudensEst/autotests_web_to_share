describe('Agent - Data uploading Page', () => {
  beforeEach(() => {
    cy.login();
  });

  const path = require('path');
  const wait = 1000;
  const agent = 'cypress_agent';
  const agentUuid = 'd46b5aa6-81ed-4bd1-8f8c-1a2a1cd989bc';
  const file = 'upload_dialogs_for_cypress_agent.xlsx';
  const largeFile = 'upload_dialogs_for_cypress_agent_large.xlsx';
  const downloadsFolder = Cypress.config('downloadsFolder');
  const initialEntities = [];

  it('Проверка работы страницы Data uploading', () => {
    cy.intercept({
      method: 'POST',
      url: '**/rbac/agent/get-list',
    }).as('getAgents');
    cy.intercept({
      method: 'GET',
      url: `**/rbac/agent/${agentUuid}`,
    }).as('getAgentSettings');
    cy.intercept({
      method: 'GET',
      url: `**/rbac/task?agent_uuid=${agentUuid}**`,
    }).as('getAgentTasks');
    cy.intercept({
      method: 'GET',
      url: '**/notification/task',
    }).as('getNotifications');
    cy.intercept({
      method: 'POST',
      url: '**/dialog/upload**',
    }).as('uploadDialog');

    cy.log('Выбираем тестового агента');
    cy.get('[formcontrolname="query"]')
      .type(agent)
      .wait(wait);
    cy.wait(['@getAgents']);
    cy.get('[data-cy=agent-card]')
      .contains('[data-cy=agent-card-name]', agent)
      .click();
    cy.wait(['@getAgentSettings']);

    cy.log('Переходим в раздел Data uploading');
    cy.contains('Data uploading').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/data-uploading');

    cy.log('Проверка отображения страницы');
    cy.get('[data-cy=select-file-button]').should('be.visible');
    cy.get('[data-cy=download-example]').should('be.visible');
    cy.get('[data-cy=task-container]').should('exist');
    cy.wait('@getAgentTasks');

    cy.log('Загрузка файла');
    cy.get('[data-cy=dropzone]').attachFile(file, {
      subjectType: 'drag-n-drop',
    });
    cy.get('[data-cy=file-name]').contains(file);
    cy.get('[data-cy=select-another-button]').should('be.visible');
    cy.get('[data-cy=task-container]').then(($item) => {
      if ($item.find('[data-cy=status-list-row]').length > 0) {
        const uploadsInitCount = $item.find('[data-cy=status-list-row]').length;
        cy.get('[data-cy=upload-button]')
          .should('be.visible')
          .click();
        cy.wait(['@uploadDialog', '@getAgentTasks', '@getNotifications']);
        cy.get('[data-cy=task-container]')
          .children()
          .should('have.length.greaterThan', uploadsInitCount);
        cy.get('[data-cy=status-list-row]')
          .first()
          .find('[data-cy=action-button]')
          .find('[data-mat-icon-name=24-download]')
          .should('be.visible');
      } else {
        cy.get('[data-cy=upload-button]')
          .should('be.visible')
          .click();
        cy.wait(['@uploadDialog', '@getAgentTasks', '@getNotifications']);
        cy.get('[data-cy=task-container]')
          .children()
          .should('have.length.greaterThan', 0);
        cy.get('[data-cy=status-list-row]')
          .first()
          .find('[data-cy=action-button]')
          .find('[data-mat-icon-name=24-download]')
          .should('be.visible');
      }
    });
    cy.get('[data-cy=snackbar]')
      .should('be.visible')
      .eq(0)
      .contains('[data-cy=snackbar-title]', 'file created successfully', { matchCase: false })
      .as('fileUploadedSnack');
    cy.get('[data-cy=snackbar-title]')
      .should('be.visible')
      .eq(1)
      .contains('[data-cy=snackbar-title]', 'send data successfully', { matchCase: false })
      .as('dataSentSnack');
    cy.get('@dataSentSnack').should('be.visible');
    cy.get('@fileUploadedSnack').should('be.visible');

    cy.log('Проверка скачивания образца загрузочного файла');
    cy.contains('Agent settings').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/agent-settings/settings');
    cy.get('[data-cy=tab-nav]')
      .find('.mat-tab-link')
      .contains('initial entities')
      .click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/agent-settings/initial');
    cy.get('[data-cy=initial-entity]').each(($el) => {
      cy.wrap($el)
        .find('.mat-column-name')
        .then(($name) => {
          initialEntities.push($name.text().trim());
        });
    });
    cy.contains('Data uploading').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/data-uploading');
    cy.get('[data-cy=download-example]')
      .click()
      .wait(wait);
    const example = path.join(downloadsFolder, file);
    cy.parseXlsx(example).then((jsonData) => {
      expect(jsonData[0].data[0]).to.eqls(initialEntities);
    });

    cy.log('Проверка списка загруженных ранее файлов');
    cy.get('[data-cy=status-list-row]').each(($el) => {
      cy.wrap($el).within(() => {
        cy.get('[data-cy=circle-status]').should('exist');
        cy.get('[data-cy=started-on]').should('exist');
        cy.get('[data-cy=additional-info]').should('exist');
        cy.get('[data-cy=circle-status]').then(($status) => {
          if ($status.hasClass('app-bg-color-green-500')) {
            cy.get('[data-cy=action-button]')
              .find('[data-mat-icon-name=24-download]')
              .should('exist');
          }
          cy.get('[data-cy=action-button]')
            .find('[data-mat-icon-name=24-trash]')
            .should('exist');
        });
      });
    });
    cy.get('[data-cy=statuses-list-select]').click();
    const sortingMenuItems = ['All statuses', 'Success', 'Failed', 'Warning', 'Loading'];
    cy.get('.mat-option-text').each(($el, index) => {
      // cy.wrap($el).contains(sortingMenuItems[index]);
      // cy.wrap($el).should('contain.text', sortingMenuItems[index]);
      expect(
        Cypress.$($el)
          .text()
          .trim(),
      ).to.eq(sortingMenuItems[index]);
    });
    cy.get('.mat-option-text')
      .contains('All statuses')
      .click()
      .wait(100);
    cy.get('[data-cy=action-menu]').click();
    cy.get('[data-cy=action-button]')
      .contains('Delete all completed')
      .should('be.visible')
      .click();
    cy.get('[data-cy=remove-cancel-button]').click();
    cy.get('[data-cy=change-direction-btn]').should('be.visible');

    cy.log('Проверка скачанного отчёта');
    cy.get('[data-cy=status-list-row]')
      .find('[data-mat-icon-name=24-download]')
      .first()
      .click()
      .wait(wait);
    const result = path.join(downloadsFolder, 'result.xlsx');
    cy.parseXlsx(result).then((jsonData) => {
      expect(jsonData[0].data[0]).to.eqls([...initialEntities, 'Upload status']);
    });

    cy.log('Отмена загрузки файла');
    cy.get('[data-cy=dropzone]').attachFile(largeFile, {
      subjectType: 'drag-n-drop',
    });
    cy.get('[data-cy=upload-button]').click();
    cy.wait('@getAgentTasks');
    cy.get('[data-cy=status-list-row]')
      .first()
      .then(($item) => {
        if ($item.find('[data-cy=delete-progressing-task-button]').length) {
          cy.intercept({
            method: 'DELETE',
            url: '**/rbac/task/**',
          }).as('cancelReport');
          cy.get('[data-cy=delete-progressing-task-button]')
            .should('be.visible')
            .click({ force: true });
          cy.wait(['@cancelReport', '@getAgentTasks']);

          cy.get('[data-cy=snackbar]')
            .should('be.visible')
            .eq(0)
            .contains('[data-cy=snackbar-title]', 'delete data successfully', { matchCase: false })
            .should('be.visible');
        }
      });

    cy.get('[data-cy=action-menu]').click();
    cy.get('[data-cy=action-button]')
      .contains('Delete all completed')
      .parent()
      .click();
    cy.get('[data-cy=remove-confirm-button]').click();
  });
});
