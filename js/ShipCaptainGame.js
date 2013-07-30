// Fuse dependencies
// Main world class
// Acts as a model containing the majority of the info
// about the world as well the parent display object

var World = function(width, height){
	var _width = width;
	var _height = _height;

	var currentScale = 0;
	var scaleIncrements = [.5, 1];

	var world = new createjs.Container();
	world.name = 'world';

	var ocean = new Ocean(width,height);
	//var weather = new Weather();

	var playerBoat = world.playerBoat = new Boat();
	playerBoat.scaleX = playerBoat.scaleY = ocean.scaleX = ocean.scaleY = scaleIncrements[currentScale];
	playerBoat.x = width/2;
	playerBoat.y = height/2;

	world.addChild(ocean);
	world.addChild(playerBoat);

	function changeScale(inc) {
		currentScale += inc;
		var nextScale = Math.abs(currentScale%scaleIncrements.length);
		playerBoat.scaleX = playerBoat.scaleY = ocean.scaleX = ocean.scaleY = scaleIncrements[nextScale];
	}

	world.getWidth = function() {
		return _width;
	}

	world.setWidth = function(val) {
		_width = val;
		return _width;
	}

	world.getHeight = function() {
		return _height;
	}

	world.setHeight = function(val) {
		_height = val;
		return _height;
	}

	world.canvasSizeChanged = function(width,height) {
		console.log(width, height);
		_width = width;
		_height = height;
		playerBoat.x = width/2;
		playerBoat.y = height/2;
	}

	world.zoomIn = function() {
		changeScale(1);
	}

	world.zoomOut = function() {
		changeScale(-1);
	}

	world.update = function() {
		var angle = playerBoat.getHeading();
		var speed = playerBoat.getSpeed();
		ocean.position.x += Math.cos(angle*Math.PI/180)*speed;
		ocean.position.y += Math.sin(angle*Math.PI/180)*speed;
		ocean.update();
	}

	return world;
}
var Ocean = function(width, height){
	//Constants
	var MAX_TIDE_SPEED = 10;

	var _tideXVelocity = 0;
	var _tideYVelocity = 0;

	var ocean = new createjs.Container();
	ocean.width = width;
	ocean.height = height;
	ocean.position = {x:0, y:0};

	console.log('WAVES: ', Game.assets['waves']);
	var crossWidth = width*2 + height*2;

	var tide = new createjs.Shape();
	var g = tide.graphics;
	g.beginBitmapFill(Game.assets['waves']);
	g.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);
	tide.x = width/2;
	tide.y = height/2;

	function moveTide() {
		tide.x = ocean.position.x % 200;
		tide.y = ocean.position.y % 150;
	}

	ocean.addChild(tide);

	ocean.update = function() {
		moveTide();
	}

	return ocean;
}
// @depends Weather.js
var Boat = (function() {
	var WIDTH = 112;
	var HEIGHT = 250;
	var boomDiameter = 10;
	var boomWidth = 300;

	var _momentum = 0;

	var boat = new createjs.Container();
	boat.regX = WIDTH/2;
	boat.regY = HEIGHT/2;

	var hull = new createjs.Bitmap('images/small_boat.png');

	var sail = new Sail(WIDTH*1.5, boomDiameter);
	sail.x = WIDTH/2;
	sail.y = 95;

	boat.addChild(hull, sail);

	boat.turnLeft = function() {
		boat.rotation -= 6;
	}

	boat.turnRight = function() {
		boat.rotation += 6;
	}

	boat.toggleSail = function() {

	}

	boat.adjustSail = function(amount) {
		sail.rotation += amount;
	}

	boat.getSpeed = function() {
		return 4;
	}

	boat.getHeading = function() {
		return (boat.rotation+90) % 360;
	}

	return boat;
});
var Sail = (function(width, height, sloop) {
	var sail = new createjs.Container();

	var support = new createjs.Shape();
	support.graphics.beginFill('#52352a');
	support.graphics.drawRoundRect(-(width/2),-height, width, height, 4);
	support.graphics.endFill();

	sail.getPower = function() {
		return 5;
	}

	sail.addChild(support);

	return sail;
});

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