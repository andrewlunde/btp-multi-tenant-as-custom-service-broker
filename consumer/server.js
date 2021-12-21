'use strict';

const express = require('express');
const request = require('request');
const xsenv = require('@sap/xsenv');

const app = express();

const serviceName = process.env.PRODUCTS_SERVICE_NAME || '';
const credentials = xsenv.getServices({ products: serviceName }).products;

const doGet = (req, res) => {
  const productId = req.params.productId;
  const url = credentials.url + (productId && `/${productId}` || '');
  const auth = {
    user: credentials.username,
    pass: credentials.password
  };

  request.get({ url, auth }, (error, response, body) => {
    if (error) {
      /* eslint-disable no-console */
      console.error('Error requesting products service:', error);
      return res.status(500).send(error);
    }
    if (response.statusCode !== 200) {
      /* eslint-disable no-console */
      console.error(`Request to products service failed: ${response.statusCode}, ${response.statusMessage}`);
      return res.status(response.statusCode).send(response.statusMessage);
    }

    res.json(JSON.parse(body));
  });
};

app.get('/products', doGet);
app.get('/products/:productId', doGet);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`SBF framework demo: consumer application listening on port ${port} !`);
});
