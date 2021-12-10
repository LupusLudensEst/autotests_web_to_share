describe('Global logs Page', () => {
  beforeEach(() => {
    cy.login();
  });

  const path = require('path');
  const downloadsFolder = Cypress.config('downloadsFolder');
  const PAGE_LIMIT = 100;

  const logsPeriodStart = '030920211800';
  const logsPeriodEnd = '030920212200';

  const logUuid = '9006acef-b3a2-453e-8c5d-9178ba26cb3d';
  const msisdn = '9200376024';
  const logInfo = 'Events: 1 • ispirin_test_agent • New_Company';
  const dateOfCall = '03.09.2021 19:04:25.218';

  const callUuid = '2da16e4f-c717-4f30-9fda-41fff10a257a';
  const downloadedCallFilename = path.join(downloadsFolder, `${callUuid}.wav`);
  const callRecordUrl = '/player?url=/api/v2/log/call/stream/2da16e4f-c717-4f30-9fda-41fff10a257a';

  it('Проверка работы страницы Global logs', () => {
    cy.intercept({
      method: 'GET',
      url: '**/configuration',
    }).as('getConfiguration');
    cy.intercept({
      method: 'POST',
      url: '**/log/dialog',
    }).as('filterDialog');
    cy.intercept({
      method: 'GET',
      url: '**/log/dialog/**',
    }).as('getDialogInfo');
    cy.intercept({
      method: 'GET',
      url: '**/company/trial-status',
    }).as('getTrialStatus');
    cy.intercept({
      method: 'GET',
      url: '**/log/dialog/logs/**',
    }).as('getDialogLogs');
    cy.intercept({
      method: 'GET',
      url: '**/log/call/download/**',
    }).as('downloadCallRecord');
    cy.intercept({
      method: 'GET',
      url: '**/log/call/stream/**',
    }).as('downloadCallRecordFromPlayer');

    cy.contains('Logs').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/global-logs-v2');

    cy.log('Проверка отображения страницы');
    cy.get('[data-cy=logs]')
      .should('be.visible').wait(1000)
      .then(($item) => {
        if ($item.find('[data-cy=log-item]').length > 0) {
          cy.get('[data-cy=log-item]').then(($items) => {
            expect(Cypress.$($items).length).to.within(0, PAGE_LIMIT);
          });
          cy.get('[data-cy=dialog-transcription]').should('be.visible');
          cy.get('[data-cy=empty-content]')
            .should('be.visible')
            .contains('Choose dialog or event');
        } else {
          cy.get('[data-cy=empty-page]').should('be.visible');
        }
      });
    cy.get('[data-cy=filter-type-toggle]')
      .should('be.visible')
      .and('be.enabled');
    cy.get('[data-cy=datetimepicker]').should('be.visible');
    // todo last hour
    // cy.get('[data-cy=datetimepicker]').find('input').should('have.value', lastHour);
    const searchOptions = ['dialog (uuid)', 'call (uuid)', 'contact (msisdn)'];
    cy.get('[data-cy=search-selector]')
      .contains(searchOptions[0])
      .click();
    cy.get('.mat-select-panel')
      .should('be.visible')
      .within(() => {
        cy.get('.mat-option-text').each(($el, index) => {
          expect(
            Cypress.$($el)
              .text()
              .trim(),
          ).to.eq(searchOptions[index]);
        });
        cy.get('.mat-option-text')
          .first()
          .click();
      });
    cy.get('.mat-select-panel', { timeout: 100000 })
      .should('not.exist')
      .then(() => {
        const selectorOptions = ['all dialogs', 'with calls', 'without calls'];
        cy.get('[data-cy=selector-filter]')
          .contains('all dialogs')
          .click();
        cy.get('.mat-select-panel')
          .should('be.visible')
          .within(() => {
            cy.get('.mat-option-text').each(($el, index) => {
              expect(
                Cypress.$($el)
                  .text()
                  .trim(),
              ).to.eq(selectorOptions[index]);
            });
            cy.get('.mat-option-text')
              .first()
              .click();
          });
      });
    cy.get('[data-cy=agent-filter]')
      .contains('Agent : all')
      .click();
    cy.get('[data-cy=reset-selection]').click();
    cy.get('[data-cy=refresh-button]')
      .should('be.visible')
      .and('be.enabled');

    cy.log('Просмотр диалога в списке');
    cy.get('[data-cy=datetimepicker]').click();
    cy.get('.mat-dialog-actions')
      .contains('button', 'Clear')
      .click();
    cy.get('.nui-time-picker')
      .eq(0)
      .find('input')
      .type(logsPeriodStart);
    cy.get('.nui-time-picker')
      .eq(1)
      .find('input')
      .type(logsPeriodEnd);
    cy.get('.mat-dialog-actions')
      .contains('button', 'Ok')
      .click();
    cy.get('[data-cy=selector-filter]').click();
    cy.get('.mat-option')
      .contains('.mat-option-text', 'with calls')
      .click();
    cy.wait('@filterDialog');
    cy.get('.mat-select-panel', { timeout: 10000 }).should('not.exist');
    cy.get('[data-cy=dialog-transcription]').should('be.visible');
    cy.get('[data-cy=empty-content]')
      .should('be.visible')
      .contains('Choose dialog or event');
    cy.wait(1000);
    cy.get('[data-cy=log-item]')
      .first()
      .click();
    cy.wait('@getDialogInfo');
    cy.get('[data-cy=log-item]')
      .first()
      .then(($el) => {
        cy.wrap($el).within(() => {
          cy.get('[data-cy=msisdn]')
            .contains(msisdn)
            .should('be.visible');
          cy.get('[data-cy=main-info]')
            .contains(logInfo)
            .should('be.visible');
          cy.get('[data-cy=date-of-call]')
            .contains(dateOfCall)
            .should('be.visible');
          cy.get('[data-cy=uuid]')
            .contains(logUuid)
            .should('be.visible');
          cy.get('[data-cy=calls-display-button]')
            .should('be.visible')
            .and('be.enabled');
        });
      });

    cy.log('Просмотр транскрипции диалога');
    cy.get('[data-cy=message]').should('exist');
    // nv.say (текст промта), nv.synthesize (синтезируемый текст), nv.bridge (данные по sip-uri/msisdn, по которому был выполнен бридж)
    // nv.listen (utterance распознавания)

    cy.log('Просмотр звонков диалога в списке');
    cy.get('[data-cy=log-item]')
      .first()
      .within(() => {
        cy.get('[data-cy=calls-display-button]').click();
      });
    cy.get('[data-cy=call-info]').should('be.visible');
    cy.get('[data-cy=call-info]').each(($el) => {
      cy.wrap($el).within(() => {
        cy.get('[data-cy=msisdn]').should('exist');
        cy.get('[data-cy=status]').should('exist');
        cy.get('[data-cy=direction]').should('exist');
        cy.get('[data-cy=duration]').should('exist');
        cy.get('[data-cy=answer-date]').should('exist');
        cy.get('[data-cy=uuid]').should('exist');
      });
    });
    cy.get('[data-cy=call-info]').realHover();
    cy.get('[data-cy=action-button]')
      .find('[data-mat-icon-name=18-copy]')
      .should('exist'); // copy uuid
    cy.get('[data-cy=action-button]')
      .find('[data-mat-icon-name=24-document]')
      .should('exist'); // download transcription
    cy.get('[data-cy=action-button]')
      .find('[data-mat-icon-name=18-download]')
      .should('be.visible'); // download audio
    cy.get('.app-play-button > button').should('be.enabled');

    cy.log('Проверка скачивания звонка');
    cy.get('[data-cy=log-wrapper]')
      .first()
      .within(() => {
        cy.get('[data-cy=action-button]')
          .find('[data-mat-icon-name=18-download]')
          .click();
      });
    cy.wait('@downloadCallRecord');
    cy.readFile(downloadedCallFilename);
    // Содержимое записи соответствует происходящему в звонке - пока не проверяем

    cy.log('Проверка копирования uuid звонка');
    cy.get('[data-cy=call-info]').realHover();
    cy.get('[data-cy=action-button]')
      .find('[data-mat-icon-name=18-copy]')
      .should('be.visible')
      .click();
    cy.window()
      .its('navigator.clipboard')
      .invoke('readText')
      .should('equal', callUuid);

    cy.log('Прослушивание записи звонка');
    cy.get('.app-play-button > button').click();
    cy.get('.app-audio-player__container')
      .should('be.visible')
      .within(() => {
        cy.get('.app-audio-player__container__text').should('contain.text', '00:00 / 00:06');
        cy.get('.app-audio-player__container__timeline').should('be.visible');
        cy.get('.mat-icon-button')
          .find('[data-mat-icon-name="24-copylink"]')
          .click();
        cy.window()
          .its('navigator.clipboard')
          .invoke('readText')
          .should('contain', callRecordUrl);
        cy.get('.mat-icon-button')
          .find('[data-mat-icon-name="24-download"]')
          .click();
        cy.wait('@downloadCallRecordFromPlayer');
        cy.readFile(downloadedCallFilename);
        cy.get('.mat-icon-button')
          .find('[data-mat-icon-name="24-delete"]')
          .click();
        // todo: проверка остановки воспроизведения при закрытии плеера
      });
    cy.get('.app-audio-player__container').should('not.exist');

    //
    cy.log('Проверка фильтра call uuid');
    cy.get('[data-cy=search-selector]').click();
    cy.get('.mat-option')
      .should('be.visible')
      .contains('.mat-option-text', 'call (uuid)')
      .click();
    cy.get('[data-cy=search-input]').type(callUuid);
    cy.get('[data-cy=refresh-button]').click();
    cy.wait('@filterDialog');
    cy.wait(1000);
    cy.get('[data-cy=log-item]').then(($log) => {
      expect(Cypress.$($log).length).to.eq(1);
    });
    cy.get('[data-cy=calls-display-button]').click();
    cy.wait('@getDialogInfo');
    cy.get('[data-cy=call-info]')
      .contains(callUuid)
      .should('exist');

    cy.log('Проверка фильтра msisdn');
    cy.get('[data-cy=clear-search-button]').click();
    cy.get('[data-cy=search-selector]').click();
    cy.get('.mat-option')
      .should('be.visible')
      .contains('.mat-option-text', 'contact (msisdn)')
      .click();
    cy.get('[data-cy=search-input]').type(msisdn);
    cy.get('[data-cy=refresh-button]').click();
    cy.wait('@filterDialog');
    cy.get('[data-cy=log-item]').each(($item) => {
      cy.wrap($item)
        .contains('[data-cy=msisdn]', msisdn)
        .should('exist');
    });

    cy.log('Проверка поиска по dialog uuid');
    cy.get('[data-cy=clear-search-button]').click();
    cy.get('[data-cy=search-selector]').click();
    cy.get('.mat-option')
      .should('be.visible')
      .contains('.mat-option-text', 'dialog (uuid)')
      .click();
    cy.get('[data-cy=search-input]').type(logUuid);
    cy.get('[data-cy=refresh-button]').click();
    cy.wait('@filterDialog');
    cy.wait(1000);
    cy.get('[data-cy=log-item]').then(($log) => {
      expect(Cypress.$($log).length).to.eq(1);
    });
    cy.get('[data-cy=uuid]').contains(logUuid);
    //

    cy.log('Просмотр лога диалога');
    cy.get('[data-cy=details-button]')
      .should('have.attr', 'target', '_blank')
      .should('be.visible')
      .then((link) => {
        cy.visit(link.prop('href'));
      });
    cy.wait(['@getConfiguration', '@getDialogInfo', '@getTrialStatus', '@getDialogLogs'], {
      timeout: 10000,
    });
    cy.location('pathname').should('include', '/global-logs');
    cy.get('[data-cy=additional-log-info-toggle]')
      .should('be.visible')
      .click();
    cy.get('[data-cy=logs-content]').within(() => {
      const blocks = [
        {
          title: 'log-info',
          labels: ['UUID', 'Pool'],
        },
        {
          title: 'date-agent',
          labels: ['Added date (agent)', 'Ended date (agent)'],
        },
        {
          title: 'date-local',
          labels: ['Added date (local)', 'Ended date (local)'],
        },
      ];
      blocks.forEach((block) => {
        block.labels.forEach((label) => {
          cy.get(`[data-cy=${block.title}]`)
            .find('[data-cy=log-card-row-label]')
            .contains(label);
        });
        cy.get(`[data-cy=${block.title}]`)
          .find('[data-cy=log-card-row-value]')
          .should('exist');
      });
      cy.get('[data-cy=logic-executors]')
        .find('[data-cy=log-card-label]')
        .contains('Logic executors');
      cy.get('[data-cy=logic-executors]')
        .find('[data-cy=log-card-row-value]')
        .should('exist');
    });
    cy.get('[data-cy=additional-log-info-toggle]').click();
    const dialogColumns = ['date', 'action', 'name', 'data'];
    dialogColumns.forEach((column) => {
      cy.get('[data-cy=logs-table]')
        .find(`[col-id="${column}"]`)
        .should('exist');
    });
    cy.get('[data-cy=download-record-button]')
      .should('be.visible')
      .and('be.enabled');
    cy.get('[data-cy=timezone-settings]')
      .should('be.visible')
      .and('be.enabled');

    // cy.log('Загрузка записи диалога');
    // cy.get('[data-cy=download-record-button]').click();
    // todo

    cy.log('Изменение “Time zone” для диалога');
    testTimezoneChanges();

    cy.log('Просмотр лога звонка');
    cy.visit(
      '/global-logs-v2/main?lng=en&dialog_uuid=9006acef-b3a2-453e-8c5d-9178ba26cb3d&start=03-09-2021%2015:00:00&end=19-11-2021%2004:53:48',
    );
    cy.wait(1000);
    cy.get('[data-cy=calls-display-button]').click();
    cy.wait('@getDialogInfo');
    cy.get('[data-cy=call-info]').click();
    cy.get('[data-cy=details-button]')
      .should('have.attr', 'target', '_blank')
      .should('be.visible')
      .then((link) => {
        cy.visit(link.prop('href'));
      });
    cy.wait(['@getConfiguration', '@getDialogInfo', '@getTrialStatus', '@getDialogLogs'], {
      timeout: 10000,
    });
    cy.location('pathname').should('include', '/global-logs');
    cy.get('[data-cy=additional-log-info-toggle]')
      .should('be.visible')
      .click();
    cy.get('[data-cy=logs-content]').within(() => {
      const blocks = [
        {
          title: 'log-info',
          labels: ['UUID', 'MSISDN', 'Pool'],
        },
        {
          title: 'date-agent',
          labels: [
            'Added date (agent)',
            'Called date (agent)',
            'Answer date (agent)',
            'Hangup date (agent)',
          ],
        },
        {
          title: 'date-local',
          labels: [
            'Added date (local)',
            'Called date (local)',
            'Answer date (local)',
            'Hangup date (local)',
          ],
        },
      ];
      blocks.forEach((block) => {
        block.labels.forEach((label) => {
          cy.get(`[data-cy=${block.title}]`)
            .find('[data-cy=log-card-row-label]')
            .contains(label);
        });
        cy.get(`[data-cy=${block.title}]`)
          .find('[data-cy=log-card-row-value]')
          .should('exist');
      });
      cy.get('[data-cy=logic-executors]')
        .find('[data-cy=log-card-label]')
        .contains('Logic executors');
      cy.get('[data-cy=logic-executors]')
        .find('[data-cy=log-card-row-value]')
        .should('exist');
    });
    cy.get('[data-cy=additional-log-info-toggle]').click();
    const callColumns = ['time', 'action', 'name', 'data'];
    callColumns.forEach((column) => {
      cy.get('[data-cy=logs-table]')
        .find(`[col-id="${column}"]`)
        .should('exist');
    });
    cy.get('[data-cy=download-record-button]')
      .should('be.visible')
      .and('be.enabled');
    cy.get('[data-cy=timezone-settings]')
      .should('be.visible')
      .and('be.enabled');

    cy.log('Загрузка записи звонка');
    cy.get('[data-cy=download-record-button]').click();
    cy.wait('@downloadCallRecord');
    cy.readFile(downloadedCallFilename);

    // cy.log('Изменение расположения/ширины столбцов');
    // todo
    // функционал увеличения/ уменьшения ширины столбцов
    // перемещение столбцов относительно друг друга
    /*cy.get('.ag-header-cell')
      .first()
      .contains('date')
      .click({ force: true })
      .trigger('mousedown', { button: 0 });
    cy.wait(500);
    cy.get('.ag-header-cell')
      .eq(2)
      .contains('name')
      .trigger('mousemove');
    cy.get('.ag-header-cell').first().realClick();
    cy.get('.ag-header-row').within(() => {
      cy.get('.ag-header-cell').each(($el, index) => {
        cy.log(String(index));
        cy.log($el.text().trim());
      });
    });
    // cy.get('.ag-header-cell').first() продолжает держать референс уже перенесенного объекта
    */
    // авторазмер для столбца
    // сброс, удаление столбца из списка

    cy.log('Изменение “Time zone” для звонка');
    testTimezoneChanges('time');
  });
});

function testTimezoneChanges(columnName: string = 'date') {
  cy.get('[data-cy=timezone-settings]').click();
  const timezoneOptions = ['agent', 'local', 'utc'];
  cy.get('.mat-menu-item').each(($el, index) => {
    cy.wrap($el)
      .should('contain.text', timezoneOptions[index])
      .and('be.visible');
  });
  cy.get(`[col-id="${columnName}"]`)
    .should('be.visible')
    .eq(1)
    .invoke('text')
    .then((text1) => {
      cy.get('.mat-menu-item')
        .contains('button', 'local')
        .click({ force: true });
      cy.wait('@getDialogInfo');
      cy.wait(1000);
      cy.get(`[col-id="${columnName}"]`)
        .eq(1)
        .invoke('text')
        .should((text2) => {
          expect(text1).not.to.eq(text2);
        });
    });
}
