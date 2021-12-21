'use strict';

const express = require('express');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const xsenv = require('@sap/xsenv');
const products = require('./products');
const auth = require('./auth');

const sbssCredentials = xsenv.cfServiceCredentials(process.env.SBSS_SERVICE_NAME);
const checkUser = auth(sbssCredentials);

passport.use(new BasicStrategy((username, password, done) => {
  checkUser(username, password, (err, user) => {
    if (err) { return done(err); }
    if (!user) { return done(null, false); }

    return done(null, user);
  });
}));

const app = express();

app.use(passport.authenticate('basic', { session: false }));

app.get('/products', (req, res) => res.json(products.getAll()));
app.get('/products/:productId', (req, res) => {
  const product = products.get(parseInt(req.params.productId));
  if (!product) { return res.status(404).end(); }

  res.json(product);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`SBF framework demo: products service application listening on port ${port} !`);
});
