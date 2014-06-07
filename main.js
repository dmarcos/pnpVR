// Setup basic express server
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var child = require('child_process');
var hwMonitor;

// Configuration
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.use(bodyParser.json({ type: 'application/json' }))

var riftConnected;

// Routing
app.put('/rift/display', function(req, res) {
  console.log("PUT PUT");
  if (req.body.status !== undefined) {
    riftConnected = !!(req.body.status);
    console.log("PUT RIFT DISPLAY");
  }
  res.send(riftConnected);
});

app.get('/rift/display', function(req, res) {
  res.send(riftConnected);
});

hwMonitor = child.fork('hwMonitor');

io.on('connection', function (socket) {
  hwMonitor.on('message', function(m) {
    console.log('YEAH! PARENT got message:', m);
    if (m.display !== undefined) {
      socket.broadcast.emit('display', m.display);
    }
    if (m.tracker !== undefined) {
      socket.broadcast.emit('tracker', m.tracker);
    }
  });
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});