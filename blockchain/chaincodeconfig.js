//var credentials = require('./credentials.json')['ibm-blockchain-4-prod'][0].credentials;


var environments = {

    // Bluemix + github. Tested and working (locally and on bluemix).
//    production : {
//        network:{
//            peers: credentials.peers,
//            users: credentials.users,
//        },
//        chaincode:{
//            zip_url: ' ',
//            unzip_dir: ' ',
//            git_url: ' ',
//
//            //hashed cc name from prev deployment
//            deployed_name: ''
//        }
//    },


    //  Connect to locally running IBM Blockchain (inside obc-dev-env)
    development : {
        network:{
            peers: [
            // You can find this information in the obc-dev-env
            // in $GOPATH/src/github.com/openblockchain/obc-peer/openblockchain.yaml.
            {
                discovery_host: '0.0.0.0',
                discovery_port: '30303',
                api_host: 'localhost',
                api_port: '5000',
                type: 'peer',
                network_id: 'dev',
                id: 'jdoe',
                api_url: 'http://localhost:5000'
              }
            ],
            // in $GOPATH/src/github.com/openblockchain/obc-peer/obc-ca/obcca.yaml.
            users: [
            {
                username: 'emma1',
                secret: 'passw0rd',
                usertype: 1
            },
            {
                username: 'bob1',
                secret: 'passw0rd',
                usertype: 1
            },
            {
                username: 'jim1',
                secret: 'passw0rd',
                usertype: 1
            },
            {
                username: 'john1',
                secret: 'passw0rd',
                usertype: 1
            },
            {
                username: 'cl1',
                secret: 'passw0rd',
                usertype: 2
            },
            {
                username: 'appr1',
                secret: 'passw0rd',
                usertype: 3
            },
             {
                 username: 'appr2',
                 secret: 'passw0rd',
                 usertype: 3
             }
            ]
        },
        // NOTE: using custom version of ibm-bc-js to allow http instead of https.
        chaincode:{
            // ibc uses these
            zip_url: 'http://localhost:8080/cc.zip', 	        // routes/serve_chaincode_zip
            unzip_dir: 'deploy', 							// subdirectroy of chaincode after unzipped
            git_url: 'chaincode/deploy',                          // File url in the obc-dev-env container: $GOPATH/src/...
            deployed_name: null,     						    // hashed cc name from prev deployment. Makes sure no redeploy is needed!
            // custom additions
            local_path: 'chaincode/deploy',        	// the path to the chaincode dir on this machine.
            auto_redeploy: true 						        // watch the filesystem for changes
        }
    }
}


// for instance cf env to check if we are in bluemix.

module.exports = environments[process.env.NODE_ENV] || environments.development;
