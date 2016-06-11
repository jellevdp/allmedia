'use strict';
const blockchain    = require('../blockchain/blockchain');
const config        = require('../config');
const crypto        = require('crypto');
const jwt           = require('jsonwebtoken');
const logger        = require('../utils/logger');
/*
    Authenticate user

    METHOD: POST
    URL : /auth/login
    Body:
        {
            credentials.username,
            credentials.password
        }
    Response:
        { token }
*/
exports.login = function(req, res) {

    logger.debug("Login attempt w/ username: ", req.body.username);
    blockchain.chaincode.query(["authenticate", req.body.username, req.body.password ], function(err, result) {

      if (err) {
        logger.error(err);
        throw err;
      }
      if (!result.user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (result.user) {

        // check if password matches
        if (!validPassword(result.user, req.body.password)) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {

          // if user is found and password is right
          // create a token
          var token = jwt.sign(result.user, config.secret, {
            expiresIn: 24 * 60 * 60 // expires in 24 hours
          });

          // return the information including token as JSON
          res.json({
            authenticated: result.authenticated,
            message: 'Enjoy your token!',
            token: token,
            user: result.user,
            certRole: result.certRole,
            thingId: result.thingId
          });
        }
      }

    });
}

function validPassword(user, password) {
        var hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64).toString('hex');
        return user.hash === hash;
}

exports.verify = function(req, res, next) {
    logger.debug("verifying API call");
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.secret, function(err, decoded) {
              if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
              } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    logger.debug("Token approved");
                    next();
              }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
}
