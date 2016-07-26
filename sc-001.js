(function () {

  'use strict';

  var camera;
  var container;
  var terrainMesh;
  var renderer;
  var scene;
  var stats;
  var uniforms;
  var segments = 64;
  var planeWidth = 2048.0;
  var planeHeight = 2048.0;
  var shaderMaterial;

  var WebGLOptions = function () {

    this.radius = 400.0;
    this.wireframe = true;
    this.transparent = true;

  };

  var opts = new WebGLOptions();


  function initDatGui() {

    var gui = new dat.GUI();
    gui.add(opts, 'radius', 10.0, 1000.0, 10.0 )
      .onChange( function ( value ) {
         uniforms.radius.value = value;
      });

    gui.add(opts, 'wireframe')
      .onChange(function (value) {
        shaderMaterial.wireframe = value;
      });

    gui.add(opts, 'transparent')
      .onChange(function (value) {
        shaderMaterial.transparent = value;
      });

  }


  function initStats() {

    stats = new Stats();
    stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

  }


  function init() {

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
    scene = new THREE.Scene();

    camera.position.y = 2000;
    camera.position.z = 2000;
    camera.rotation.x = -Math.PI / 4;

    var geometry = new THREE.PlaneBufferGeometry( planeWidth, planeHeight, segments, segments);
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    var colors = new THREE.BufferAttribute(new Float32Array( segments * 3 * 4 ), 4 );

    for ( var i = 0; i < colors.length; i ++ ) {
      colors.setXYZW( i, Math.random(), Math.random(), Math.random(), Math.random() );
    }

    geometry.addAttribute( 'color', colors );

    uniforms = {
      time: { type: 'f', value: 1.0 },
      planeSize: { type: 'f', value: planeWidth },
      radius: { type: 'f', value: 400.0 }
    };

    shaderMaterial =
      new THREE.ShaderMaterial({
        wireframe: opts.wireframe,
        transparent: opts.transparent,
        uniforms: uniforms,
        vertexShader:   document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
      });

    terrainMesh = new THREE.Mesh( geometry, shaderMaterial);
    scene.add( terrainMesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x222222 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.innerHTML = '';
    container.appendChild( renderer.domElement );

    window.addEventListener('resize', onWindowResize, false);

    onWindowResize();
  }


  // Event Handlers
  function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

  }


  function animate() {

    stats.begin();
    requestAnimationFrame( animate );
    render();
    stats.end();

  }


  function render() {

    // uniforms.time.value += 0.05;
    camera.updateMatrixWorld();
    renderer.render(scene, camera);

  }


  window.onload = function () {

    init();
    initDatGui();
    initStats();
    animate();

  };

  //https://developers.soundcloud.com/docs/api/guide#streaming

  SC.initialize({
    client_id: '9f5a76329b3ac9de3236aa9f38de1943'
  });

  // http://www.michaelbromley.co.uk/blog/42/audio-visualization-with-web-audio-canvas-and-the-soundcloud-api
  // https://soundcloud.com/kentonslashdemon/dok
  // stream track id 293
  // // 17602302
  SC.stream('/tracks/17602302').then(function(player){
    console.log(player);
    // player.setVolume(1);
    // player.play();

    console.log(player.getVolume());
    playSOund(player);
  }, function(error) {
    console.log(error);
  });

function playSOund(player) {
  var context = new AudioContext(),
    audio = new Audio(),
    source,
    // `stream_url` you'd get from
    // requesting http://api.soundcloud.com/tracks/6981096.json
    url = 'http://api.soundcloud.com/tracks/17602302/stream' +
          '?client_id=9f5a76329b3ac9de3236aa9f38de1943';

    var analyser = context.createAnalyser();
    analyser.fftSize = 256;

    audio.crossOrigin = 'anonymous';
    audio.src = url;
    source = context.createMediaElementSource(audio);
    source.connect(analyser);
    // source.connect(context.destination);

    analyser.connect(context.destination);
    // analyser.connect(source);

    var streamData = new Uint8Array(128);
    var totalVolume;


    var sampleAudioStream = function() {
      // This closure is where the magic happens. Because it gets called with setInterval below, it continuously samples the audio data
      // and updates the streamData and volume properties. This the SoundCouldAudioSource function can be passed to a visualization routine and
      // continue to give real-time data on the audio stream.
      analyser.getByteFrequencyData(streamData);
      // calculate an overall volume value
      var total = 0;
      for (var i = 0; i < 128; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
          total += streamData[i];
      }

      totalVolume = total;
      uniforms.time.value += ((total / 2000) - uniforms.time.value) * 0.75;
      console.log(total);
    };
    setInterval(sampleAudioStream, 10); //
    // public properties and methods


    source.mediaElement.play();
  }

}());


//<iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/17602302&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>
