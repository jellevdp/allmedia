'use strict';
const blockchain = require('../../../blockchain/blockchain');
const blocksUtil = require('../../../utils/blocks')

/*
    Retrieve last 20 blocks

    METHOD: GET
    URL: /api/v1/block
    Response:
        ['block',  'block']

*/
// TODO minimum amounts of blocks configurable
exports.list = function(req, res) {
    // Get the latest chain stats
    blockchain.ibc.chain_stats(function(err, result) {
        if(err) console.log(err);
        // set blockheight
        const blockheight = result.height;
        var min = 0;
        // if there are more than 20 blocks, let i be height - 20
        if( blockheight > 20 ) {
            min = blockheight - 20
        }
        var count = min;
        // get last 20 blocks
        var blocks = [];
        for ( var i = min; i < blockheight; i++ ) {
            (function(){
                blockchain.ibc.block_stats( i, function(err, result) {
                    if(result) { blocks.push(result) };
                    count++;
                    if( count == blockheight ) {
                        blocks = sendBlocks(blocks);
                        res.json(blocks);
                    }
                })
            }(i));

        }
    })

}

function sendBlocks(blocks) {
    console.log("Sending blocks" + blocks.length);
    blocks.forEach(function(block, idx, blocks){
        console.log(block.uuid);
        blocks[idx].transactions = blocksUtil.decryptTransactionPayload(block.transactions);
    })
    return blocks;
}

/*
    Retrieve block with id

    METHOD: GET
    URL: /api/v1/block/:id
    Response:
        { 'block' }

*/
exports.block = function(req, res) {
    // Get the latest chain stats
    blockchain.ibc.block_stats( i, function(err, result) {
        if(!result) { res.status(404).send("Could not find block") };
        res.json(result);
    })

}