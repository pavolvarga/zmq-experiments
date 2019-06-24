FROM node:10.16.0-alpine

RUN apk update

#dependencies necessary for building zmq
RUN apk add python
RUN apk add build-base

WORKDIR zmq-experiments
ADD . /zmq-experiments

CMD ["/bin/sh"]