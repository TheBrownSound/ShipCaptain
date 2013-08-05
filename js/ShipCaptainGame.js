// Fuse dependencies
var Utils = function() {
	var utils = {};

	utils.convertToHeading = function(number) {
		var heading = number%360;
		return (heading < 0) ? heading+360:heading;
	}

	utils.convertToNumber = function(heading) {
		if (heading > 180) {
			return heading-360;
		} else {
			return heading;
		}
	}

	utils.headingDifference = function(headingOne, headingTwo) {
		var angle = (Math.abs(headingOne - headingTwo))%360;
		if(angle > 180) {
			angle = 360 - angle;
		}
		return angle;
	}

	return utils;
}();
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
		playerBoat.update();
		var heading = playerBoat.getHeading();
		document.getElementById('heading').innerHTML = "Heading: "+Math.round(heading);
		var speed = playerBoat.getSpeed();
		document.getElementById('knots').innerHTML = "Knots: "+Math.round(speed);
		var knotConversion = speed*.5;
		ocean.position.x -= Math.sin(heading*Math.PI/180)*knotConversion;
		ocean.position.y += Math.cos(heading*Math.PI/180)*knotConversion;
		ocean.spawnBubble();
		ocean.update();
	}

	return world;
}
var Gauge = function() {
	var gauge = new createjs.Container();
	gauge.width = gauge.height = 100;

	var windCircle = new createjs.Bitmap("images/windgauge.png");
	var compass = new createjs.Bitmap("images/compass.png");
	var needle = new createjs.Bitmap("images/needle.png");

	windCircle.regX = compass.regX = needle.regX = gauge.width/2;
	windCircle.regY = compass.regY = needle.regY = gauge.height/2;

	gauge.addChild(windCircle, compass, needle);

	gauge.update = function() {
		windCircle.rotation = Game.world.weather.wind.direction;
		needle.rotation = Game.world.playerBoat.getHeading();
	}

	return gauge;
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
			direction: 45
		}
	};

	return weather;
}
var Boat = (function() {
	var WIDTH = 112;
	var LENGTH = 250;
	var SPEED = 10;
	var AGILITY = 1;

	var boomDiameter = 10;
	var boomWidth = 300;

	var _turningLeft = false;
	var _turningRight = false;
	var _speed = 0;
	var _heading = 0;
	var _trim = 0;

	var boat = new createjs.Container();
	boat.regX = WIDTH/2;
	boat.regY = LENGTH/2;

	var hull = new createjs.Bitmap('images/small_boat.png');
	var helm = new Helm();
	var squareRig = new SquareRig(WIDTH*1.5);
	var mainSail = new ForeAft(LENGTH*.5);
	squareRig.x = WIDTH/2;
	mainSail.x = WIDTH/2;
	squareRig.y = 95;
	mainSail.y = 115;

	boat.sails = [squareRig,mainSail];

	boat.addChild(hull, squareRig, mainSail);

	boat.turnLeft = helm.turnLeft;
	boat.turnRight = helm.turnRight;

	function speedCalc() {
		var potentialSpeed = 0;
		boat.sails.map(function(sail){
			potentialSpeed += sail.power;
		});
		potentialSpeed = (potentialSpeed/boat.sails.length)*SPEED;
		if (_speed != potentialSpeed) {
			if (_speed > potentialSpeed) {
				_speed -= .01;
			} if (_speed < potentialSpeed) {
				_speed += .01;
			}
		}
	}

	boat.stopTurning = function(){
		helm.stopTurning();
		boat.rotation = Math.round(boat.rotation);
	}

	boat.adjustTrim = function() {
		var windHeading = Utils.convertToHeading(Game.world.weather.wind.direction - boat.rotation);
		squareRig.trim(windHeading);
		mainSail.trim(windHeading);
	}

	boat.reefSails = function() {
		squareRig.reef();
		mainSail.reef();
	}

	boat.hoistSails = function() {
		squareRig.hoist();
		mainSail.hoist();
		this.adjustTrim();
	}

	boat.toggleSail = function() {

	}

	boat.getSpeed = function() {
		return _speed;
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

	boat.update = function() {
		speedCalc();
		var turnAmount = helm.turnAmount*AGILITY;
		if (turnAmount !== 0) {
			var newHeading = (boat.rotation+turnAmount)%360
			boat.rotation = (newHeading < 0) ? newHeading+360:newHeading;
			boat.adjustTrim();
		}
	}

	return boat;
});
var Sail = (function(windOffset, sailRange, noSail) {
	var _optimalAngle =  180;
	var _maxAngle = 50;
	var trimAngle = 180-windOffset;
	var _power = 0;
	var _reefed = true;

	var windToBoat = 0;

	var sail = new createjs.Container();

	function updateSail() {
		var sailHeading = Utils.convertToHeading(sail.angle);
		var angleFromWind = Utils.headingDifference(windToBoat, sailHeading);
		if (angleFromWind > noSail) {
			_power = 0;
		} else {
			var distanceFromTrim = Math.abs(trimAngle-angleFromWind);
			var power = (noSail - distanceFromTrim)/noSail;
			_power = power;
		}
		if (sail.drawSail) sail.drawSail();
	}

	sail.hoist = function() {
		_reefed = false;
	}

	sail.reef = function() {
		_reefed = true;
		sail.angle = 0;
	}

	sail.trim = function(windHeading) {
		windToBoat = windHeading;
		//console.log('Trim for wind: ', windHeading);
		var nosail = (Math.abs(Utils.convertToNumber(windHeading)) > noSail);
		if (nosail) { // in irons
			sail.angle = 0;
		} else {
			var offset = (windHeading > 180) ? trimAngle : -trimAngle;
			sail.angle = Utils.convertToNumber(windHeading+offset);
		}
	}

	sail.__defineSetter__('angle', function(desiredAngle){
		//console.log('set angle: ', desiredAngle);
		var actualAngle = desiredAngle;
		if (desiredAngle < -sailRange) {
			actualAngle = -sailRange;
		} else if (desiredAngle > sailRange) {
			actualAngle = sailRange;
		}
		createjs.Tween.get(sail, {override:true})
			.to({rotation:actualAngle}, 2000, createjs.Ease.linear)
			.addEventListener("change", updateSail);
	});

	sail.__defineGetter__('angle', function(){
		return sail.rotation;
	});

	sail.__defineGetter__('power', function(){
		return (_reefed) ? 0 : _power;
	});

	sail.__defineGetter__('tack', function(){
		return (windToBoat > 180) ? 'port' : 'starboard';
	});

	return sail;
});

var SquareRig = function(length) {
	var sail = new Sail(180, 26, 90);
	sail.name = 'square';
	
	var sheet = new	createjs.Shape();
	var yard = new createjs.Shape();

	var sheet_luff = 40;

	yard.graphics.beginFill('#52352A');
	yard.graphics.drawRoundRect(-(length/2),-10, length, 10, 4);
	yard.graphics.endFill();

	sail.drawSail = function() {
		var g = sheet.graphics;
		g.clear();
		g.beginFill('#FFF');
		if (sail.power > 0) {
			var luffAmount = -(sail.power*sheet_luff);
			g.moveTo(-(length/2), -5);
			g.curveTo(-(length*.4), luffAmount/2, -(length*.4), luffAmount);
			g.curveTo(0, luffAmount*2, length*.4, luffAmount);
			g.curveTo(length*.4, luffAmount/2, length/2, -5);
			g.lineTo(-(length/2), -5);
		}
		g.endFill();
	}

	sail.addChild(sheet,yard);

	return sail;
}

var ForeAft = function(length) {
	var sail = new Sail(45, 60, 135);
	sail.name = 'fore-aft';

	var sheet = new	createjs.Shape();
	var boom = new createjs.Shape();

	boom.graphics.beginFill('#52352A');
	boom.graphics.drawRoundRect(-5, 0, 10, length, 4);
	boom.graphics.endFill();

	sail.drawSail = function() {
		var g = sheet.graphics;
		g.clear();
		g.beginFill('#FFF');
		g.moveTo(0, 0);
		var power = (sail.tack == 'port') ? sail.power : -sail.power;
		g.curveTo(power*-50, length*.9, 0, length);
		g.lineTo(0,0);
		g.endFill();
	}

	sail.addChild(boom, sheet);

	return sail;
}
var Helm = function(turnSpeed) {
	var TURN_SPEED = turnSpeed || 10;
	var MAX_AMOUNT = 100;

	var helm = {};
	var _turning = false;
	var _amount = 0;

	helm.turnLeft = function() {
		_turning = true;
		if (_amount > -MAX_AMOUNT) {
			_amount -= TURN_SPEED;
		}
	}

	helm.turnRight = function() {
		_turning = true;
		if (_amount < MAX_AMOUNT) {
			_amount += TURN_SPEED;
		}
	}

	helm.stopTurning = function() {
		_turning = false;
	}

	helm.__defineGetter__('turnAmount', function(){
		return _amount/MAX_AMOUNT;
	});

	setInterval(function() {
		if (!_turning) {
			if (_amount > 0) {
				_amount -= TURN_SPEED;
			} else if (_amount < 0) {
				_amount += TURN_SPEED;
			}
		}
	}, 100);

	return helm;
}

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