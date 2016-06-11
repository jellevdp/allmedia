'use strict';

var express = require('express');
var controller = require('./block.controller');

var router = express.Router();

//Retrieve transactions from the latest block
//router.get('/lastblock', controller.lastblock);
router.get('/block', controller.list)

//Retrieve transactions from a specific block
//router.get('/block/:id', controller.block);


module.exports = router;