window.onload = function() {

  var socket = io();

  var showDisplayStatus = function(connected) {
    console.log("DISPLAY STATUS");
  };

  var showTrackerStatus = function(connected) {
    console.log("TRACKER STATUS");
  };

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('rift display status', function (data) {
    showDisplayStatus(data.connected);
  });

  // Whenever the server emits 'login', log the login message
  socket.on('rift tracker status', function (data) {
   showTrackerStatus(data.connected);
  });

};