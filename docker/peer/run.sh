#!/bin/sh
set -e
service docker start && sleep 5s && docker images -q
[[ -z `docker images -q` ]] && echo "Building baseimage. This will take some time. " && bash $FABRIC/scripts/provision/docker.sh 0.0.9
cd $FABRIC/peer
./peer node start
