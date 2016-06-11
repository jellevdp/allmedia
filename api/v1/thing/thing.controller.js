'use strict';
const blockchain = require('../../../blockchain/blockchain');
const Thing = require('./thing.model');

/*
    Retrieve list of all things

    METHOD: GET
    URL : /api/v1/thing
    Response:
        [{'thing'}, {'thing'}]
*/
exports.list = function(req, res) {
    console.log("-- Query all thing --")
    blockchain.chaincode.query(["get_all_things"], function(err, things){
        if(err) console.log("Error ", err);
        if (!things) {
            res.json([]);
        } else {
            things = JSON.parse(things);
            console.log("Retrieved things from the blockchain: # " + things.length);
            res.json(things);
        }
    });
}

/*
    Retrieve thing object

    METHOD: GET
    URL: /api/v1/thing/:thingId
    Response:
        { thing }

*/
exports.detail = function(req, res) {
    const thingId = req.params.thingId;

    blockchain.chaincode.query(["get_thing", thingId], function(err, thing){
        if(err) console.log("Error", err);
        if (!thing) {
            res.json([]);
        } else {
            console.log("Retrieved thing with ID: " + thing.id);
            res.json(thing);
        }
    })
}

