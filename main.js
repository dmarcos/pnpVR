// Setup basic express server
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var ref = require('ref');
var ffi = require('ffi');

var callbackPointer = ffi.Function('void', ['int']);

// binding to functions in libHWMonitor
var libHWMonitor = ffi.Library('lib/libHWMonitor', {
  'startMonitoring': [ 'void', [callbackPointer, callbackPointer] ]
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.use(bodyParser.json({ type: 'application/json' }))

// RIFT State
var riftConnected = false;

app.put('/rift/display', function(req, res) {
  if (req.body.status !== undefined) {
    riftConnected = !!(req.body.status);
    console.log(riftConnected);
  }
  res.send(riftConnected);
});

app.get('/rift/display', function(req, res) {
  res.send(riftConnected);
});


io.on('connection', function (socket) {
  var onRiftDisplayChanged = function(connected) {
    socket.broadcast.emit('rift display status', {
      connected: connected
    });
    if (connected) {
      console.log("RIFT DISPLAY CONNECTED");
    } else {
      console.log("RIFT DISPLAY DISCONNECTED");
    }
  };

  var onRiftTrackerChanged = function(connected) {
    socket.broadcast.emit('rift tracker status', {
      connected: connected
    });
    if (connected) {
      console.log("RIFT TRACKER CONNECTED");
    } else {
      console.log("RIFT TRACKER DISCONNECTED");
    }
  };

  libHWMonitor.startMonitoring(onRiftDisplayChanged, onRiftTrackerChanged);

});