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

	var ocean = world.ocean = new Ocean(width,height);
	var weather = world.weather = new Weather();

	var playerBoat = world.playerBoat = new Boat();
	playerBoat.scaleX = playerBoat.scaleY = ocean.scaleX = ocean.scaleY = scaleIncrements[currentScale];
	
	ocean.x = playerBoat.x = width/2;
	ocean.y = playerBoat.y = height/2;

	world.addChild(ocean, playerBoat);

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

		ocean.x = playerBoat.x = width/2;
		ocean.y = playerBoat.y = height/2;
	}

	world.zoomIn = function() {
		changeScale(1);
	}

	world.zoomOut = function() {
		changeScale(-1);
	}

	world.update = function() {
		var heading = playerBoat.getHeading();
		document.getElementById('heading').innerHTML = "Heading: "+heading;
		var speed = playerBoat.getSpeed();
		ocean.position.x -= Math.sin(heading*Math.PI/180)*speed;
		ocean.position.y += Math.cos(heading*Math.PI/180)*speed;
		ocean.spawnBubble();
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

	var map = new createjs.Container();
	var mapCenter = new createjs.Shape();
	mapCenter.graphics.beginFill('#F00');
	mapCenter.graphics.drawCircle(-5,-5,20);
	mapCenter.graphics.endFill();
	map.addChild(mapCenter);

	var crossWidth = width*2 + height*2;

	var tide = new createjs.Shape();
	var g = tide.graphics;
	g.beginBitmapFill(Game.assets['waves']);
	g.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	ocean.addChild(map, tide);

	function moveTide() {
		tide.x = ocean.position.x % 200;
		tide.y = ocean.position.y % 150;
	}

	ocean.spawnBubble = function() {
		var bubble = new Bubble();
		bubble.x = -ocean.position.x;
		bubble.y = -ocean.position.y;
		bubble.animate();
		map.addChild(bubble);
	}

	ocean.update = function() {
		document.getElementById('coords').innerHTML = ('x:'+ocean.position.x+' - y:'+ocean.position.y);
		map.x = ocean.position.x;
		map.y = ocean.position.y;
		moveTide();
	}

	return ocean;
}

var Bubble = function() {
	var _floatVariance = 100;
	var bubble = new createjs.Shape();
	
	bubble.graphics.beginFill('#95cbdc');
	bubble.graphics.drawCircle(-5,-5,10);
	bubble.graphics.endFill();

	bubble.scaleX = bubble.scaleY = .1;
	function pop() {
		bubble.parent.removeChild(bubble);
	}

	function getRandomArbitary (min, max) {
		return Math.random() * (max - min) + min;
	}

	bubble.animate = function() {
		var floatX = getRandomArbitary(-_floatVariance,_floatVariance)+bubble.x;
		var floatY = getRandomArbitary(-_floatVariance,_floatVariance)+bubble.y;
		var scale = getRandomArbitary(1,3);
	
		createjs.Tween.get(bubble,{loop:false})
			.set({scaleX:0.1,scaleY:0.1}, bubble)
			.to({
				x: floatX,
				y: floatY,
				scaleX: scale,
				scaleY: scale,
				alpha: 0
			},3000,createjs.Ease.easeOut)
			.call(pop);
	}
	return bubble
}

var Weather = function(){
	var weather = {
		wind: {
			speed: 10,
			direction: 20
		}
	};

	return weather;
}
var Boat = (function() {
	var WIDTH = 112;
	var LENGTH = 250;
	var boomDiameter = 10;
	var boomWidth = 300;

	var _momentum = 0;
	var _heading = 0;

	var boat = new createjs.Container();
	boat.regX = WIDTH/2;
	boat.regY = LENGTH/2;

	var hull = new createjs.Bitmap('images/small_boat.png');

	var sail = new Sail(WIDTH*1.5, boomDiameter);
	sail.x = WIDTH/2;
	sail.y = 95;

	boat.addChild(hull, sail);

	boat.adjustHeading = function(degree) {
		_heading += degree;
		createjs.Tween.get(boat,{loop:false, override:true})
			.to({rotation:_heading},1000,createjs.Ease.backOut)
	}

	boat.adjustSail = function(amount) {
		sail.rotation += amount;
	}

	boat.toggleSail = function() {

	}

	boat.getSpeed = function() {
		var power = 0;
		power += sail.getPower();
		return power;
	}

	boat.getWidth = function() {
		return WIDTH;
	}

	boat.getLength = function() {
		return LENGTH;
	}

	boat.getHeading = function() {
		var heading = boat.rotation%360;
		return (heading < 0) ? heading+360:heading;
	}

	boat.getSternPosition = function() {
		return LENGTH-boat.regY;
	}

	return boat;
});
var Sail = (function(width, height, sloop) {

	var sail = new createjs.Container();

	var potentialSailPower = 5;

	var sheet = new	createjs.Shape();
	var boom = new createjs.Shape();
	boom.graphics.beginFill('#52352A');
	boom.graphics.drawRoundRect(-(width/2),-height, width, height, 4);
	boom.graphics.endFill();

	function distanceFromOptimalAngle() {
		var windDirection = Game.world.weather.wind.direction;
		var sailAngle = (sail.parent.rotation+sail.rotation)%360;
		var sailHeading = (sailAngle < 0) ? sailAngle+360:sailAngle;
		if (sailAngle - windDirection <= 180) {
			return sailAngle - windDirection;
		} else {
			return (windDirection+360) - sailAngle;
		}
	}

	function drawSail(power) {
		var angleOffset = distanceFromOptimalAngle*.1
		var g = sheet.graphics;
		g.clear();
		g.beginFill('#FFF');
		g.moveTo(-(width/2), -height/2);
		g.curveTo(-height/2, power*-20, width/2, -height/2);
		g.lineTo(-(width/2), -height/2);
		g.endFill();
	}

	sail.getPower = function() {
		var sailPower = (90-Math.abs(distanceFromOptimalAngle()))/90;
		var percentOfPower = (sailPower >= 0) ? sailPower : sailPower/8;
		var power = potentialSailPower*percentOfPower;
		drawSail(power);
		return power;
	}

	sail.addChild(sheet,boom);

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