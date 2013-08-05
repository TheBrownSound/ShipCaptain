// Fuse dependencies
// @depends Utils.js
// @depends World.js
// @depends Gauge.js
// @depends Ocean.js
// @depends Weather.js
// @depends Boat.js
// @depends Sails.js
// @depends Helm.js

// Parent Game Logic
var Game = (function(){
	var game = {}
	var _preloadAssets = [];
	var _canvas;

	var stage;
	var world;
	var gauge;
	var preloader;

	game.init = function(canvasId) {
		stage = new createjs.Stage(document.getElementById(canvasId));

		//Enable User Inputs
		createjs.Touch.enable(stage);
		stage.enableMouseOver(10);
		stage.mouseMoveOutside = false; // keep tracking the mouse even when it leaves the canvas
		stage.snapToPixelEnabled = true;

		manifest = [
			{src:"images/tide_repeat.png", id:"waves"}
		];

		preloader = new createjs.LoadQueue(false);
		preloader.onFileLoad = fileLoaded;
		preloader.onComplete = preloadComplete;
		preloader.loadManifest(manifest);
	}

	function fileLoaded(event) {
		console.log('handleFileLoad: ', event);
		_preloadAssets.push(event.item);
	}

	function preloadComplete() {
		console.log('preloadComplete')
		game.assets = {};
		for (var i = 0; i < _preloadAssets.length; i++) {
			console.log(_preloadAssets[i]);
			game.assets[_preloadAssets[i].id] = preloader.getResult(_preloadAssets[i].id);
		};
		console.log('Game.assets', game.assets);

		world = game.world = new World(stage.canvas.width, stage.canvas.height);
		gauge = new Gauge();
		gauge.x = stage.canvas.width - 75;
		gauge.y = stage.canvas.height - 75;

		stage.addChild(world,gauge);
		
		//Ticker
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", tick);

		sizeCanvas();
	}

	function sizeCanvas() {
		if (game.world) {
			stage.canvas.width = window.innerWidth;
			stage.canvas.height = window.innerHeight;
			game.world.canvasSizeChanged(stage.canvas.width, stage.canvas.height);
			gauge.x = stage.canvas.width - 75;
			gauge.y = stage.canvas.height - 75;
		}
	}

	function onKeyDown(event) {
		switch(event.keyCode) {
			case 37: // Left arrow
				Game.world.playerBoat.turnLeft();
				break;
			case 38: // Up arrow
				Game.world.weather.wind.direction = Utils.convertToHeading(Game.world.weather.wind.direction+10);
				break;
			case 39: // Right arrow
				Game.world.playerBoat.turnRight();
				break;
			case 40: // Down arrow
				Game.world.weather.wind.direction = Utils.convertToHeading(Game.world.weather.wind.direction-10);
				break;
			default:
				//console.log('Keycode ['+event.keyCode+'] not handled');
		}
	}

	function onKeyUp(event) {
		switch(event.keyCode) {
			case 83: // S Key
				Game.world.playerBoat.reefSails();
				break;
			case 87: // W Key
				Game.world.playerBoat.hoistSails();
				break;
			case 37: // Right arrow
			case 39: // Left arrow
				Game.world.playerBoat.stopTurning();
				break;
			case 38: // Up arrow
				break;
			case 40: // Down arrow
				break;
			case 65: // A key
				break;
			case 187: // = key, Zoom In
				Game.world.zoomIn();
				break;
			case 189: // - key, Zoom Out
				Game.world.zoomOut();
				break;
			case 27: // Escape
				break;
			default:
				console.log('Keycode ['+event.keyCode+'] not handled');
		}
	}

	function tick() {
		gauge.update();
		world.update();
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