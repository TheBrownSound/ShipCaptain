// Fuse dependencies
// @depends Utils.js
// @depends Particles.js
// @depends Viewport.js
// @depends World.js
// @depends Hud.js
// @depends Ocean.js
// @depends Weather.js
// @depends boats/Boat.js
// @depends boats/Boats.js
// @depends boats/PlayerBoat.js
// @depends boats/AIBoat.js
// @depends boats/Merchant.js
// @depends boats/Pirate.js
// @depends boats/Sails.js
// @depends boats/Helm.js
// @depends boats/Telltail.js
// @depends boats/guns/Gun.js
// @depends static/Place.js
// @depends static/Port.js
// @depends static/Island.js


// Parent Game Logic
var Game = (function(){
	var game = {}
	var _preloadAssets = [];
	var _canvas;

	var dispatcher = createjs.EventDispatcher.initialize(game);

	var stage;
	var viewport;
	
	// hud
	var windGauge;
	var healthMeter;
	var speedMeter;
	var fireLeft, fireUp, fireRight;
	
	var preloader;

	game.init = function(canvasId) {
		stage = game.stage = new createjs.Stage(document.getElementById(canvasId));

		//Enable User Inputs
		createjs.Touch.enable(stage);
		stage.enableMouseOver(10);
		stage.mouseMoveOutside = false; // keep tracking the mouse even when it leaves the canvas
		//stage.snapToPixelEnabled = true;

		//Initialize sound
		if (!createjs.Sound.initializeDefaultPlugins()) {
			console.log('Sound plugin error!');
			return;
		}

		var soundInstanceLimit = 100;// set our limit of sound instances
		// check if we are using the HTMLAudioPlugin, and if so apply the MAX_INSTANCES to the above limit
		if (createjs.Sound.activePlugin.toString() == "[HTMLAudioPlugin]") {
			soundInstanceLimit = createjs.HTMLAudioPlugin.MAX_INSTANCES - 5;
		}

		manifest = [
			{src:"sounds/cannon_fire.mp3", id:"cannon", data:soundInstanceLimit},
			{src:"sounds/small_explosion.mp3", id:"small_explosion", data:soundInstanceLimit},
			{src:"sounds/wood_crack.mp3", id:"hit", data:soundInstanceLimit},
			{src:"sounds/water.mp3", id:"water"},
			{src:"images/tide.png", id:"tide"},
			{src:"images/raft_hull.png", id:"raft"},
			{src:"images/basic_hull.png", id:"basicBoat"}
		];

		preloader = new createjs.LoadQueue(false);
		preloader.installPlugin(createjs.Sound);
		preloader.onFileLoad = fileLoaded;
		preloader.onComplete = startGame;
		preloader.loadManifest(manifest);
	}

	function fileLoaded(event) {
		//console.log('handleFileLoad: ', event);
		_preloadAssets.push(event.item);
	}

	function startGame() {
		console.log('startGame')
		game.assets = {};
		for (var i = 0; i < _preloadAssets.length; i++) {
			//console.log(_preloadAssets[i]);
			game.assets[_preloadAssets[i].id] = preloader.getResult(_preloadAssets[i].id);
		};
		console.log('Game.assets', game.assets);

		var playerBoat = new PlayerBoat();
		var world = game.world = new World(playerBoat);
		world.generateWorld();
		
		viewport = new Viewport(world);
		viewport.width = stage.canvas.width;
		viewport.height = stage.canvas.height;

		windGauge = new WindGauge();
		healthMeter = new HealthMeter(playerBoat);
		speedMeter = new SpeedMeter(playerBoat);

		fireLeft = new ShootButton('port');
		fireUp = new ShootButton('bow');
		fireRight = new ShootButton('starboard');

		stage.addChild(viewport, windGauge, healthMeter, speedMeter, fireLeft, fireUp, fireRight);

		//Ticker
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", tick);

		sizeCanvas();
	}

	function sizeCanvas() {
		if (viewport) {
			var padding = 75;
			
			var aspect = 4/3;
			var windowWidth = window.innerWidth;
			if (window.innerHeight < window.innerWidth*.75) {
				windowWidth = window.innerHeight * aspect;
			}
			var windowHeight = windowWidth / aspect;

			stage.canvas.width = windowWidth;
			stage.canvas.height = windowHeight;
			windGauge.x = healthMeter.x = stage.canvas.width - padding;
			windGauge.y = speedMeter.x = padding;
			healthMeter.y = stage.canvas.height - healthMeter.height - padding;
			speedMeter.y = healthMeter.y;

			fireUp.x = (stage.canvas.width-fireUp.width)/2;
			fireRight.x = fireUp.x + 70;
			fireLeft.x = fireUp.x - 70
			fireLeft.y = fireUp.y = fireRight.y = stage.canvas.height-fireUp.height-10;

			viewport.canvasSizeChanged(stage.canvas.width, stage.canvas.height);
		}
	}

	function onKeyDown(event) {
		switch(event.keyCode) {
			default:
				game.dispatchEvent({type:'onKeyDown', key:event.keyCode});
		}
	}

	function onKeyUp(event) {
		console.log(event.keyCode);
		switch(event.keyCode) {
			case 187: // = key, Zoom In
				viewport.zoomIn();
				break;
			case 189: // - key, Zoom Out
				viewport.zoomOut();
				break;
			case 27: // Escape
				game.dispatchEvent('escape');
				break;
			case 90: // z key, Toggle Zoom
				viewport.toggleZoom();
				break;
			default:
				game.dispatchEvent({type:'onKeyUp', key:event.keyCode});
		}
	}

	function tick() {
		stage.update();
		document.getElementById('fps').innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
	}

	game.escape = function() {

	}

	$(document).ready(function(){
		console.log('DOCUMENT READY');
		window.onresize = sizeCanvas;
		window.onkeydown = onKeyDown;
		window.onkeyup = onKeyUp;
	});

	return game;
})();