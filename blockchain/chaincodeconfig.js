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
//            git_url: '',
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
                    username: 'lukas',
                    secret: 'NPKYL39uKbkj',
                    usertype: 1
                }
            ]
        },
        // NOTE: using custom version of ibm-bc-js to allow http instead of https.
        chaincode:{
        						zip_url: 'https://github.com/jellevdp/allmedia-chaincode/archive/master.zip',
        						unzip_dir: 'allmedia-chaincode-master',								//subdirectroy name of chaincode after unzipped
        						git_url: 'https://github.com/jellevdp/allmedia-chaincode',		//GO get http url

        						//hashed cc name from prev deployment
        						//deployed_name: '14b711be6f0d00b190ea26ca48c22234d93996b6e625a4b108a7bbbde064edf0179527f30df238d61b66246fe1908005caa5204dd73488269c8999276719ca8b'
        					}
    }
}


// for instance cf env to check if we are in bluemix.

module.exports = environments[process.env.NODE_ENV] || environments.development;
