var ref = require('ref');
var ffi = require('ffi');
var http = require('http');
// Connect to server
var callbackPointer = ffi.Function('void', ['bool']);
// binding to functions in libHWMonitor
var libHWMonitor = ffi.Library('lib/libHWMonitor', {
  'startMonitoring': [ 'void', [callbackPointer, callbackPointer] ]
});

var updateDisplayStatus = function(status) {;
  process.send({ display: status });
};

var updateTrackerStatus = function(status) {;
  process.send({ tracker: status });
};

var onRiftDisplayChanged = function(connected) {
  updateDisplayStatus(!!connected);
  if (connected) {
    console.log("RIFT DISPLAY CONNECTED");
  } else {
    console.log("RIFT DISPLAY DISCONNECTED");
  }
};

var onRiftTrackerChanged = function(connected) {
  updateTrackerStatus(!!connected);
  if (connected) {
    console.log("RIFT TRACKER CONNECTED");
  } else {
    console.log("RIFT TRACKER DISCONNECTED");
  }
};

var onRiftDisplayChangedPtr = ffi.Callback('void', ['int'], onRiftDisplayChanged);
var onRiftTrackerChangedPtr = ffi.Callback('void', ['int'], onRiftTrackerChanged);

libHWMonitor.startMonitoring(onRiftDisplayChangedPtr, onRiftTrackerChangedPtr);