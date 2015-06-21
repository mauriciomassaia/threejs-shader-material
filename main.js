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

    uniforms.time.value += 0.05;
    camera.updateMatrixWorld();
    renderer.render(scene, camera);

  }


  window.onload = function () {

    init();
    initDatGui();
    initStats();
    animate();

  };

}());
