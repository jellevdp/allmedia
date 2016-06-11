#/bin/bash

# View the logs of the latest created container.
function logs {
	CONTAINERID=`docker ps -q | head -n1`
	[[ -z $CONTAINERID ]] && echo "No container running" && exit 1
	echo "Attaching to chaincode container $CONTAINERID."
	docker attach $CONTAINERID
}

# Remove all not-running containers and all chaincode 
# images that are not in use to save space. 
function clean {
	docker rm `docker ps -qa`
	for IMG in `docker images -q | grep "dev-jdoe-"` 
	do
	    docker rmi $IMG
	done
	exit 0
}

case "$1" in
	logs)
		logs
		;;
	clean)
		clean
		;;
	*)
		echo "arguments: logs | clean"
		exit 0
		;;	
esac
