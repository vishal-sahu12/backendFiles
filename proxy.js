const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json()); // Parse incoming request body as JSON

// Create an Axios instance with a custom agent to ignore certificate validation
const agent = new https.Agent({
  rejectUnauthorized: false
});

const proxy = axios.create({
  httpsAgent: agent
});

//constants for Renewal URLs
const CM_URLR = 'https://subscriptionmanager.mtn.cm/kpi_cmr/api/datasources/proxy/2/query';

// Constants for URLs
const ES_URL = 'https://vas-sm.mtn.co.sz/kpi_swz/api/datasources/proxy/3/query';
const NG_URL = 'https://smprod.mtn.ng/kpi_nga/api/datasources/proxy/2/query';
const CM_URL = 'https://subscriptionmanager.mtn.cm/kpi_cmr/api/datasources/proxy/3/query';
const ZM_URL = 'https://grafana-vm-vas-sm.mtn.zm/api/datasources/proxy/2/query';
const CO_URL = 'https://subscriptionmanager.mtncongo.net/kpi_cog/api/datasources/proxy/3/query';

// Constants for URLs
const ES_URL1 = 'https://vas-sm.mtn.co.sz/kpi_swz';
const NG_URL1 = 'https://smprod.mtn.ng/kpi_nga';
const CM_URL1 = 'https://subscriptionmanager.mtn.cm/kpi_cmr';
const ZM_URL1 = 'https://grafana-vm-vas-sm.mtn.zm';
const Congo_URL1 = 'https://subscriptionmanager.mtncongo.net/kpi_cog';

// Common headers
const headersForEswatini = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=71e5c96af42314afb984432e222118fa' };
const headersForNigeria = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=f5ffa8af9c834aa8e3dae67a1e3363f1' };
const headersForCameroon = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=1a2d89a5263a3f48639af659f3b822b7' };
const headersForZambia = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=b86142239adb803cb9add921ddea3c61' };
const headersForCongo = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=e760d3ce084f069079b17904512b8139' };

// Activation endpoint handler
async function handleActivationRequest(url, headers, queryParams, queryParams2, queryParams3, queryParams4, queryParams5) {
  try {
    const response1 = await proxy.get(`${url}`, {
      params: queryParams,
      headers,
    });

    const response2 = await proxy.get(`${url}`, {
      params: queryParams2,
      headers,
    });

    const response3 = await proxy.get(`${url}`, {
      params: queryParams3,
      headers,
    });

    const response4 = await proxy.get(`${url}`, {
      params: queryParams4,
      headers,
    });

    const response5 = await proxy.get(`${url}`, {
      params: queryParams5,
      headers,
   });

    const combinedResponse = {
      data1: response1.data,
      data2: response2.data,
      data3: response3.data,
      data4: response4.data,
      data5: response5.data,
    };

    return combinedResponse;
  } catch (error) {
    console.error('Proxy request failed:', error.message);
    throw new Error('Internal Server Error');
  }
}

// Renewals endpoint handler
async function handleActivationRequestRenewals(url, headers, queryParams4) {
  try {

    const response4 = await proxy.get(`${url}`, {
      params: queryParams4,
      headers,
    });

    const combinedResponse = {
      data4: response4.data,
    };

    return combinedResponse;
  } catch (error) {
    console.error('Proxy request failed:', error.message);
    throw new Error('Internal Server Error');
  }
}

// Dynamic endpoint creation
function createActivationEndpoint(country, url, headers) {
  return async (req, res) => {
    const db = 'telegraf';
    const epochParam = 'epoch=ms';
    const q1 = 'SELECT lable, value AS "Renewal Status" FROM "HOURLY_RENEWAL_STATUS" WHERE lable=\'"new_sub"\' and time >= now() - 8d and time <= now() order by time';
    const q2 = 'SELECT lable, value AS "Renewal Status" FROM "HOURLY_RENEWAL_STATUS" WHERE lable=\'"Renewal_Attempted"\' and time >= now() - 8d and time <= now() order by time';
    const q3 = 'SELECT lable, value AS "Renewal Status" FROM "HOURLY_RENEWAL_STATUS" WHERE lable=\'"renewal_ondemand"\' and time >= now() - 8d and time <= now() order by time';
    const q4 = 'SELECT lable, value AS "Renewal Status" FROM "HOURLY_RENEWAL_STATUS" WHERE lable=\'"renewal_ondemand_fail"\' and time >= now() - 8d and time <= now() order by time';
    const q5 = 'SELECT *  FROM "csi_responce" WHERE transection=\'"Transfer_Success"\' and time >= now() - 8d and time <= now() order by time';
   
    const queryParams = { db, q: q1, epoch: epochParam };
    const queryParams2 = { db, q: q2, epoch: epochParam };
    const queryParams3 = { db, q: q3, epoch: epochParam };
    const queryParams4 = { db, q: q4, epoch: epochParam };
    const queryParams5 = { db, q: q5, epoch: epochParam };

    try {
      const result = await handleActivationRequest(url, headers, queryParams, queryParams2, queryParams3, queryParams4, queryParams5);
      res.json(result);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
}


function createActivationEndpointZambia(country, url, headers) {
  return async (req, res) => {
    const db = 'telegraf';
    const epochParam = 'epoch=ms';
    const q1 = 'SELECT lable, value, time FROM "HOURLY_RENEWAL_STATUS" where time >= now() - 8d and time <= now() order by time';
    const queryParams4 = { db, q: q1, epoch: epochParam };

    try {
      const result = await handleActivationRequestRenewals(url, headers, queryParams4);
      res.json(result);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
}

function createActivationEndpointRenewal(country, url, headers) {
  return async (req, res) => {
    const db = 'telegraf';
    const epochParam = 'epoch=ms';
    const q1 = 'SELECT * FROM "renewalbi2" WHERE time >= now() - 8d AND time <= now() ORDER BY time';
    const queryParams4 = { db, q: q1, epoch: epochParam };

    try {
      const result = await handleActivationRequestRenewals(url, headers, queryParams4);
      res.json(result);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
}

// Activation endpoints
app.post('/proxy/eswatini/activations', createActivationEndpoint('eswatini', ES_URL, headersForEswatini));
app.post('/proxy/nigeria/activations', createActivationEndpoint('nigeria', NG_URL, headersForNigeria));
app.post('/proxy/cameroon/activations', createActivationEndpoint('cameroon', CM_URL, headersForCameroon));
app.post('/proxy/congo/activations', createActivationEndpoint('congo', CO_URL, headersForCongo));
app.post('/proxy/zambia/activations', createActivationEndpointZambia('zambia', ZM_URL, headersForZambia));
app.post('/proxy/zambia/renewals', createActivationEndpointRenewal('zambia', ZM_URL, headersForZambia));
app.post('/proxy/cameroon/renewals', createActivationEndpointRenewal('cameroon', CM_URLR, headersForCameroon));
app.post('/proxy/eswatini/renewals', createActivationEndpointRenewal('eswatini', ES_URL, headersForEswatini));
app.post('/proxy/nigeria/renewals', createActivationEndpointRenewal('nigeria', NG_URL, headersForNigeria));

// Other proxy endpoints
app.post('/proxy/eswatini', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=71e5c96af42314afb984432e222118fa' };
    const response = await proxy.post(`${ES_URL1}/api/ds/query`, req.body, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy request failed:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/proxy/nigeria', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=445c9de4cde5df18daa728dffc890ba2' };
    const response = await proxy.post(`${NG_URL1}/api/ds/query`, req.body, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy request failed:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/proxy/cameroon', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=a5db0693ef20c6c6c03fb58138cf9def' };
    const response = await proxy.post(`${CM_URL1}/api/ds/query`, req.body, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy request failed:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/proxy/zambia', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=c6f09037316377e8c7fd46be13108efe' };
    const response = await proxy.post(`${ZM_URL1}/api/ds/query`, req.body, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy request failed:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/proxy/congo', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json', 'Cookie': 'grafana_session=506f5fe04f8c70b039effcaa4b28196a' };
    const response = await proxy.post(`${Congo_URL1}/api/ds/query`, req.body, { headers });
    res.json(response.data);

  } catch (error) {
    console.error('Proxy request failed:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
