const express = require('express');
const router = express.Router();
const Zip = require('adm-zip');
const zip = new Zip();
const logger = require('./utils/logger');
const config = require('./blockchain/chaincodeconfig');
const authorize = require('./auth/auth.controller');

const filename = 'blockchain/data/cc.zip';

/* GET /cc.zip */
router.get('/cc.zip', (req, res) => {
    if (!config.chaincode.local_path) {
        res.error(500).end('local_path not set');
    }
    logger.profile('zip');
    console.log('Will use path: ' + config.chaincode.local_path + ' ' + config.chaincode.unzip_dir);
    zip.addLocalFolder(config.chaincode.local_path, config.chaincode.unzip_dir);
    zip.writeZip(filename);

    res.contentType('zip');
    res.end(zip.toBuffer());
    logger.profile('zip');
});

/* GET home page */
router.get('/', (req, res) => {
    res.render('client/index');
});

/* SET CORS HEADERS FOR API */
router.all('/api/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});

router.all('/api/*', authorize.verify);

/* API ROUTES */
router.use('/api/v1/thing', require('./api/v1/thing'));
router.use('/api/v1/user', require('./api/v1/user'));
router.use('/api/v1/block', require('./api/v1/block'));

module.exports = router;
