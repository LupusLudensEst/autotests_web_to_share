const body = require('../fixtures/jsonSend')

import {
  url,
  login,
  password,
  value_recall_count,
  value_language,
  value_delay,
  value_name,
  verify_company_uuid,
  verify_status,
  verify_tts_voice,
  verify_total_channel_limit,
  value_tts_voice,
  value_total_channel_limit
} from '..\\fixtures\\dataVerify'; // см. стр. 51 ниже. посылается на б.энд, импортировано из E:\IT\Testing\Automation_08_09_2019\autotests_web\cypress\fixtures\dataVerify.ts

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

          // Actual
          cy.request({
            method: 'PUT',
            url: `${url}/api/v2/rbac/agent/425384c8-d3ff-4def-b58c-7376957da666`,
            headers: {
              'Authorization': 'Bearer ' +  token
            },
            body: body.body // импортировано из E:\IT\Testing\Automation_08_09_2019\autotests_web\cypress\fixtures\jsonSend.js

            // Expected
          }).then((res) => {

              cy.log(JSON.stringify(res))
              expect(res.status).to.eq(verify_status) // см. стр. 3 выше. переменные для верификации с респонсом, импортированы из E:\IT\Testing\Automation_08_09_2019\autotests_web\cypress\fixtures\dataVerify.ts
              expect(res.body).has.property('recall_count', value_recall_count)
              expect(res.body).has.property('language', value_language)
              expect(res.body).has.property('company_uuid', verify_company_uuid)
              expect(res.body).has.property('tts_voice', value_tts_voice)
              expect(res.body).has.property('total_channel_limit', value_total_channel_limit)
          })
        })
    })
})

