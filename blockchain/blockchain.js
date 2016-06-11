'use strict';
/**
 * This module manages the connection to the blockchain (via ibm blockchain js).
 * It can automatically deploy the chaincode for you by watching the filesystem.
 *
 * Call the init() function on start of your app.
 * 'chaincode' exposes the ibm blockchain js chaincode object (read its docs).
 */
var logger = require('../utils/logger');
var config = require('./chaincodeconfig.js');
var crypto = require('crypto');
var Ibc = require('ibm-blockchain-js');
var fs = require('fs');
var User = require('../api/v1/user/user.model')
var ibc = new Ibc();

const latestDeployedPath = 'blockchain/data/latest_deployed';
const summariesPath = 'blockchain/data/cc_summaries';

var blockchain = module.exports = {
	chaincode: null,
	ibc: ibc
};

// Initialize blockchain.
blockchain.init = function(){
	loadLatestDeployed(function(err, latestDeployed){
		// Don't overwrite the deployed_name if it's already set.
		if (!config.deployed_name && !err) {
			config.chaincode.deployed_name = latestDeployed;
		}
		ibc.load(config, deployChaincode);
	});
};


// On load, deploy the chaincode.
var deployChaincode = function(err, cc, forceRedeploy){
	if (err) {
		logger.error(err);
		return;
	}
	
	// set the chaincode variable (accessible from outside)
	blockchain.chaincode = cc;

	var notDeployedYet = cc.details.deployed_name === '';

	if (notDeployedYet || forceRedeploy){
		// Note: if the deploy function is exactly the same as at the last deployment, 
		// HyperLedger will generate the exact same hash and quietly refuse to
		// overwrite the old chaincode. Passing a unique string circumvents this.
		// (kind of a hack, we might want to think of something nicer).
		cc.deploy('init', ['test1', createHash()], summariesPath, afterDeployment);
	} else {
		logger.info('Using previously deployed chaincode:' + cc.details.deployed_name);
	}

	// start watching the chaincode for changes
	if (config.chaincode.auto_redeploy) 
		watchChaincodeFolder();
};

// Save details for deployed code
var afterDeployment = function(err, deployed) {
	if (err) {
		logger.error(err);
		return;
	}
	logger.info('Id:' + deployed.message);
	
	// store summary for ibc
	ibc.save(summariesPath);

	// store deployed_name
	saveLatestDeployed(deployed.message);

	// Place test data on blockchain
	invokeTestData();
};

var fsTimeout;

// Watch filesystem for chaincode changes and redeploy when a change is found. 
var watchChaincodeFolder = function(){		
	// NOTE: this does not watch subdirs. Check nodejs docs for quirks..
	fs.watch(config.chaincode.local_path, function(event){
		if (!fsTimeout){
			fsTimeout = setTimeout(function() { fsTimeout=null }, 5000);
			logger.info('---> ' + event + ' event fired. Redeploying...');
			deployChaincode(null, blockchain.chaincode, true);
		} 
	});
	logger.debug('Watching ' + config.chaincode.local_path + ' for changes...');
};


// store chaincode id for later use (so we don't have to redeploy).
var saveLatestDeployed = function(deployed_name) {
	fs.writeFile(latestDeployedPath, deployed_name);
};

// Load deployed name from file
var loadLatestDeployed = function(cb){
	fs.readFile(latestDeployedPath, function read(err, data) {
	    var latestDeployed = data ? data.toString() : null;
	    return cb(err, latestDeployed);
	});
};

// Generate a unique string
var createHash = function(){
	var md5 = crypto.createHash('md5');
	md5.update(new Date().getTime().toString());
	return md5.digest('base64').toString();
};


// =================================================================================
//  Create and invoke test data on to blockchain
// =================================================================================
const testData = require('../blockchain/testData');

function invokeTestData(){

          logger.debug("-- Deploying Test Data -- ")
          logger.debug("Users:       -- # ", testData.users.length);
          writeUsersToLedger(testData.users);

          logger.debug("Things:     -- # ", testData.things.length);
          writeClientsToLedger(testData.things);

//          logger.debug("Appraisals   -- #", testData.appraisals.length);
//          writeAppraisalsToLedger(testData.appraisals);
}

function writeUsersToLedger(users){
    users.forEach( function(user, idx) {
        user = new User(user.userId, user.password, user.firstName, user.lastName, user.things, user.address, user.phoneNumber, user.emailAddress );

        let userAsJson = JSON.stringify(user);
        logger.debug("Will add new user: ");
        logger.debug(userAsJson);
        blockchain.chaincode.add_user([user.userId, userAsJson], function(err, result){
            if(err) {
                logger.debug(err);
                next(err);
            }
            else logger.debug("-- Added user:  ", user.userId);
        })
    })
}

function writeClientsToLedger(things){
    things.forEach(function(thing, idx) {
        let thingAsJson = JSON.stringify(thing);
        logger.debug(thingAsJson);
        blockchain.chaincode.add_thing([thing.id, thingAsJson], function(err, result){
            if(err) {
                logger.debug(err);
                next(err);
            }
            else {
                logger.debug("-- Added thing: ", thing.id)
            }
        })
    })
}
