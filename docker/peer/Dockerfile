#
# Hyperledger peer. Gets the latest master on first build.
#
FROM hyperledger/fabric-baseimage:x86_64-0.0.9
MAINTAINER A. Rutjes <arne.rutjesISC@nl.ibm.com>

ENV GOROOT /opt/go
ENV GOPATH /opt/go
ENV PATH $GOROOT/bin:$PATH
ENV FABRIC $GOROOT/src/github.com/hyperledger/fabric

RUN git clone https://github.com/hyperledger/fabric.git $FABRIC && cd $FABRIC 
RUN cd $FABRIC/peer \
 && CGO_CFLAGS=" " CGO_LDFLAGS="-lrocksdb -lstdc++ -lm -lz -lbz2 -lsnappy" go install \
 && go build

RUN apt update -qq \
 && apt install -qq apt-transport-https \
 && echo deb https://apt.dockerproject.org/repo ubuntu-trusty main > /etc/apt/sources.list.d/docker.list \
 && apt update -qq \
 && apt install -qq iptables docker-engine --force-yes

#this would belong in the build phase but requires privileged (which is not available for builds)
#RUN service docker start \
# && bash $FABRIC/scripts/provision/docker.sh 0.0.9
RUN usermod -aG docker root

COPY run.sh /
COPY util.sh /
COPY core.yaml $FABRIC/peer

EXPOSE 5000

WORKDIR $FABRIC/peer
CMD ["bash", "/run.sh"]
