// Fuse dependencies
// @depends World.js
// @depends Ocean.js
// @depends Weather.js
// @depends Boat.js
// @depends Sail.js

// Parent Game Logic
var Game = (function(){
	var game = {}
	var _preloadAssets = [];

	var stage;
	var world;
	var preloader;
	var tide;

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
		
		stage.addChild(world);
		
		//Ticker
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", game.tick);
	}

	game.canvasResized = function() {
		if (game.world) {
			game.world.canvasSizeChanged(stage.canvas.width, stage.canvas.height);
		}
	}

	game.escape = function() {

	}

	game.tick = function() {
		world.update();
		stage.update();
		document.getElementById('fps').innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
	}

	return game;
})();