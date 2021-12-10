

describe('Agent - Queue Page', () => {
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

    cy.login();
    cy.log('Выбираем тестового агента');
    cy.get('[formcontrolname="query"]')
      .type(agent)
      .wait(wait);
    cy.wait(['@getAgents']);
    cy.get('[data-cy=agent-card]')
      .contains('[data-cy=agent-card-name]', agent)
      .click();
    cy.get('[data-cy=total_channel_limit-field]')
      .clear()
      .type('0');
  });

  const wait = 1000;
  const agent = 'cypress_agent';
  const agentUuid = 'd46b5aa6-81ed-4bd1-8f8c-1a2a1cd989bc';
  const largeFile = 'upload_dialogs_for_cypress_agent_large.xlsx';

  it('Загрузка элементов для тестирования', () => {
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
    cy.get('[data-cy=dropzone]').attachFile(largeFile, {
      subjectType: 'drag-n-drop',
    });
    cy.get('[data-cy=file-name]').contains(largeFile);
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
  });

  it('Проверка отображения страницы.', () => {
    cy.log('Переходим в раздел Queue');
    cy.contains('Queue').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/queue-v2');

    cy.log('Проверка отображения страницы Queue');
    cy.get('[data-cy=search-selections]').should('be.visible');
    cy.get('[data-cy=all-agents]').should('be.visible');
    cy.get('[data-cy=all-companies]').should('be.visible');
    cy.get('[data-cy=get-data-button]').should('be.visible');

    cy.get('[data-cy=change-direction-btn]')
      .should('be.visible')
      .click()
      .then(() => {
        const sortingMenuItems = ['By date added (oldest)', 'By date added (newest)', 'By name'];
        cy.get('.mat-menu-item').each(($el, index) => {
          cy.wrap($el).contains(sortingMenuItems[index]);
          cy.wrap($el).should('contain.text', sortingMenuItems[index]);
          expect(
            Cypress.$($el)
              .text()
              .trim(),
          ).to.eq(sortingMenuItems[index]);
        });
      });

    cy.get('.cdk-overlay-backdrop')
      .click()
      .wait(wait);

    cy.get('[data-cy=all-selections]').should('be.visible');
  });

  it('Проверка списка панелей, соответствующих диалогам', () => {
    cy.log('Переходим в раздел Queue');
    cy.contains('Queue').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/queue-v2');

    cy.get('.app-queue-group-row').each(($el, index) => {
      cy.wrap($el)
        .get('[data-cy=circle-progress]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=file-name]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=started-on]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=agent-name]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=company-name]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=duration]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=run-selection-btn]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=stop-btn]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=delete-btn]')
        .should('be.visible');
      cy.wrap($el)
        .get('[data-cy=uuid]')
        .should('be.visible');

      cy.wrap($el)
        .find('.app-queue-group-row__counter-value')
        .each(($value) => {
          cy.wrap($value).should('not.be.empty');
        });
    });
  });

  it('Проверка работы страницы Queue внутри агента', () => {
    cy.log('Переходим в раздел Queue');
    cy.contains('Queue').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/queue-v2');

    cy.wait(wait);
    cy.get('.nui-paginator').should('be.visible');

    cy.intercept({
      method: 'POST',
      url: '**/queue/selection',
    }).as('getSelections');

    cy.log('Проверка сортировки от большего к меньшему и наоборот.');
    cy.get('[data-cy=change-direction-btn]')
      .should('be.visible')
      .click()
      .then(() => {
        cy.contains('By date added (oldest)').click();
      });

    cy.wait('@getSelections').then((interception) => {
      assert.isNotNull(interception.response.body, 'Get selections');
      cy.location().should((loc) => {
        expect(loc.search).to.includes('?page=1&sort=asc:started_on');
      });
    });

    cy.get('[data-cy=change-direction-btn]')
      .should('be.visible')
      .click()
      .then(() => {
        cy.contains('By date added (newest)').click();
      });

    cy.wait('@getSelections').then((interception) => {
      assert.isNotNull(interception.response.body, 'Get selections');
      cy.location().should((loc) => {
        expect(loc.search).to.includes('?page=1&sort=desc:started_on');
      });
    });

    cy.get('[data-cy=change-direction-btn]')
      .should('be.visible')
      .click()
      .then(() => {
        cy.contains('By name').click();
      });

    cy.wait('@getSelections').then((interception) => {
      assert.isNotNull(interception.response.body, 'Get selections');
      cy.location().should((loc) => {
        expect(loc.search).to.includes('?page=1&sort=asc:name');
      });
    });

    cy.log('Проверка пагинации.');
    cy.get('.nui-paginator')
      .contains('2')
      .click()
      .then(() => {
        cy.location().should((loc) => {
          expect(loc.search).to.includes('?page=2');
        });
      });
    cy.get('.nui-paginator')
      .contains('1')
      .click()
      .then(() => {
        cy.location().should((loc) => {
          expect(loc.search).to.includes('?page=1');
        });
      });

    cy.log('Проверка работы поиска.');
    cy.get('[data-cy=search-selections]')
      .type('upload_dialogs_for_cypress_agent_large')
      .then(() => {
        cy.get('[data-cy=get-data-button]')
          .click()
          .then(() => {
            cy.wait('@getSelections').then((interception) => {
              assert.isNotNull(interception.response.body, 'Get selections');
              cy.location().should((loc) => {
                expect(loc.search).to.includes(
                  '?page=1&query=upload_dialogs_for_cypress_agent_large',
                );
              });
            });
          });
      });

    cy.get('[data-cy=change-direction-btn]')
      .should('be.visible')
      .click()
      .then(() => {
        cy.contains('By date added (newest)').click();
      });
    cy.wait(wait);
  });

  it('Проверка данных выборки.', () => {
    cy.log('Проверка данных выборки.');

    cy.log('Переходим в раздел Queue');
    cy.contains('Queue').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/queue-v2');

    cy.get('.app-queue-group-row')
      .first()
      .click({ force: true })
      .then(() => {
        cy.location().should((loc) => {
          expect(loc.pathname).to.includes('/queue-v2/(page:calls/');
        });
        cy.get('[data-cy=name-search]').should('be.visible');
        cy.get('[data-cy=calls-get-data]').should('be.visible');
        cy.get('[data-cy=change-direction-btn]').should('be.visible');
        cy.get('[data-cy=statuses-list-select]').should('be.visible');
        cy.get('[data-cy=toggle-menu]').should('be.visible');
        cy.get('[data-cy=toggle-dialogs-btn]').should('be.visible');
        cy.get('[data-cy=toggle-calls-btn]').should('be.visible');
        cy.get('[data-cy=calls-title]').should(
          'contain.text',
          'upload_dialogs_for_cypress_agent_large.xlsx',
        );
      });

    cy.wait(wait);
    cy.get('app-calls [data-cy=statuses-list-select]')
      .click({ force: true })
      .then(() => {
        const sortingMenuItems = ['All statuses', 'Active', 'In queue', 'Stopped', 'Created'];
        cy.get('.mat-option-text')
          .should('be.visible')
          .each(($el, index) => {
            cy.wrap($el).contains(sortingMenuItems[index]);
            cy.wrap($el).should('contain.text', sortingMenuItems[index]);
            expect(
              Cypress.$($el)
                .text()
                .trim(),
            ).to.eq(sortingMenuItems[index]);
          });
      });

    cy.get('.cdk-overlay-backdrop')
      .click()
      .wait(wait);

    cy.wait(wait);
    cy.get('.app-calls__head [data-cy=change-direction-btn]')
      .should('be.visible')
      .click({ force: true })
      .then(() => {
        const menuItems = ['By result', 'By name'];
        cy.get('.mat-menu-item')
          .should('be.visible')
          .each(($el, index) => {
            cy.wrap($el).contains(menuItems[index]);
            cy.wrap($el).should('contain.text', menuItems[index]);
            expect(
              Cypress.$($el)
                .text()
                .trim(),
            ).to.eq(menuItems[index]);
          });
      });

    cy.get('.cdk-overlay-backdrop')
      .click()
      .wait(wait);

    cy.wait(wait);
    cy.get('.app-calls__head [data-cy=action-menu]')
      .should('be.visible')
      .click({ force: true })
      .then(() => {
        const menuItems = ['Stop all dialogs', 'Run all dialogs', 'Remove all dialogs'];
        cy.get('.mat-menu-item')
          .should('be.visible')
          .each(($el, index) => {
            cy.wrap($el).contains(menuItems[index]);
            cy.wrap($el).should('contain.text', menuItems[index]);
            expect(
              Cypress.$($el)
                .text()
                .trim(),
            ).to.eq(menuItems[index]);
          });
      });

    cy.get('.cdk-overlay-backdrop')
      .click()
      .wait(wait);
  });

  it('Проверка управления всеми диалогами в контекстном меню.', () => {
    cy.log('Проверка управления всеми диалогами в контекстном меню.');

    cy.log('Переходим в раздел Queue');
    cy.contains('Queue').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/queue-v2');

    cy.get('.app-queue-group-row')
      .first()
      .click({ force: true });

    cy.intercept({
      method: 'POST',
      url: '**/queue/dialog/stop?**',
    }).as('dialogsStop');

    cy.wait(wait);

    cy.get('.app-calls__head [data-cy=action-menu]')
      .should('be.visible')
      .click()
      .then(() => {
        cy.contains('Stop all dialogs')
          .click()
          .then(() => {
            cy.wait('@dialogsStop').then(() => {
              cy.wait(wait);
              cy.get('.app-calls__container')
                .find('[secondary-content]')
                .each(($el, index) => {
                  cy.wrap($el).should('have.text', 'Stopped');
                });
            });
          });
      });

    cy.intercept({
      method: 'POST',
      url: '**/queue/dialog/return?**',
    }).as('dialogsRun');

    cy.get('.app-calls__head [data-cy=action-menu]')
      .should('be.visible')
      .click()
      .then(() => {
        cy.contains('Run all dialogs')
          .click()
          .then(() => {
            cy.wait('@dialogsRun').then(() => {
              cy.wait(wait);
              cy.get('.app-calls__container')
                .find('[secondary-content]')
                .each(($el, index) => {
                  cy.wrap($el).should('have.text', 'Created');
                });
            });
          });
      });

    cy.wait(wait);
    cy.log('Проверка пагинации.');

    cy.intercept({
      method: 'POST',
      url: '**/queue/dialog',
    }).as('paginationDialogs');

    cy.get('app-calls .nui-paginator')
      .contains('2')
      .click()
      .then(() => {
        cy.location().should((loc) => {
          expect(loc.search).to.includes('subPage=2');
        });
      });
    cy.get('app-calls .nui-paginator')
      .contains('1')
      .click()
      .then(() => {
        cy.location().should((loc) => {
          expect(loc.search).to.includes('subPage=1');
        });
      });

    cy.log('Проверка работы поиска.');
    cy.get('[data-cy=name-search]')
      .type('5555')
      .then(() => {
        cy.get('[data-cy=calls-get-data]')
          .click()
          .then(() => {
            cy.wait('@paginationDialogs').then((interception) => {
              assert.isNotNull(interception.response.body, 'Get dialogs');
              cy.location().should((loc) => {
                expect(loc.search).to.includes('subQuery=5555');
              });
            });
          });
      });

    cy.wait(wait);
  });

  it('Удаление выборки', () => {
    cy.log('Переходим в раздел Queue');
    cy.contains('Queue').click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/queue-v2');

    cy.wait(wait);

    cy.get('[data-cy=change-direction-btn]')
      .should('be.visible')
      .click()
      .then(() => {
        cy.contains('By date added (oldest)').click();
      });

    cy.wait(wait);

    cy.intercept({
      method: 'DELETE',
      url: '**/queue/selection/**',
    }).as('deleteSelection');

    cy.get('.app-queue-group-row')
      .first()
      .then(($row) => {
        cy.wrap($row)
          .find('[data-cy=delete-btn]')
          .should('be.visible')
          .click()
          .then(() => {
            cy.get('[data-cy=remove-confirm-button]').click();
            cy.wait('@deleteSelection').then((interception) => {
              cy.log('Удаление выборки');
            });
          });
      });
  });
});
