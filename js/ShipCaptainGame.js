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

	utils.getAxisSpeed = function(angle, speed) {
		return {
			x: Math.sin(angle*Math.PI/180)*speed,
			y: Math.cos(angle*Math.PI/180)*speed
		}
	}

	utils.headingDifference = function(headingOne, headingTwo) {
		var angle = (headingTwo - headingOne)%360;
		if (angle > 180) {
			angle = angle - 360;
		}
		return angle;
	}

	utils.oldHeadingDifference = function(headingOne, headingTwo) {
		var angle = Math.abs((headingTwo - headingOne))%360;
		if (angle > 180) {
			angle = 360 - angle;
		}
		return angle;
	}

	utils.getRelativeHeading = function(currentPosition, target) {
		var xDiff = target.x - currentPosition.x;
		var yDiff = currentPosition.y - target.y;
		var heading = Math.round(Math.atan2(xDiff, yDiff) * (180 / Math.PI));
		return this.convertToHeading(heading);
	}

	utils.distanceBetweenTwoPoints = function(point1, point2) {
		var xs = point2.x - point1.x;
		xs = xs * xs;
		var ys = point2.y - point1.y;
		ys = ys * ys;
		return Math.sqrt(xs + ys);
	}

	utils.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	utils.getRandomFloat = function(min, max) {
		return Math.random() * (max - min) + min;
	}

	utils.getDebugMarker = function(){
		var marker = new createjs.Shape();
		marker.graphics.beginFill('#F00');
		marker.graphics.drawCircle(0,0,10);
		marker.graphics.endFill();
		return marker;
	}

	return utils;
}();
var Particles = function() {
	var particles = {};

	particles.Smoke = function(range) {
		range = range || 360;

		var smoke = new createjs.Container();
		var img = new createjs.Bitmap("images/smoke.png");
		img.regX = img.regY = 25;
		smoke.addChild(img);

		function dissapate() {
			smoke.parent.removeChild(smoke);
		}

		smoke.animate = function() {
			var angle = Utils.getRandomInt(0,range);
			var scale = Utils.getRandomFloat(.2,1);
			var swirl = Utils.getRandomInt(-360, 360);
			var move = Utils.getAxisSpeed(angle+this.rotation, Utils.getRandomInt(50,100));
			smoke.scaleX = smoke.scaleY = 0;

			createjs.Tween.get(this,{loop:false})
				.to({
					x: smoke.x+move.x,
					y: smoke.y-move.y,
					scaleX: scale,
					scaleY: scale,
					alpha: 0
				},1000,createjs.Ease.easeOut)
				.call(dissapate);
			createjs.Tween.get(img,{loop:true})
				.to({
					rotation: swirl
				},1000,createjs.Ease.linear);
		}

		return smoke;
	}

	particles.Bubble = function() {
		var _floatVariance = 100;
		var bubble = new createjs.Shape();
		
		bubble.graphics.beginFill('#95cbdc');
		bubble.graphics.drawCircle(-5,-5,10);
		bubble.graphics.endFill();
	
		bubble.scaleX = bubble.scaleY = .1;
		function pop() {
			bubble.parent.removeChild(bubble);
		}
	
		bubble.animate = function() {
			var floatX = Utils.getRandomFloat(-_floatVariance,_floatVariance)+bubble.x;
			var floatY = Utils.getRandomFloat(-_floatVariance,_floatVariance)+bubble.y;
			var scale = Utils.getRandomFloat(1,3);
		
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
		return bubble;
	}

	return particles;
}();
var Viewport = function(container) {
	var _width = 400;
	var _height = 300;
	var currentScale = 1;
	var scaleIncrements = [.25, .5, 1];

	var viewport = new createjs.Container();
	viewport.name = 'viewport';

	container.x = _width/2;
	container.y = _height/2;

	viewport.addChild(container);

	function changeScale(inc) {
		currentScale += inc;
		var nextScale = Math.abs(currentScale%scaleIncrements.length);
		createjs.Tween.get(container, {override:true})
			.to({scaleX:scaleIncrements[nextScale], scaleY:scaleIncrements[nextScale]}, 1000, createjs.Ease.sineOut)
	}

	viewport.__defineGetter__('width', function(){
		return _width;
	});

	viewport.__defineSetter__('width', function(val){
		viewport.canvasSizeChanged(val,_height);
		return _width;
	});

	viewport.__defineGetter__('height', function(){
		return _height;
	});

	viewport.__defineSetter__('height', function(val){
		viewport.canvasSizeChanged(_width,val);
		return _height;
	});

	viewport.canvasSizeChanged = function(width,height) {
		console.log('canvasSizeChanged', width, height);
		_width = width;
		_height = height;

		container.x = width/2;
		container.y = height/2;
	}

	viewport.zoomIn = function() {
		changeScale(1);
	}

	viewport.zoomOut = function() {
		changeScale(-1);
	}

	return viewport;
}
// Main world class
var World = function(){
	var world = new createjs.Container();
	world.name = 'world';
	world.ships = [];

	var map = world.map = new createjs.Container();
	var ocean = world.ocean = new Ocean(500,500);
	var weather = world.weather = new Weather();
	var playerBoat = world.playerBoat = new PlayerBoat();

	var island = new createjs.Bitmap("images/island.png");
	island.y = -2000;

	var mapCenter = new createjs.Shape();
	mapCenter.graphics.beginFill('#F00');
	mapCenter.graphics.drawCircle(-5,-5,20);
	mapCenter.graphics.endFill();

	map.addChild(mapCenter, island);
	world.addChild(ocean, map);

	addBoat(playerBoat);

	function addBoat(boat) {
		if (world.ships.length < 5) {
			console.log('adding boat', boat);
			boat.addEventListener('sunk', function(){
				var boatIndex = world.ships.indexOf(boat);
				if (boatIndex >= 0) {
					world.ships.splice(boatIndex, 1);
				}
			})
			map.addChild(boat);
			world.ships.push(boat);
		}
	}

	function addPirate() {
		var pirate = new Pirate();
		var minDistance = 1000;

		var xAmount = Utils.getRandomInt(minDistance,3000)
		var xDistance = (Utils.getRandomInt(0,1)) ? -xAmount:xAmount;
		var yAmount = Utils.getRandomInt(minDistance,3000)
		var yDistance = (Utils.getRandomInt(0,1)) ? -yAmount:yAmount;

		pirate.x = xDistance+playerBoat.x;
		pirate.y = yDistance+playerBoat.y;
		pirate.attack(playerBoat);
		addBoat(pirate);
	}

	function eventSpawner() {
		var spawnEvent = (Utils.getRandomInt(0,10) === 10);
		console.log('Spawn event: ', spawnEvent);
		if (spawnEvent) {
			addPirate();
		}
	}
	
	function update() {
		document.getElementById('heading').innerHTML = "Heading: "+Math.round(playerBoat.heading);
		document.getElementById('knots').innerHTML = "Knots: "+Math.round(playerBoat.knots);

		// Update relative positions
		map.regX = playerBoat.x;
		map.regY = playerBoat.y;
		ocean.position.x = -playerBoat.x;
		ocean.position.y = -playerBoat.y;
		ocean.update();

		// Camera animation based on directional velocity
		var xSpeed = Math.sin(playerBoat.heading*Math.PI/180)*-playerBoat.speed;
		var ySpeed = Math.cos(playerBoat.heading*Math.PI/180)*playerBoat.speed;
		createjs.Tween.get(map, {override:true})
			.to({x:xSpeed*100, y:ySpeed*100}, 1000, createjs.Ease.sineOut)
		createjs.Tween.get(ocean, {override:true})
			.to({x:xSpeed*100, y:ySpeed*100}, 1000, createjs.Ease.sineOut)
		
	}

	setInterval(function(){
		eventSpawner();
	}, 10000);

	world.addPirate = addPirate;

	createjs.Ticker.addEventListener("tick", update);
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
		needle.rotation = Game.world.playerBoat.heading;
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

	var crossWidth = width*3 + height*3;

	var tide = new createjs.Shape();
	var g = tide.graphics;
	g.beginBitmapFill(Game.assets['waves']);
	g.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	var underwater = new createjs.Container();

	ocean.addChild(underwater, tide);

	function moveTide() {
		tide.x = ocean.position.x % 200;
		tide.y = ocean.position.y % 150;
	}

	ocean.spawnBubble = function() {
		var bubble = new Particles.Bubble();
		bubble.x = -ocean.position.x;
		bubble.y = -ocean.position.y;
		bubble.animate();
		underwater.addChild(bubble);
	}

	ocean.update = function() {
		document.getElementById('coords').innerHTML = ('x:'+ocean.position.x+' - y:'+ocean.position.y);
		underwater.x = ocean.position.x;
		underwater.y = ocean.position.y;
		moveTide();
	}

	return ocean;
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
	var WIDTH = 56;
	var LENGTH = 125;
	var SPEED = 3;
	var AGILITY = 1;

	var _turningLeft = false;
	var _turningRight = false;
	var _speed = 0;
	var _heading = 0;
	var _trim = 0;
	var _furled = true;

	var _health = 100;

	var bubbleTick = 0;
	var oldWindHeading = 0;

	var boat = new createjs.Container();
	boat.regY = LENGTH/2;

	var dispatcher = createjs.EventDispatcher.initialize(boat);

	var hull = new createjs.Bitmap('images/small_boat.png');
	var helm = new Helm(boat);
	var squareRig = new SquareRig(WIDTH*1.5, {x:-22,y:LENGTH/2+20}, {x:22,y:LENGTH/2+20});
	var mainSail = new ForeAft(LENGTH*.5, {x:0,y:LENGTH-10});
	hull.x = -(WIDTH/2);

	squareRig.y = 45;
	mainSail.y = 55;

	boat.sails = [squareRig,mainSail];
	boat.guns = [];

	boat.addChild(hull, mainSail, squareRig);

	boat.turnLeft = helm.turnLeft;
	boat.turnRight = helm.turnRight;

	function speedCalc() {
		var potentialSpeed = 0;
		boat.sails.map(function(sail){
			potentialSpeed += sail.power;
		});
		if (_health > 0) {
			potentialSpeed = (potentialSpeed/boat.sails.length)*SPEED;
		}
		if (_speed != potentialSpeed) {
			if (_speed > potentialSpeed) {
				_speed -= .002;
			} if (_speed < potentialSpeed) {
				_speed += .05;
			}
		}
	}

	function adjustTrim() {
		var windHeading = Utils.convertToHeading(Game.world.weather.wind.direction - boat.rotation);
		squareRig.trim(windHeading);
		mainSail.trim(windHeading);
	}

	function sink() {
		console.log('sunk');
		boat.parent.removeChild(boat);
		boat.dispatchEvent('sunk');
		createjs.Ticker.removeEventListener("tick", update);
	}

	boat.setSailColor = function(hex) {
		for (var sail in this.sails) {
			this.sails[sail].color = hex;
		}
	}

	boat.addGun = function(gun, position) {
		this.guns.push(gun);
		this.addChildAt(gun, 1);
	}

	boat.stopTurning = function(){
		helm.stopTurning();
		boat.rotation = Math.round(boat.rotation);
	}

	boat.furlSails = function() {
		squareRig.reef();
		mainSail.reef();
	}

	boat.hoistSails = function() {
		squareRig.hoist();
		mainSail.hoist();
		adjustTrim();
	}

	boat.toggleSails = function() {
		if (_furled) {
			this.hoistSails();
		} else {
			this.furlSails();
		}
		_furled = !_furled;
	}

	boat.damage = function(amount) {
		if (_health > 0) {
			console.log(_health);
			_health -= amount;
			if (_health <= 0) {
				sink();
			}
		}
	}

	// Getters
	boat.__defineGetter__('speed', function(){
		return _speed;
	});

	boat.__defineGetter__('knots', function(){
		var knotConversion = 4;
		return _speed*knotConversion;
	});

	boat.__defineGetter__('heading', function(){
		var heading = boat.rotation%360;
		return (heading < 0) ? heading+360:heading;;
	});

	boat.__defineGetter__('width', function(){
		return WIDTH;
	});
	
	boat.__defineGetter__('length', function(){
		return LENGTH;
	});

	boat.getSternPosition = function() {
		return LENGTH-boat.regY;
	}

	function update() {
		speedCalc();
		var turnAmount = helm.turnAmount*AGILITY;
		var windChange = oldWindHeading-Game.world.weather.wind.direction;
		if (turnAmount !== 0 || windChange !== 0) {
			//console.log(windChange);
			oldWindHeading = Game.world.weather.wind.direction;
			if (turnAmount !== 0) {
				var newHeading = (boat.rotation+turnAmount)%360
				boat.rotation = (newHeading < 0) ? newHeading+360:newHeading;
			}
			
			if (!_furled && _health > 0) {
				adjustTrim();
			}
		}

		for (var gun in boat.guns) {
			var cannon = boat.guns[gun];
			
		}

		bubbleTick += Math.round(boat.speed);
		if (bubbleTick >= 7) {
			bubbleTick = 0;
			var bubble = new Particles.Bubble();
			var pos = boat.localToLocal(0, 0, boat.parent);
			bubble.x = pos.x;
			bubble.y = pos.y;
			bubble.animate();
			boat.parent.addChildAt(bubble, 0);
		}
		var xAmount = Math.sin(boat.heading*Math.PI/180)*boat.speed;
		var yAmount = Math.cos(boat.heading*Math.PI/180)*boat.speed;
		boat.x += xAmount;
		boat.y -= yAmount;

		boat.dispatchEvent('moved');
	}

	createjs.Ticker.addEventListener("tick", update);
	return boat;
});
var PlayerBoat = function() {
	var boat = new Boat();
	boat.setSailColor('#FFF');
	// GUN!
	var gun1 = new Gun(10, boat);

	gun1.y = 30;

	Game.addEventListener('onKeyDown', function(event) {
		switch(event.key) {
			case 37: // Left arrow
				boat.turnLeft();
				break;
			case 39: // Right arrow
				boat.turnRight();
				break;
			case 32: // Space
				gun1.shoot();
		}
	});

	Game.addEventListener('onKeyUp', function(event) {
		switch(event.key) {
			case 83: // S Key
				boat.toggleSails();
				break;
			case 37: // Right arrow
			case 39: // Left arrow
				boat.stopTurning();
				break;
		}
	});

	boat.addChildAt(gun1, 1);

	return boat;
}
var AIBoat = function() {
	var boat = new Boat();

	var destination = 0;
	var boatInterval = 0;
	var shootInterval = 0;

	function sailToDestination(location) {
		destination = location;
		switch(typeof(location)) {
			case 'number': // Heading
				turnToHeading(location);
				break;
			case 'object':
				var heading = Utils.getRelativeHeading(boat, location);
				turnToHeading(heading);
				break;
		}
		boat.hoistSails();
	}

	function turnToHeading(heading) {
		var turnAmount = (heading - boat.heading)%360
		if(turnAmount > 180) {
			turnAmount = turnAmount - 360;
		}
		var turnSpeed = Math.abs(turnAmount)*50;
		createjs.Tween.get(boat, {override:true})
			.to({rotation:boat.rotation+turnAmount}, turnSpeed, createjs.Ease.sineOut)
	}

	boat.attack = function(enemy) {
		boatInterval = setInterval(function(){
			var leadAmount = 120;
			var attackPositions = {
				left: enemy.localToLocal(-leadAmount, 0, enemy.parent),
				right: enemy.localToLocal(leadAmount, 0, enemy.parent)
			}
			var distanceFromLeft = Utils.distanceBetweenTwoPoints(attackPositions.left, {x:boat.x,y:boat.y});
			var distanceFromRight = Utils.distanceBetweenTwoPoints(attackPositions.right, {x:boat.x,y:boat.y});
			
			if (distanceFromRight > distanceFromLeft) {
				sailToDestination(attackPositions.left);
			} else {				
				sailToDestination(attackPositions.right);
			}
			
		}, 2000);

		shootInterval = setInterval(function(){
			for (var gun in boat.guns) {
				var cannon = boat.guns[gun];
				if (cannon.isInRange(enemy)) {
					cannon.shoot();
				}
			}
		}, 100);
	}

	boat.evade = function(enemy) {
		
	}

	boat.navigateTo = function(point) {

	}

	boat.wander = function(heading) {
		sailToDestination(heading);
	}

	boat.addEventListener('sunk', function(){
		clearInterval(boatInterval);
		clearInterval(shootInterval);
	});

	return boat;
}
var Pirate = function() {
	var boat = new AIBoat();
	boat.setSailColor('#444');

	var portGun = new Gun(8, boat);
	var starboardGun = new Gun(8, boat);

	portGun.y = starboardGun.y = 100;
	portGun.x = -10;
	starboardGun.x = 10;
	portGun.rotation = -90;
	starboardGun.rotation = 90;

	boat.addGun(portGun);
	boat.addGun(starboardGun);

	return boat;
}
var Sail = (function(windOffset, sailRange, noSail) {
	var _optimalAngle =  180;
	var _maxAngle = 50;
	var trimAngle = 180-windOffset;
	var _power = 0;
	var _reefed = true;

	var windToBoat = 0;

	var sail = new createjs.Container();

	sail.sailColor = '#FFF';
	sail.lineColor = '#ded2b3';

	function updateSail() {
		//console.log('update sail');

		if (_reefed) {
			_power = Math.round( _power * 10) / 10;
			if (_power > 0) {
				_power -= 0.1;
			} else if (_power < 0) {
				_power += 0.1;
			}
		} else {
			var leeway = 10;
			var sailHeading = Utils.convertToHeading(sail.angle);

			// TODO revisit angle from wind logic, its confusing.
			var angleFromWind = Utils.oldHeadingDifference(windToBoat, sailHeading);
			if (angleFromWind > noSail+leeway) {
				_power = 0;
			} else {
				var distanceFromTrim = Math.abs(trimAngle-angleFromWind);
				var power = (noSail - distanceFromTrim)/noSail;
				_power = Math.round( power * 100) / 100; //Rounds to two decimals
			}
		}
		
		if (sail.drawSail) {
			sail.drawSail();
		} 
	}

	function trimTo(angle) {
		createjs.Tween.get(sail, {override:true})
			.to({rotation:angle}, 2000, createjs.Ease.linear);
	}

	sail.hoist = function() {
		_reefed = false;
	}

	sail.reef = function() {
		_reefed = true;
		trimTo(0);
	}

	sail.trim = function(windHeading) {
		if (!_reefed) {
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
	}

	sail.__defineSetter__('angle', function(desiredAngle){
		// console.log('set angle: ', desiredAngle);
		if (!_reefed) {
			var actualAngle = desiredAngle;
			if (desiredAngle < -sailRange) {
				actualAngle = -sailRange;
			} else if (desiredAngle > sailRange) {
				actualAngle = sailRange;
			}
			trimTo(actualAngle)
		}
	});

	sail.__defineGetter__('angle', function(){
		return sail.rotation;
	});

	sail.__defineGetter__('power', function(){
		return _power;
	});

	sail.__defineGetter__('reefed', function(){
		return _reefed;
	});

	sail.__defineGetter__('tack', function(){
		return (windToBoat > 180) ? 'port' : 'starboard';
	});

	sail.__defineSetter__('color', function(hex){
		sail.sailColor = hex;
	});

	createjs.Ticker.addEventListener('tick', updateSail);
	return sail;
});

var SquareRig = function(length, anchor1, anchor2) {
	var sail = new Sail(180, 26, 90);
	sail.name = 'square';
	var sheet_luff = 20;
	var yard_thickness = 6;

	var bunches = 5;
	var bunchSize = length/bunches;
	
	var sheet = new	createjs.Shape();
	var yard = new createjs.Shape();
	var ties = new createjs.Shape();

	var anchorPoint1 = new createjs.Shape();
	var anchorPoint2 = new createjs.Shape();

	anchorPoint1.x = -(length/2)+10;
	anchorPoint2.x = length/2-10;
	anchorPoint1.y = anchorPoint2.y = 0;

	// Draw Yard
	yard.graphics.beginFill('#52352A');
	yard.graphics.drawRoundRect(-(length/2),-3, length, yard_thickness, yard_thickness/2);
	yard.graphics.endFill();
	
	// Draw Ties
	ties.graphics.beginFill(sail.lineColor);
	for (var i = 0; i < bunches-1; i++) {
		ties.graphics.drawRoundRect((-length/2+bunchSize)+(bunchSize*i), -(yard_thickness+2)/2, 2, yard_thickness+2, 2);
	};
	ties.graphics.endFill();

	sail.addChild(anchorPoint1, anchorPoint2, sheet, yard, ties);

	function drawLines() {
		var g1 = anchorPoint1.graphics;
		var g2 = anchorPoint2.graphics;
		g1.clear();
		g2.clear();
		g1.setStrokeStyle('2').beginStroke(sail.lineColor);
		g2.setStrokeStyle('2').beginStroke(sail.lineColor);
		
		var anchorOne = sail.parent.localToLocal(anchor1.x,anchor1.y, anchorPoint1);
		var anchorTwo = sail.parent.localToLocal(anchor2.x,anchor2.y, anchorPoint2);

		g1.moveTo(0,0);
		g2.moveTo(0,0);
		g1.lineTo(anchorOne.x, anchorOne.y);
		g2.lineTo(anchorTwo.x, anchorTwo.y);
		g1.endStroke();
		g2.endStroke();
	}

	sail.drawSail = function() {
		var g = sheet.graphics;
		g.clear();
		if (this.reefed && this.power == 0) {
			g.beginFill(this.sailColor);
			for (var i = 0; i < bunches; i++) {
				g.drawEllipse((-length/2)+(bunchSize*i),-bunchSize/4, bunchSize, bunchSize/2);
			};
			g.endFill();
		} else {
			var luffAmount = -(sail.power*sheet_luff);
			g.beginFill(this.sailColor);
			g.moveTo(-(length/2), -2);
			g.curveTo(-(length*.4), luffAmount/2, -(length*.4), luffAmount);
			g.curveTo(0, luffAmount*2, length*.4, luffAmount);
			g.curveTo(length*.4, luffAmount/2, length/2, -2);
			g.curveTo(0,luffAmount, -(length/2), -2);
			g.endFill();
		}
		
		drawLines();
	}

	return sail;
}

var ForeAft = function(length, anchorPoint) {
	var sail = new Sail(45, 45, 135);
	sail.name = 'fore-aft';

	var sheet = new	createjs.Shape();
	var boom = new createjs.Shape();

	var anchorLine = new createjs.Shape();
	anchorLine.y = length-10;

	boom.graphics.beginFill('#52352A');
	boom.graphics.drawRoundRect(-3, 0, 6, length, 4);
	boom.graphics.endFill();

	sail.addChild(anchorLine, boom, sheet);

	function drawLine() {
		var g = anchorLine.graphics;
		g.clear();
		g.setStrokeStyle('2').beginStroke(sail.lineColor);
		
		var anchor = sail.parent.localToLocal(anchorPoint.x,anchorPoint.y, anchorLine);

		g.moveTo(0,0);
		g.lineTo(anchor.x, anchor.y);
		g.endStroke();
	}

	sail.drawSail = function() {
		var g = sheet.graphics;
		g.clear();
		if (this.reefed && this.power == 0) {
			var bunches = 4;
			var bunchSize = length/bunches;
			g.beginFill(this.sailColor);
			for (var i = 0; i < bunches; i++) {
				g.drawEllipse(-bunchSize/4,bunchSize*i, bunchSize/2, bunchSize);
			};
			g.endFill();
			g.beginFill(this.lineColor);
			for (var i = 0; i < bunches-1; i++) {
				g.drawRoundRect(-bunchSize/8,bunchSize*i+bunchSize-2, bunchSize/4, 2, 2);
			};
			g.endFill();
		} else {
			var power = (sail.tack == 'port') ? this.power : -this.power;
			g.beginFill(this.sailColor);
			g.moveTo(0, 0);
			g.curveTo(power*-40, length*.7, 0, length);
			g.curveTo(power*-10, length/2, 0,0);
			g.endFill();
		}
		
		drawLine();
	}

	return sail;
}
var Helm = function(ship) {
	var MAX_AMOUNT = 100;
	var MIN_AMOUNT = 20;

	var helm = {};
	var _direction = null;

	function getTurnSpeed() {
		var turnAmount = Math.round(ship.knots*20);
		if (turnAmount < MAX_AMOUNT && turnAmount > MIN_AMOUNT) {
			return turnAmount
		} else if (turnAmount >= MAX_AMOUNT) {
			return MAX_AMOUNT;
		} else {
			return MIN_AMOUNT;
		}
	}

	helm.turnLeft = function() {
		_direction = "left";
	}

	helm.turnRight = function() {
		_direction = "right";
	}

	helm.stopTurning = function() {
		_direction = null;
	}

	helm.__defineGetter__('turnAmount', function(){
		switch(_direction) {
			case 'left':
				return -getTurnSpeed()/MAX_AMOUNT;
			case 'right':
				return getTurnSpeed()/MAX_AMOUNT;
			default: 
				return 0;
		}
	});

	return helm;
}


var Gun = function(size, owner) {
	var gun = new createjs.Container();
	var cannon = new createjs.Shape();

	gun.addChild(cannon);

	var reloadTime = 10000;
	var loaded = true;

	var width = size;
	var length = size*3;

	function drawGun() {
		var gfx = cannon.graphics
		gfx.beginFill('#000');
		// Barrel
		gfx.moveTo(0,0);
		gfx.curveTo(width/2,0,width/2,-(width/2));
		gfx.lineTo(width/2-(width/4),-length);
		gfx.lineTo(-(width/2)+(width/4),-length);
		gfx.lineTo(-(width/2),-(width/2));
		gfx.curveTo(-(width/2),0,0,0);
		gfx.endFill();
		// Barrel mouth
		gfx.beginFill('#000');
		gfx.drawRoundRect(-(width/2),-length,width,width/2, width/4);
		gfx.endFill();
		// Barrel butt
		gfx.beginFill('#000');
		gfx.drawCircle(0,0, width/4);
		gfx.endFill();
	}

	function recoil() {
		cannon.y += size;

		// Roll back when reloaded
		createjs.Tween.get(cannon, {override:true})
			.wait(reloadTime-1000)
			.to({y:0}, 1000, createjs.Ease.sineOut)
	}

	function fire() {
		var ball = new Projectile(size*.75,Utils.convertToHeading(owner.rotation+gun.rotation), owner);
		var pos = gun.localToLocal(0,0,owner.parent);
		ball.x = pos.x;
		ball.y = pos.y;
		owner.parent.addChildAt(ball, 2);

		for (var i = 0; i < size*2; i++) {
			var smoke = new Particles.Smoke(90);
			smoke.y = -length;
			smoke.rotation = -45;
			smoke.animate();
			gun.addChild(smoke);
		};

		recoil();

		loaded = false;
		setTimeout(function(){
			loaded = true;
		}, reloadTime);
	}

	gun.shoot = function() {
		if (loaded) {
			fire();
		}
	}

	gun.isInRange = function(target) {
		var gunHeading = Utils.convertToHeading(owner.heading+this.rotation);
		var targetHeading = Utils.getRelativeHeading(this.localToLocal(0,0,owner.parent), target);
		var rangeThreshold = 20;
		var headingDifference = Utils.headingDifference(gunHeading, targetHeading);
		return (Math.abs(headingDifference) <= rangeThreshold);
	}

	drawGun();

	return gun;
}

var Projectile = function(size, angle, owner) {
	var velocity = size*2;
	var range = velocity*4;

	var boatXSpeed = Math.sin(owner.heading*Math.PI/180)*owner.speed;
	var boatYSpeed = Math.cos(owner.heading*Math.PI/180)*-owner.speed;

	var cannonBall = new createjs.Shape();
	cannonBall.graphics.beginFill('#000');
	cannonBall.graphics.drawCircle(0,0,size/2);
	cannonBall.graphics.endFill();

	function checkForHit() {
		for (var ship in Game.world.ships) {
			var boat = Game.world.ships[ship]
			if (boat != owner) {
				var globalPos = cannonBall.localToGlobal(0,0);
				var local = boat.globalToLocal(globalPos.x, globalPos.y);
				var hit = boat.hitTest(local.x, local.y);
				if (hit) {
					explode();
					boat.damage(20);
					return;
				}
			}
		};
	}

	function explode() {
		createjs.Ticker.removeEventListener("tick", update);
		for (var i = 0; i < 30; i++) {
			var bubble = new Particles.Bubble();
			bubble.x = cannonBall.x;
			bubble.y = cannonBall.y;
			cannonBall.parent.addChild(bubble);
			bubble.animate();
		};
		cannonBall.parent.removeChild(cannonBall);
	}

	function update() {
		range--;
		if (range > 0) {
			cannonBall.x += Math.sin(angle*Math.PI/180)*velocity+boatXSpeed;
			cannonBall.y -= Math.cos(angle*Math.PI/180)*velocity-boatYSpeed;
			checkForHit();
		} else {
			explode();
		}
	}

	createjs.Ticker.addEventListener("tick", update);
	return cannonBall;
}


// Parent Game Logic
var Game = (function(){
	var game = {}
	var _preloadAssets = [];
	var _canvas;

	var dispatcher = createjs.EventDispatcher.initialize(game);

	var stage;
	var viewport;
	var world;
	var gauge;
	var preloader;

	game.init = function(canvasId) {
		stage = game.stage = new createjs.Stage(document.getElementById(canvasId));

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
		preloader.onComplete = startGame;
		preloader.loadManifest(manifest);
	}

	function fileLoaded(event) {
		console.log('handleFileLoad: ', event);
		_preloadAssets.push(event.item);
	}

	function startGame() {
		console.log('startGame')
		game.assets = {};
		for (var i = 0; i < _preloadAssets.length; i++) {
			console.log(_preloadAssets[i]);
			game.assets[_preloadAssets[i].id] = preloader.getResult(_preloadAssets[i].id);
		};
		console.log('Game.assets', game.assets);

		var world = game.world = new World();
		viewport = new Viewport(world);
		gauge = new Gauge();

		viewport.width = stage.canvas.width;
		viewport.height = stage.canvas.height;
		gauge.x = stage.canvas.width - 75;
		gauge.y = stage.canvas.height - 75;

		stage.addChild(viewport,gauge);
		
		//Ticker
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", tick);

		sizeCanvas();
	}

	function sizeCanvas() {
		if (viewport) {
			stage.canvas.width = window.innerWidth;
			stage.canvas.height = window.innerHeight;
			viewport.canvasSizeChanged(stage.canvas.width, stage.canvas.height);
			gauge.x = stage.canvas.width - 75;
			gauge.y = stage.canvas.height - 75;
		}
	}

	function onKeyDown(event) {
		switch(event.keyCode) {
			case 38: // Up arrow
				//Game.world.weather.wind.direction = Utils.convertToHeading(Game.world.weather.wind.direction+10);
				break;
			case 40: // Down arrow
				//Game.world.weather.wind.direction = Utils.convertToHeading(Game.world.weather.wind.direction-10);
				break;
			default:
				game.dispatchEvent({type:'onKeyDown', key:event.keyCode});
		}
	}

	function onKeyUp(event) {
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
			default:
				game.dispatchEvent({type:'onKeyUp', key:event.keyCode});
		}
	}

	function tick() {
		gauge.update();
		//world.update();
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