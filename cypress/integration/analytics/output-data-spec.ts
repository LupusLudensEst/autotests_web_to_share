const path = require('path');

describe('Agent Analytics OutputData Page', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'POST',
      url: '**/rbac/agent/get-list',
    }).as('getAgents');
    cy.intercept({
      method: 'GET',
      url: `**/rbac/agent/${agentUuid}`,
    }).as('getAgentSettings');
    cy.intercept({
      method: 'POST',
      url: '**/dialog/report',
    }).as('requestReport');
    cy.intercept({
      method: 'GET',
      url: `**/rbac/task?agent_uuid=${agentUuid}**`,
    }).as('getAgentTasks');
    cy.intercept({
      method: 'GET',
      url: '**/notification/task',
    }).as('getNotifications');
    cy.intercept({
      method: 'GET',
      url: `**/output_file`,
    }).as('downloadReport');
    cy.intercept({
      method: 'DELETE',
      url: '**/rbac/task/**',
    }).as('cancelReport');
  });

  const wait = 1000;
  // TODO: в cypress_agent залить данные для получения отчётов, заменить agent и agentUuid, данные постановки отчёта
  const agent = 'baturin_agent_1';
  const agentUuid = 'ed36f540-23e0-44f6-ad68-fdf7a6fd60e5';
  const reportPeriodStart = '110320210000';
  const reportPeriodEnd = '310320212359';
  const reportPeriod = '11.03.2021 00:00 - 31.03.2021 23:59';
  const reportPeriodReal = '11.03.2021 00:00:00 — 31.03.2021 23:59:00';
  const reportTitle = 'from_11-03-2021 00_00_00_to_31-03-2021 23_59_00.xlsx';

  it('Проверка работы страницы OutputData', () => {
    cy.login();

    cy.log('Выбираем тестового агента');
    cy.get('[formcontrolname="query"]')
      .type(agent)
      .wait(wait);
    cy.wait(['@getAgents']);
    cy.get('[data-cy=agent-card]')
      .contains('[data-cy=agent-card-name]', agent)
      .click();
    cy.wait(['@getAgentSettings']);

    cy.log('Переходим в раздел аналитики');
    cy.contains('Analytics').click();

    cy.log('Проверка отображения страницы');
    cy.location('pathname', { timeout: 10000 }).should('include', '/analytics/output-data');
    cy.get('[data-cy=radio-button]').contains('XLSX');
    cy.get('[data-cy=radio-button]').contains('CSV');
    cy.get('[data-cy=radio-button]')
      .get('.mat-radio-input')
      .should('be.disabled');
    cy.get('[data-cy=create-button]').should('be.disabled');
    cy.get('[data-cy=settings-button]').should('be.visible');
    cy.get('[data-cy=statuses-list-select]').should('not.be.disabled');
    cy.get('[data-cy=statuses-list-select]').click();
    cy.get('.mat-option-text').contains('All statuses');
    cy.get('.mat-option-text').contains('Success');
    cy.get('.mat-option-text').contains('Failed');
    cy.get('.mat-option-text')
      .contains('Loading')
      .wait(wait);
    cy.get('.mat-option-text')
      .contains('All statuses')
      .click()
      .wait(wait);
    cy.get('[data-cy=change-direction-btn]').should('be.visible');
    cy.get('[data-cy=action-menu]').click();
    cy.get('[data-cy=action-button]').contains('Delete all completed');
    cy.get('.cdk-overlay-backdrop')
      .click()
      .wait(wait);

    cy.log('Проверка выбора даты/времени');
    cy.get('[data-cy=datetimepicker]').click();
    cy.get('.nui-interval-date-time-picker-dialog').should('be.visible');
    cy.get('.periods-wrapper')
      .children()
      .should('have.length', 7);
    cy.get('.mat-dialog-actions')
      .contains('button', 'Cancel')
      .should('be.visible')
      .click();
    cy.get('.nui-interval-date-time-picker-dialog').should('not.exist');
    cy.get('[data-cy=datetimepicker]').click();
    cy.get('.mat-dialog-actions')
      .contains('button', 'Clear')
      .should('be.visible')
      .click();
    cy.get('[formcontrolname="formatted"]').should('be.empty');
    cy.get('.nui-time-picker')
      .eq(0)
      .find('input')
      .type(reportPeriodStart);
    cy.get('.nui-time-picker')
      .eq(1)
      .find('input')
      .type(reportPeriodEnd);
    cy.get('.mat-dialog-actions')
      .contains('button', 'Ok')
      .should('be.visible')
      .click()
      .wait(wait);
    cy.get('[data-cy=report-download]')
      .find('[data-cy=datetimepicker]')
      .find('input')
      .should('have.value', reportPeriod);
    cy.get('[data-cy=radio-button]')
      .get('.mat-radio-input')
      .should('be.enabled');
    cy.get('[data-cy=create-button]').should('be.enabled');

    cy.log('Проверка скачивания отчёта');
    cy.get('[data-cy=task-container]').should('exist');
    cy.get('[data-cy=task-container]').then((item) => {
      if (item.find('[data-cy=status-list-row]').length > 0) {
        const tasksInitCount = item.find('[data-cy=status-list-row]').length;
        cy.get('[data-cy=create-button]').click();
        cy.wait(['@requestReport', '@getAgentTasks', '@getNotifications']);
        cy.get('[data-cy=snackbar]').should('be.visible');
        cy.get('[data-cy=close-snackbar-button]').click();
        cy.get('[data-cy=task-container]')
          .children()
          .should('have.length.greaterThan', tasksInitCount);
      } else {
        const tasksInitCount = 0;
        cy.get('[data-cy=create-button]').click();
        cy.wait(['@requestReport', '@getAgentTasks', '@getNotifications']);
        cy.get('[data-cy=snackbar]').should('be.visible');
        cy.get('[data-cy=task-item]')
          .children()
          .should('have.length.greaterThan', tasksInitCount);
      }
    });
    cy.get('[data-cy=notification-button]')
      .should('be.visible')
      .click();
    cy.get('[data-cy=newest-notification]')
      .contains('NEWEST')
      .should('be.visible');
    cy.wait(1000);
    cy.get('[data-cy=notification-template]')
      .eq(0)
      .realHover()
      .contains(`Report creating: ${reportPeriodReal}`)
      .should('be.visible');
    cy.get('[data-cy=notification-template]')
      .eq(0)
      .contains('[data-cy=notification-type]', 'Successfully completed')
      .should('be.visible');
    cy.get('[data-cy=notification-template]')
      .eq(0)
      .get('[data-cy=no-icon-button]')
      .contains('Download')
      .should('be.visible')
      .click({ force: true });
    cy.wait('@downloadReport');
    const downloadsFolder = Cypress.config('downloadsFolder');
    const downloadedFilename = path.join(downloadsFolder, reportTitle);
    cy.readFile(downloadedFilename, 'binary', { timeout: 15000 }).should((buffer) =>
      expect(buffer.length).to.be.gt(0),
    );
    cy.get('.cdk-overlay-backdrop')
      .click()
      .wait(wait);

    cy.log('Проверка скачанного отчёта');
    const data = [
      'name',
      'hello_confirm',
      'call_result',
      'test',
      'param_test',
      'duration',
      'selection',
    ];
    cy.parseXlsx(downloadedFilename).then((jsonData) => {
      expect(jsonData[0].data[0]).to.eqls(data);
    });
    // TODO: количество записей в отчёте соответствует выбранному временному интервалу
    // TODO: значения в столбцах заполнены при выполнении в логике nn.dump()

    cy.log('Проверка настроек');
    cy.get('[data-cy=settings-button]').click();
    cy.get('[data-cy=add-filter-button]').click();
    cy.get('[data-cy=filter-entity]').click();
    cy.get('.mat-select-search-input')
      .eq(1)
      .should('be.visible')
      .type('name');
    cy.get('.mat-option-text')
      .contains('name')
      .click()
      .wait(500);
    cy.get('[data-cy=filter-condition]')
      .click()
      .wait(100);
    cy.get('.mat-option-text')
      .contains('$==')
      .click()
      .wait(500);
    cy.get('[data-cy=filter-value-default]').type('test');
    cy.get('[data-cy=save-filter-button]').click();
    cy.get('[data-cy=back-to-button]').click();
    // TODO: записи отфильтрованы по значениям выбранных выходных сущностей

    cy.log('Проверка сортировки отчётов');
    cy.get('[data-cy=change-direction-btn]').click();
    cy.get('[data-cy=change-direction-btn]')
      .find('[data-mat-icon-name=24-sort-up]')
      .should('be.visible');
    cy.get('[data-cy=change-direction-btn]').click();
    cy.get('[data-cy=change-direction-btn]')
      .find('[data-mat-icon-name=24-sort-down]')
      .should('be.visible');

    cy.log('Проверка фильтрации отчётов');
    cy.get('[data-cy=statuses-list-select]').click();
    cy.get('.mat-option-text')
      .contains('Success')
      .click();
    cy.get('[data-cy=circle-status]')
      .should('have.class', 'app-bg-color-green-500')
      .wait(wait);
    cy.get('[data-cy=statuses-list-select]').click();
    cy.get('.mat-option-text')
      .contains('Failed')
      .click();
    cy.get('[data-cy=circle-status]')
      .should('have.class', 'app-bg-color-red-500')
      .wait(wait);
    cy.get('[data-cy=statuses-list-select]').click();
    cy.get('.mat-option-text')
      .contains('All statuses')
      .click();

    cy.log('Проверка отмены создания отчета');
    cy.get('[data-cy=datetimepicker]').click();
    cy.get('.mat-dialog-actions')
      .contains('button', 'Clear')
      .click();
    cy.get('.nui-time-picker')
      .eq(0)
      .find('input')
      .type(reportPeriodStart);
    cy.get('.nui-time-picker')
      .eq(1)
      .find('input')
      .type(reportPeriodEnd);
    cy.get('.mat-dialog-actions')
      .contains('button', 'Ok')
      .click();
    cy.get('[data-cy=create-button]').click();
    cy.get('[data-cy=delete-progressing-task-button]').click();
    cy.wait('@cancelReport');
  });

  it('Проверка перехода к странице OutputData без права доступа', () => {
    cy.login('test_cypress2@neuro.net', 'test_cypresS6');
    cy.log('Выбираем тестового агента');
    cy.get('[formcontrolname="query"]')
      .type('cypress_agent')
      .wait(wait);
    cy.get('[data-cy=agent-card]')
      .contains('[data-cy=agent-card-name]', 'cypress_agent')
      .click();
    cy.contains('Analytics').should('not.exist');
  });
});
