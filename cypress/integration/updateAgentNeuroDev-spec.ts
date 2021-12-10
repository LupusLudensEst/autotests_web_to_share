// const fs = require('fs');
import {
  url,
  login,
  password,
  value_recall_count,
  value_language,
  value_delay, value_name, verify_company_uuid, verify_status, default_agent_settings
} from '..\\fixtures\\configData'; // импорт переменных из файла по маршруту

// import {
//   default_agent_settings
// } from '..\\fixtures\\updateAgentNeuroDev-spec.json'; // импорт переменных из файла по маршруту

// import default_agent_settings from '..\\..\\cypress\\fixtures\\updateAgentNeuroDev-spec';
// MapUtils.deserialize(default_agent_settings);
// fs.writeFileSync('./updateAgentNeuroDev-spec.json', JSON.stringify(file, null, 2));

// Читаем из updateAgentNeuroDev-spec.json  cy.readFile('menu.json')
// const read_updateAgentNeuroDev_spec = JSON.parse(fs.readFileSync('..\\fixtures\\updateAgentNeuroDev-spec.json'));
// const read_updateAgentNeuroDev_spec = cy.readFile('..\\fixtures\\updateAgentNeuroDev-spec.json');
// console.log(read_updateAgentNeuroDev_spec)

describe('To get token', () => {

    let token = '';
    let agent_uuid = ''; // добавлен agent_uuid

    it('To get token', () => {
          // To get token

          cy.request({
            method: 'POST',
            url: `${url}/api/v2/ext/auth`,
            auth: {
              username: login, password: password,
              },
            })

            .then(responce => {

              cy.log(JSON.stringify(responce));
              cy.log(responce.body.token); // token вытаскивается
              token = responce.body.token; // вытащенный token передается в одноименную переменную под возможную потребность
              cy.log(responce.body.agent_uuid); // agent_uuid вытаскивается
              agent_uuid = responce.body.agent_uuid // вытащенный agent_uuid передается в одноименную переменную под возможную потребность
            });
          })

describe('Update Agent Neuro Dev', () => {

    it('Update Agent Neuro Dev', () => {

      // const read_updateAgentNeuroDev_spec = JSON.stringify(cy.readFile('..\\fixtures\\updateAgentNeuroDev-spec.json'));
      // const read_updateAgentNeuroDev_spec = JSON.parse(fs.readFileSync('..\\fixtures\\updateAgentNeuroDev-spec.json'));
      // console.log(read_updateAgentNeuroDev_spec)

          // Actual
          cy.request({
            method: 'PUT',
            url: `${url}/api/v2/rbac/agent/425384c8-d3ff-4def-b58c-7376957da666`,
            headers: {
              'Authorization': 'Bearer ' +  token
            },
            body: {
              'recall_count': value_recall_count,
              'delay': value_delay,
              'name': value_name,
              'language': value_language,
              'body': default_agent_settings,
            }

            // Expected
          }).then((res) => {

              cy.log(JSON.stringify(res))
              expect(res.status).to.eq(verify_status)
              expect(res.body).has.property('recall_count', value_recall_count)
              expect(res.body).has.property('language', value_language)
              expect(res.body).has.property('company_uuid', verify_company_uuid)
              expect(res.body).has.property('tts_voice', "oksana")
              expect(res.body).has.property('total_channel_limit', 3)
          })
        })
    })
})

