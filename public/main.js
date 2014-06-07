window.onload = function() {

  var canvas;
  var canvasWidth;
  var canvasHeight;
  var x;
  var y;
  var positions = [];
  var squaresNumber = 200;
  var vrWindow;
  var first = false;
  var rain = false;
  var rainInc = 0;
//Math.floor(Math.random() * 10) + 1

  function randomPosition() {
    return {
      x: Math.round(Math.random()*canvasWidth),
      y: Math.round(Math.random()*canvasHeight)
    };
  }

  function isAtCenter(position) {
    var centerX = Math.floor(canvasWidth/2);
    var centerY = Math.floor(canvasHeight/2);
    var marginX = 800;
    var marginY = 300;
    return position.x < (centerX + marginX) &&
           position.x > (centerX - marginX) &&
           position.y > (centerY - marginY) &&
           position.y < (centerY + marginY);
  };

  function init()
  {
    var i;
    var x;
    var y;
    canvas = document.querySelector(".canvas");
    canvas.width = document.body.clientWidth * window.devicePixelRatio;
    canvas.height = document.body.clientHeight * window.devicePixelRatio;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    var position = randomPosition();
    var atCenter = true;
    for (i=0; i<squaresNumber; ++i) {
      while(atCenter) {
        position = randomPosition();
        atCenter = isAtCenter(position)
      }
      atCenter = true;
      positions.push({
        x: position.x,
        y: position.y,
        alpha: 1 / (Math.floor(Math.random() * 4) + 1)
      });
    }
  }

  var alphaIncrement = 0.2;
  var delta;

  function render()
  {
    var color = "rgba(0, 0, 200, ";
    var alpha;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    if (rain) {
      rainInc++;
    } else {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }
    if (alphaIncrement <= -0.2) {
      delta = 0.005;
    } else if (alphaIncrement >= 0.2) {
      delta = -0.005;
    }
    alphaIncrement += delta;
    positions.forEach(function(position){
      alpha = position.alpha + alphaIncrement;
      ctx.fillStyle = color + alpha + ")";
      ctx.fillRect(position.x, position.y + rainInc, 30, 30);
    });
    window.requestAnimationFrame(render);
  }

  var elem = document.querySelector(".container");
  elem.onclick = function() {
    //updateStatus();
    //   if (elem.requestFullscreen) {
    //   elem.requestFullscreen();
    // } else if (elem.msRequestFullscreen) {
    //   elem.msRequestFullscreen();
    // } else if (elem.mozRequestFullScreen) {
    //   elem.mozRequestFullScreen();
    // } else if (elem.webkitRequestFullscreen) {
    //   elem.webkitRequestFullscreen();
    // }
  };

  var parameter = getUrlParameters("vr", "", true);
  if (parameter === 'true') {
    startVR();
  } else {
    init();
    render();
  }
  //window.requestAnimationFrame(render);

  var socket = io();
  var trackerConnected = true;
  var displayConnected = false;
  var showFace = function(front) {
    var frontFaceEl = document.querySelector(".face.front");
    var backFaceEl = document.querySelector(".face.back");
    if (front) {
      frontFaceEl.classList.remove("flipped");
      backFaceEl.classList.add("flipped");
    } else {
      frontFaceEl.classList.add("flipped");
      backFaceEl.classList.remove("flipped");
    }
  }
  var showFrontFace = function() {
    showFace(true);
  };
  var showBackFace = function() {
    showFace(false);
  };

  var updateStatus = function() {
    var elOn = document.querySelector(".face .connected.on");
    var elOff = document.querySelector(".face .connected.off");
    if (trackerConnected && displayConnected) {
      elOn.classList.remove("hidden");
      elOff.classList.add("hidden");
      showBackFace();
      setTimeout(openVRWindow, 500);
    } else {
      elOn.classList.add("hidden");
      elOff.classList.remove("hidden");
      showBackFace();
      if (vrWindow) {
        vrWindow.close();
      }
    }
  };

  function startVR() {
    var elem = document.querySelector(".container.vr");
    elem.classList.remove("hidden");
    startVRContent();
  }

  function openVRWindow() {
    var width = 1280;
    var height = 800;
    var left = 1280;

    left += window.screenX;
    //rain = true;
    vrWindow = window.open('http://localhost:3000/?vr=true','windowName','resizable=1,scrollbars=1,fullscreen=0,height=' + height + ',width=' + width + '  , left=' + left + ', toolbar=0, menubar=0,status=1');
  }

  socket.on('display', function (data) {
    displayConnected = data;
    updateStatus();
    console.log("Display Connected: " + data);
  });

  socket.on('tracker', function (data) {
    trackerConnected = data;
    updateStatus();
    console.log("Tracker Connected: " + data);
  });

};