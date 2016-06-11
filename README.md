#Prerequisites
- nodejs
- npm
- docker
- nodemon (npm install -g nodemon)

#Preparing your environment

Please follow the following steps to set up a local sandbox environment for development.

##Installing Hyperledger locally
Hyperledger runs locally in two docker containers: membersrvc for the Certificate Authority and peer for our local node. Remember to replace `path/to/project` with the actual path to your project. 

To prepare them do (from the project directory):

> docker build --tag membersrvc docker/membersrvs

> docker build --tag peer docker/peer

> docker run -d --name membersrvc membersrvc

> docker run -d --privileged --name peer -p 5000:5000 -v /path/to/project/chaincode:/opt/go/src/chaincode --link membersrvc peer

If you want to see the logs you can also run the container without the -d flag or do `docker logs --tail 20 -f peer`. See the docker documentation for more info.

The first time you run the peer it has to get the base image for the chaincode containers. This will take a while.

Sidenote: there is some docker inception going on here: chaincode is executed in docker containers. Ideally we would get the base image during the build phase but running docker inside docker requires the --privileged flag, which is not available during build.

##Running hyperledger locally
> docker start membersrvc

> docker start peer

Check if it's running by visiting `localhost:5000/chain` in your browser.

#Directory structure:
project-code/  
---app.js  
---blockchain/  
------blockchain.js  
------chaincodeconfig.js  
---client/  
---chaincode/  
------deploy/
---------chaincode.go 

In chaincodeconfig.js (in [project]/blockchain) the git url is the chaincode folder above with its subdirectory. So, when you have your chaincode written in WORKSPACE/chaincode/torch the git url is '[chaincodefolder]/torch'. We called it 'deploy' for now but you're welcome to change it to something more meaningful.
Chaincodeconfig.js has the location of the chaincode git repo (to deploy to bluemix) OR the location on your filesystem of the chaincode.

This is an overview of the local settings for chaincodeconfig.js based on the above folder configuration:
 unzip_dir: 'torch'
 git_url: 'chaincode/torch'
 local_path: '../chaincode/insurances'

The connection to the blockchain is managed from the blockchain subdirectory. Credentials.json has the connection details for the IBM Blockchain service. 

# NodeJS server
The nodejs application is configured to run locally for development and on bluemix for production.

## Local

### nodemon
The application is configured to run with nodemon and node-sass to automatically restart the server when you make changes during development.
Make sure you have the npm package `nodemon` installed. You can do so with `sudo npm install -g nodemon`.

> cd [project-folder]  
> npm start

If you want to run it manually, do 'node bin/www'. 

The server will start with deploying the chaincode.

## Bluemix
Make sure you have the cloud foundry cli installed. You can install the cf command line interface by following the instruction on https://docs.cloudfoundry.org/cf-cli/install-go-cli.html.

If this is a new application, make sure you 
- changed the name of the application in manifest.yml
- created a space (in your organization on bluemix.net)
- created a blockchain service in this space
- copied the blockhain service credentials to blockchain/chaincodeconfig.js
- are logged in (`bluemix api [apiurl]`, `cf login`)
- (for now: have your chaincode on a public git repo.... we're looking into better ways of doing this)...

Push the application from the terminal with:
> cf push

You can change the settings of deployment in the manifest.yml file. For instructions on possible parameters have a look at https://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html.

# Swagger UI

## Installing

Follow these steps: https://github.com/hyperledger/fabric/blob/master/docs/API/CoreAPI.md#using-swagger-js-plugin

## Running it

Follow these steps in your terminal (locally): 
> cd /opt/gopath/src/github.com/hyperledger/fabric/core/rest
> http-server -a 0.0.0.0 -p 5554 --cors

Navigate to the /swagger-ui/dist directory and click on the index.html file to bring up the Swagger-UI interface inside your browser.
> Type in the address http://localhost:5554/rest_api.json and click Explore.

# Chaincode logging
> docker exec -t peer bash /util.sh logs

# Making some space
> docker exec -t peer bash /util.sh clean
Removes all not-running containers and all chaincode images that are not in use by running containers to save space. With this your old chaincode is not usable anymore!

# Resetting the chaincode
Remove blockchain/data/latest_deployed from your local filesystem and restart the server.

As for a full blockchain reset: this would probably go something like this, but how do we restart the peer nicely?
> docker exec -it peer /bin/bash

> rm /var/hyperledger/production/*

