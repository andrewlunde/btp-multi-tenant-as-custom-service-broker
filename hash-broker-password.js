#!/usr/bin/env node

'use strict';

/* eslint-disable no-console */

const crypto = require('crypto');
const readline = require('readline');

const HASH_ALGO = 'sha256';
const SALT_SIZE = 32;
const SEPARATOR = ':';
const MIN_PASSWORD_LENGTH = 15;
const GENERATED_PASSWORD_LENGTH = 32;

const cliArgs = process.argv.slice(2);

if (cliArgs.length === 0) {
  runInteractiveMode();
} else if (cliArgs.length === 1 && cliArgs[0] === '-b') {
  runBatchMode();
} else {
  printUsage();
}

function printUsage() {
  console.error(
`Usage:
  "hash-broker-password" - prompts for a password and outputs its hash
  "hash-broker-password -b" - generates a password and outputs it along with its hash`);
  process.exit(1);
}

function runInteractiveMode() {
  getUserProvidedPassword(password => {
    password || abort('Password must be non-empty.');
    password.length < MIN_PASSWORD_LENGTH  &&
      console.log('Warning: For ISO/SOC compliance, the password should be at least 15 characters long.');

    console.log('Hashed credentials:\n%s', createHash(password));
  });
}

function abort(message) {
  console.error(message);
  process.exit(1);
}

function getUserProvidedPassword(callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    terminal: true // do not echo password on console
  });

  process.stdout.write('Broker password to be hashed: ');
  rl.on('line', (password) => {
    rl.close();
    console.log(); // line break after the password prompt
    callback(password);
  });
}

function runBatchMode() {
  const password = generatePassword();
  console.log('Plaintext password:\n%s', password);
  console.log('Hashed credentials:\n%s', createHash(password));
}

function generatePassword() {
  return crypto
    .randomBytes(GENERATED_PASSWORD_LENGTH)
    .toString('base64')
    .slice(0, GENERATED_PASSWORD_LENGTH);
}

function createHash(password) {
  const salt = crypto.randomBytes(SALT_SIZE);

  const digest = crypto
    .createHash(HASH_ALGO)
    .update(salt)
    .update(password)
    .digest('base64');

  return HASH_ALGO + SEPARATOR + salt.toString('base64') + SEPARATOR + digest;
}
