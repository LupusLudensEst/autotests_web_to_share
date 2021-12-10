describe('Conversation-flow/manual', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept({
      method: 'POST',
      url: '**/rbac/agent/get-list',
    }).as('getAgents'); // and assign an alias
    cy.intercept({
      method: 'GET',
      url: '**/rbac/agent/d46b5aa6-81ed-4bd1-8f8c-1a2a1cd989bc',
    }).as('getAgentSettings');
    cy.intercept({
      method: 'GET',
      url: '**/logic/logic_unit?agent_uuid=d46b5aa6-81ed-4bd1-8f8c-1a2a1cd989bc',
    }).as('getLogicUnits');

    cy.get('[formcontrolname="query"]').type('cypress_agent');
    cy.wait(['@getAgents']).then(() => {
      cy.log('agents received');
      cy.wait(1000);
      cy.get('[data-cy=agent-card]')
        .contains('[data-cy=agent-card-name]', 'cypress_agent')
        .click();
    });

    cy.wait(['@getAgentSettings']).then(() => {
      cy.log('agent settings received');
      cy.contains('Agent settings');
      cy.get('[data-cy=title-key]').contains('agent settings');
    });

    cy.get('[data-cy=sidebar-menu-item-link]')
      .contains('Conversation flow')
      .click();
    cy.wait(['@getLogicUnits']).then(() => {
      cy.log('logic units received');
      cy.get('[data-cy=title-key]').contains('conversation flow');
    });
  });

  it('Удаление дефолтного юнита', () => {
    cy.log('delete unit check');
    cy.intercept({
      method: 'DELETE',
      url: '**/logic/logic_unit/**',
    }).as('deleteLogicUnit');
    cy.get('[data-cy=editable-directive]')
      .parent()
      .trigger('mouseenter')
      .then(() => {
        cy.get('[data-cy=editable-actions-button]')
          .get('[data-mat-icon-name="18-delete"]')
          .click();
        cy.get('[data-cy=editable-actions-button]')
          .get('[data-mat-icon-name="18-ok"]')
          .click();
      });
    cy.wait(['@deleteLogicUnit']).then(() => {
      cy.log('logic unit deleted');
      cy.get('[data-cy=unit-list-item-name]').should('not.exist');
    });
  });

  it('Проверка отображения страницы', () => {
    cy.log('has fields check');
    cy.get('[data-cy=empty-unit-message]');
    cy.get('[id=toast-container]').contains('Default script is not set');

    cy.log('cancel create unit check');
    cy.get('[data-cy=add-unit-menu-button]').click();
    cy.get('[data-cy=manually-button]').click();
    cy.get('[data-cy=editable-text-input]').type('test_unit');
    cy.get('[data-cy=editable-directive]')
      .parent()
      .trigger('mouseenter')
      .then(() => {
        cy.get('[data-cy=editable-actions-button]')
          .get('[data-mat-icon-name="18-delete"]')
          .click();
        cy.get('[data-cy=unit-list-item-name]').should('not.exist');
      });

    cy.log('create unit check');
    cy.get('[data-cy=add-unit-menu-button]').click();
    cy.get('[data-cy=manually-button]').click();
    cy.get('[data-cy=editable-text-input]').type('test_unit');
    cy.intercept({
      method: 'POST',
      url: '**/logic/logic_unit',
    }).as('createLogicUnit');
    cy.get('[data-cy=editable-directive]')
      .parent()
      .trigger('mouseenter')
      .then(() => {
        cy.get('[data-cy=editable-actions-button]')
          .get('[data-mat-icon-name="18-ok"]')
          .click();
      });
    cy.wait(['@createLogicUnit']).then(() => {
      cy.get('[data-cy=unit-list-item-name]').as('logicUnitName');
      cy.get('[data-cy=empty-default-message]');
      cy.get('[data-cy=save-button]');
      cy.get('[data-cy=set-default-toggle]').should('not.have.class', 'mat-checked');
    });

    cy.log('edit unit cancel check');
    cy.get('[data-cy=editable-directive]')
      .parent()
      .trigger('mouseenter')
      .then(() => {
        cy.get('[data-cy=editable-actions-button]')
          .get('[data-mat-icon-name="18-edit"]')
          .click();
      });
    cy.get('[data-cy=editable-text-input]').type('unit1');
    cy.get('[data-cy=editable-directive]')
      .parent()
      .trigger('mouseenter')
      .then(() => {
        cy.get('[data-cy=editable-actions-button]')
          .get('[data-mat-icon-name="18-cancel"]')
          .click();
        cy.get('[data-cy=unit-list-item-name]').contains('test_unit');
      });

    cy.log('edit unit check');
    cy.get('[data-cy=editable-directive]')
      .parent()
      .trigger('mouseenter')
      .then(() => {
        cy.get('[data-cy=editable-actions-button]')
          .get('[data-mat-icon-name="18-edit"]')
          .click();
      });
    cy.get('[data-cy=editable-text-input]')
      .clear()
      .type('default');
    cy.intercept({
      method: 'PUT',
      url: '**/logic/logic_unit/**',
    }).as('putLogicUnit');
    cy.get('[data-cy=editable-directive]')
      .parent()
      .trigger('mouseenter')
      .then(() => {
        cy.get('[data-cy=editable-actions-button]')
          .get('[data-mat-icon-name="18-ok"]')
          .click();
      });
    cy.wait(['@putLogicUnit']).then(() => {
      cy.log('logic unit edited');
      cy.get('[data-cy=unit-list-item-name]').contains('default');
    });

    cy.log('set as default unit check');
    cy.intercept({
      method: 'POST',
      url: '**/logic/logic_unit/default**',
    }).as('setDefaultLogicUnit');
    cy.get('[data-cy=set-default-toggle]')
      .should('not.have.class', 'mat-checked')
      .click();
    cy.wait(['@setDefaultLogicUnit']).then(() => {
      cy.log('logic unit set as default');
      cy.get('[data-cy=set-default-toggle]').should('have.class', 'mat-checked');
    });

    cy.log('script unit check');
    cy.get('[data-cy=web-ide-editor]').should('have.class', 'ng-invalid');
    const defaultUnit = `from time import sleep
import json

if __name__ == '__main__':
    import libneuro
    nn = libneuro.NeuroNetLibrary()
    nlu = libneuro.NeuroNluLibrary()
    nv = libneuro.NeuroVoiceLibrary()
    InvalidCallStateError = libneuro.InvalidCallStateError
    check_call_state = libneuro.check_call_state
class Container:
    def __init__(self):
        self.global_recognition_result = None
container = Container()

def main():
    return hello_main()
def hello_main():
    nn.env('nv_listen_defaults__', json.dumps({'no_input_timeout': 4000, 'recognition_timeout': 40000, 'speech_complete_timeout': 1500, 'asr_complete_timeout': 5000}))
    nn.env('nv_random_sound_defaults__', json.dumps({'min_delay':2000, 'max_delay':4000}))
    return app_BackgroundSound5_ ()

def app_FlowchartEnd1_():
    nn.dialog.result = nn.RESULT_DONE
    nn.dump()
    return

def app_Hangup2_():
    nv.hangup()
    return app_FlowchartEnd1_()

def app_SetData3_():
    nn.env('xz', 'Гарри')
    return app_Conditions8_()

def app_OutboundCall4_():
    nn.call(msisdn=(nn.dialog['msisdn']), date=None, channel=None, use_default_prefix=True, entry_point='app_OutboundCall4__container', on_failed_call='app_SetData3_')
    return app_FlowchartEnd1_()

def app_OutboundCall4__container():

    try:
        app_SayAndListen9_()
    except InvalidCallStateError:
        nn.log('Звонок завершен, пропускается выполнение функций')
    finally:
        nn.dump()

def app_BackgroundSound5_():
    nv.background(None)
    return app_OutboundCall4_()

def app_Recognition6_():
    r = container.global_recognition_result
    if r.entity('hello_confirm') > 2 or \\
            r.entity('hello_confirm') > 5:
        return app_TextToSpeech7_()
    if not r.utterance():
        return app_Hangup2_()
    return app_Hangup2_()

def app_TextToSpeech7_():
    nv.synthesize(f'Я таких {nn.env("namee")}, как вы приветствую!', ssml=False)
    return app_Hangup2_()

def app_Conditions8_():
    if nn.env('xz') == 1 or \\
            nn.env('xz') == 2 or \\
            nn.env('xz') == 4:
        return app_Hangup2_()
    return app_TextToSpeech7_()

def app_SayAndListen9_():
    nv.set_default('listen', json.loads(nn.env('nv_listen_defaults__')))
    nv.set_default('random_sound', json.loads(nn.env('nv_random_sound_defaults__')))
    with nv.listen((None, None, None, 'OR'), entities='hello_confirm,a') as r:
        try:
            nv.say('baturin_phrase')
        except InvalidCallStateError:
            pass
    container.global_recognition_result = r
    nn.env('utterance', r.utterance())
    app_Recognition6_()
def after_call_success():
    nn.env('status', '+OK')
    nn.dump()
    return
def after_call_fail():
    nn.env('status', '-ERR')
    nn.dump()
    return`;
    cy.get('[data-cy=web-ide-editor] .inputarea')
      .clear()
      .paste(defaultUnit)
      // .invoke('val', defaultUnit, { parseSpecialCharSequences: true }).trigger('input')
      // .type(defaultUnit, { parseSpecialCharSequences: true })
      .then(() => {
        cy.get('[data-cy=save-button]').click();
      });
  });
});
