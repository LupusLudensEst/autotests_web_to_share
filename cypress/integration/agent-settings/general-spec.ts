describe('Agent-settings/general Page', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Переход к настройкам агента', () => {
    cy.intercept({
      method: 'POST',
      url: '**/rbac/agent/get-list',
    }).as('getAgents'); // and assign an alias
    cy.get('[formcontrolname="query"]').type('cypress_agent');
    cy.wait(['@getAgents']).then(() => {
      cy.log('agents received');
    });
    cy.wait(1000);
    cy.intercept({
      method: 'GET',
      url: '**/rbac/agent/d46b5aa6-81ed-4bd1-8f8c-1a2a1cd989bc',
    }).as('getAgentSettings');
    cy.get('[data-cy=agent-card]')
      .contains('[data-cy=agent-card-name]', 'cypress_agent')
      .click();
    cy.wait(['@getAgentSettings']).then(() => {
      cy.log('agent settings received');
    });

    cy.contains('Agent settings');
    cy.get('[data-cy=title-key]').contains('agent settings');
    cy.getBySel('cancel-button');
    cy.getBySel('save-button');

    cy.log('not clear field check');
    cy.get('[data-cy=name-field]').clear();
    cy.get('[data-cy=description-field]').click();
    cy.get('[data-cy=name-field]').should('have.class', 'ng-invalid');

    cy.log('field length must be more than 1 check');
    cy.get('[data-cy=name-field]').type('a');
    cy.get('[data-cy=description-field]').click();
    cy.get('[data-cy=name-field]').should('have.class', 'ng-invalid');

    cy.log('field length must be less than 255 check');
    cy.get('[data-cy=name-field]').clear();
    const textToPaste =
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    cy.get('[data-cy=name-field]')
      .invoke('val', textToPaste)
      .trigger('blur');
    cy.get('[data-cy=description-field]').click();
    cy.get('[data-cy=name-field]').should('have.class', 'ng-invalid');

    cy.get('[data-cy=name-field]').clear();
    cy.get('[data-cy=name-field]').type('asidorov_renamed');
    cy.get('[data-cy=name-field]').should('not.have.class', 'ng-invalid');

    cy.log('not clear field check');
    cy.get('[data-cy=description-field]').clear();
    cy.get('[data-cy=name-field]').click();
    cy.get('[data-cy=description-field]').should('not.have.class', 'ng-invalid');

    cy.log('field length must be less than 255 check');
    cy.get('[data-cy=description-field]').clear();
    cy.get('[data-cy=description-field]').type(textToPaste);
    cy.get('[data-cy=name-field]').click();
    cy.get('[data-cy=description-field]').should('have.class', 'ng-invalid');

    cy.log('correct description check');
    cy.get('[data-cy=description-field]').clear();
    cy.get('[data-cy=description-field]').type('something');
    cy.get('[data-cy=description-field]').should('not.have.class', 'ng-invalid');

    cy.log('company check');
    cy.get('[data-cy=company-field]').contains('Neuro.net');

    cy.log('language check');
    cy.get('[data-cy=language-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'af',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('Afrikaans South Africa')
      .click();
    cy.get('[data-cy=language-button]').click();
    cy.get('.mat-dialog-title').contains('Languages');
    cy.get('[data-cy=languages-list-cancel-button]').click();

    cy.log('flag check');
    cy.get('[data-cy=flag-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'ds',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('ds')
      .click();
    cy.get('[data-cy=flag-button]').click();
    cy.get('.mat-dialog-title').contains('Voice Flags');
    cy.get('[data-cy=flags-list-cancel-button]').click();
    cy.wait(100);

    cy.log('timezone check');
    cy.get('[data-cy=timezone-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'nicos',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('Europe/Nicosia +02:00')
      .click();

    cy.log('pool check');
    cy.get('[data-cy=pool-field]').click();
    cy.intercept({
      method: 'POST',
      url: '**/search/rbac_pool/',
    }).as('getPools');
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'nev',
    );
    cy.wait(['@getPools']).then(() => {
      cy.log('pools received');
    });
    cy.get('.mat-option-text')
      .contains('vneverov_dev')
      .click();

    cy.log('trunk check');
    cy.get('[data-cy=trunk-field]').click();
    cy.intercept({
      method: 'GET',
      url: '**/rbac/trunk**',
    }).as('getTrunks');
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'ddd',
    );
    cy.wait(['@getTrunks']).then(() => {
      cy.log('trunks received');
    });
    cy.get('.mat-option-text')
      .contains('dddd')
      .click();

    cy.log('inbound-field check');
    cy.get('[data-cy=inbound-field]').click();
    cy.get('.mat-option-text')
      .contains('79261507121')
      .click();
    cy.get('[data-cy=inbound-number-text]');

    cy.log('outbound-field check');
    cy.get('[data-cy=outbound-field]').click();
    cy.get('.mat-option-text')
      .contains('None')
      .click();

    cy.log('asr-field check');
    cy.get('[data-cy=asr-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'asr_',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('asr_2')
      .click();
    cy.get('[data-cy=asr-field]').contains('asr_2');

    cy.log('reserve-asr-field check');
    cy.get('[data-cy=reserve-asr-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'neuro_',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('neuro_asr')
      .click();
    cy.get('[data-cy=reserve-asr-field]').contains('neuro_asr');

    cy.log('tts-field check');
    cy.get('[data-cy=tts-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'tts',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('tts')
      .click();
    cy.get('[data-cy=tts-field]').contains('tts');

    cy.log('tts-voice-field check');
    cy.get('[data-cy=tts-voice-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'jan',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('jane')
      .click();
    cy.get('[data-cy=tts-voice-field]').contains('jane');

    cy.log('reserve-tts-field check');
    cy.get('[data-cy=reserve-tts-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'tts',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('tts')
      .click();
    cy.get('[data-cy=reserve-tts-field]').contains('tts');

    cy.log('reserve-tts-voice-field check');
    cy.get('[data-cy=reserve-tts-voice-field]').click();
    cy.get('.mat-select-search-inside-mat-option .mat-select-search-input.mat-input-element').type(
      'za',
    );
    cy.wait(500);
    cy.get('.mat-option-text')
      .contains('zahar')
      .click();
    cy.get('[data-cy=reserve-tts-voice-field]').contains('zahar');

    cy.log('emotion-field check');
    cy.get('[data-cy=emotion-field]').clear();
    cy.get('[data-cy=emotion-field]').should('not.have.class', 'ng-invalid');
    cy.get('[data-cy=emotion-field]').type('evil');

    cy.log('speed-field check');
    cy.get('[data-cy=speed-field]').clear();
    cy.get('[data-cy=speed-field]').should('not.have.class', 'ng-invalid');
    cy.get('[data-cy=speed-field]').type('0.5');

    cy.log('pitch-field check');
    cy.get('[data-cy=pitch-field]').clear();
    cy.get('[data-cy=pitch-field]').should('not.have.class', 'ng-invalid');
    cy.get('[data-cy=pitch-field]').type('0.5');

    cy.log('synthesize-field check');
    cy.get('[data-cy=synthesize-field]').clear();
    cy.get('[data-cy=synthesize-field]').should('not.have.class', 'ng-invalid');
    cy.get('[data-cy=synthesize-field]').type('some text');

    cy.log('priority-field check');
    cy.get('[data-cy=priority-field]').click();
    cy.get('.mat-option-text')
      .contains('Low')
      .click();
    cy.get('[data-cy=priority-field]').contains('Low');

    cy.log('record_storage_time-field check');
    cy.get('[data-cy=record_storage_time-field]').clear();
    cy.get('[data-cy=record_storage_time-field]').type('0.5');

    cy.log('monitoring-field check');
    cy.get('[data-cy=monitoring-field]').should('have.class', 'mat-checked');

    cy.log('max_channel_limit-field check');
    cy.get('[data-cy=max_channel_limit-field]').clear();
    cy.get('[data-cy=max_channel_limit-field]').type('301');

    cy.log('total_channel_limit-field check');
    cy.get('[data-cy=total_channel_limit-field]').clear();
    cy.get('[data-cy=total_channel_limit-field]').type('500');
    cy.get('[data-cy=total_channel_limit-field]').should('have.class', 'ng-invalid');
    cy.get('[data-cy=total_channel_limit-field]').clear();
    cy.get('[data-cy=total_channel_limit-field]').type('301');
    cy.get('[data-cy=total_channel_limit-field]').should('not.have.class', 'ng-invalid');

    cy.log('gather_raw_data-field check');
    cy.get('[data-cy=gather_raw_data-field]').should('not.have.class', 'mat-checked');

    cy.log('block_editing-field check');
    cy.get('[data-cy=block_editing-field]').should('not.have.class', 'mat-checked');

    cy.log('отмена внесённых изменений');
    cy.get('[data-cy=cancel-button]').click();
    cy.wait(500);
    cy.get('[data-cy=total_channel_limit-field]').should('have.value', '0');
    cy.get('[data-cy=name-field]').should('have.value', 'cypress_agent');
    cy.get('[data-cy=description-field]').should('have.value', "DON'T TOUCH! this for tests ");
  });
});
