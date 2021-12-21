#!/usr/bin/env node

'use strict';

/* eslint-disable no-console */

const fs = require('fs');
const { v4: uuid } = require('uuid');
const validate = require('./lib/validation/validate-catalog.js');
const VError = require('verror');

try {
  processCatalog();
} catch (err) {
  console.error(err.message);
  err.hint && console.log(err.hint);
  process.exit(1);
}

function processCatalog() {
  const filePath = getFilePath();
  let catalogChanges;

  try {
    let catalog = readCatalog(filePath);
    validate(catalog, { ignoreMissingIds: true });
    catalogChanges = updateCatalog(catalog);
    updateFile(filePath, catalog);
  } catch (err) {
    throw new VError(err, `Could not process ${filePath}`);
  }

  printCatalogChanges(catalogChanges, filePath);
}

function getFilePath() {
  const userInput = process.argv.slice(2);

  if (userInput.length > 1) {
    let err = new Error(`Too many command line arguments provided: ${userInput.length}`);
    err.hint = `Usage:
      "gen-catalog-ids" - takes catalog.json from the current working directory
      "gen-catalog-ids <path-to-catalog.json>" - takes catalog.json from the provided path`;
    throw err;
  }

  const filePath = (userInput.length === 1) ? userInput[0] : 'catalog.json';

  return filePath;
}

function readCatalog(filePath) {
  return JSON.parse(fs.readFileSync(filePath));
}

function updateCatalog(catalog) {
  let catalogChanges = [];

  catalog.services.forEach(function (service, serviceIdx) {
    if (!service.id) {
      const newId = uuid();
      service.id = newId;
      catalogChanges.push(`services[${serviceIdx}].id <- ${newId}`);
    }

    service.plans.forEach(function (plan, planIdx) {
      if (!plan.id) {
        const newId = uuid();
        plan.id = newId;
        catalogChanges.push(`services[${serviceIdx}].plans[${planIdx}].id <- ${newId}`);
      }
    });
  });

  return catalogChanges;
}

function updateFile(filePath, catalog) {
  fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2));
}

function printCatalogChanges(catalogChanges, filePath) {
  if (!catalogChanges.length) {
    console.log(`No ids generated, no changes to ${filePath}`);
    return;
  }
  console.log(`${catalogChanges.length} ids added to ${filePath}: ${JSON.stringify(catalogChanges, null, 2)}`);
}
