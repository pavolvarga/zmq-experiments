# Collection of experiments with zmq in node.js

Each folder is a standalone experiment with its own README file.

## How to run

Clone the repository
```sh
git clone https://github.com/pavolvarga/zmq-experiments.git
```

Go to an experiment's directory and install it
```sh
cd zmq-experiments
cd 02-request-reply
npm install
```

Run the experiment
```sh
node requester.js
node responder.js
```

In some experiments you might run a file multiple times.

## How to run via docker

Pull the image
```sh
git pull pavolvarga1024/zmq-experiments
```

Run the image
```sh
docker run -it pavolvarga1024/zmq-experiments
```

Go to an experiment's directory and install it
```sh
cd 02-request-reply
npm install
```

For running you must run multiple node.js files, therefore you must connect to an existing container.
Run the image only once, and then connect to the container. Had you run the image several times, you would
have created multiple containers.
<br/>

For each file attach a new shell.
To do that, you must first obtain an container's id.
<br/>

```sh
docker exec -it $(docker container ls | grep pavolvarga1024/zmq-experiments | awk '{print $1}') /bin/sh
cd 02-request-reply
node requester.js
```

```sh
docker exec -it $(docker container ls | grep pavolvarga1024/zmq-experiments | awk '{print $1}') /bin/sh
cd 02-request-reply
node responder.js
```
