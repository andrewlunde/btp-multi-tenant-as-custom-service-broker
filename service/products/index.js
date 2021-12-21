'use strict';

const catalog = require('./catalog');

exports.getAll = () => catalog;

exports.get = productId => catalog.find(product => product.id === productId);
