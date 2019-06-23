#Publish-subscribe pattern

Sockets ZMQ_PUB and ZMQ_SUB.<br/>
<br/>
Example of running:
```sh
  node publisher 2
  node subscriber 1
  node subscriber 1
  node subscriber 2
```
This example starts a publisher which creates 2 topics for which any number of subscriber can subscribe to.<br/>
The first two subscribers are subscribed to topic number 1. <br/>
The third subscriber is subscribed to topic number 2.<br/>
You must start subscribers first and then start publisher otherwise you will run into _lost messages_ problem
as mentioned in the [zmq guide](http://zguide.zeromq.org/page:all).
<br/>
You can start as meany subscribers as you want. Each subscriber expects an id of a topic as an argument.
The publisher expects count of topics as an argument.