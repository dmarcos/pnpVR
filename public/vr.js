(function() {
  var camera, scene, renderer;
  var geometry, material, mesh;
  var controls, time = Date.now();
  var vrElement;
  var effect; // rift effect

  var objects = [];

  var ray;

  window.startVRContent = function() {
    if (!vr.isInstalled()) {
      //statusEl.innerText = 'NPVR plugin not installed!';
      alert('NPVR plugin not installed!');
    }
    vr.load(function(error) {
      if (error) {
        //statusEl.innerText = 'Plugin load failed: ' + error.toString();
        alert('Plugin load failed: ' + error.toString());
      }

      try {
        init();
        animate();
        vr.enterFullScreen();
      } catch (e) {
        //statusEl.innerText = e.toString();
        console.log(e);
      }
    });
  }

  function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    var light = new THREE.DirectionalLight( 0xffffff, 0.75 );
    light.position.set( -1, - 0.5, -1 );
    scene.add( light );

    controls = new THREE.OculusRiftControls( camera );
    scene.add( controls.getObject() );

    // var cameraHelper = new THREE.CameraHelper(camera);
    // scene.add(cameraHelper);

    ray = new THREE.Raycaster();
    ray.ray.direction.set( 0, -1, 0 );

    // floor

    geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

      var vertex = geometry.vertices[ i ];
      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;

    }

    for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

      var face = geometry.faces[ i ];
      face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 3 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

    }

    material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // objects

    geometry = new THREE.CubeGeometry( 20, 20, 20 );

    for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

      var face = geometry.faces[ i ];
      face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 3 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

    }

    for ( var i = 0; i < 250; i ++ ) {

      material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

      var mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
      mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
      mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
      scene.add( mesh );

      material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

      objects.push( mesh );

    }

    //

    renderer = new THREE.WebGLRenderer({
      devicePixelRatio: 1,
      alpha: false,
      clearColor: 0xffffff,
      antialias: true
    });

    effect = new THREE.OculusRiftEffect( renderer );

    vrElement = document.body.querySelector('.container.vr')
    vrElement.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'keydown', keyPressed, false );
  }

  function onWindowResize() {
  }

  function keyPressed (event) {
    switch ( event.keyCode ) {
      case 79: // o
        effect.setInterpupillaryDistance(
            effect.getInterpupillaryDistance() - 0.001);
        break;
      case 80: // p
        effect.setInterpupillaryDistance(
            effect.getInterpupillaryDistance() + 0.001);
        break;

      case 70: // f
        if (!vr.isFullScreen()) {
          vr.enterFullScreen();
        } else {
          vr.exitFullScreen();
        }
        e.preventDefault();
        break;

      case 32: // space
        vr.resetHmdOrientation();
        e.preventDefault();
        break;
    }
  }

  var vrstate = new vr.State();
  function animate() {
    vr.requestAnimationFrame(animate);

    controls.isOnObject( false );

    ray.ray.origin.copy( controls.getObject().position );
    ray.ray.origin.y -= 10;

    var intersections = ray.intersectObjects( objects );
    if ( intersections.length > 0 ) {
      var distance = intersections[ 0 ].distance;
      if ( distance > 0 && distance < 10 ) {
        controls.isOnObject( true );
      }
    }

    // Poll VR, if it's ready.
    var polled = vr.pollState(vrstate);
    controls.update( Date.now() - time, polled ? vrstate : null );

    //renderer.render( scene, camera );
    effect.render( scene, camera, polled ? vrstate : null );

    time = Date.now();
  }
})();