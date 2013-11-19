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
			y: -(Math.cos(angle*Math.PI/180)*speed)
		}
	}

	utils.getTotalSpeed = function(xSpeed, ySpeed) {
		return Math.sqrt(xSpeed * xSpeed + ySpeed * ySpeed);
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

	utils.yesNo = function() {
		return (this.getRandomInt(0,1) == 1) ? true:false;
	}

	utils.getDebugMarker = function(){
		var marker = new createjs.Shape();
		marker.graphics.beginFill('#F00');
		marker.graphics.drawCircle(0,0,2);
		marker.graphics.endFill();
		return marker;
	}

	utils.removeFromArray = function(array, item) {
		var itemIndex = array.indexOf(item);
		if (itemIndex >= 0) {
			array.splice(item, 1);
			return true;
		}
		return false;
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

		smoke.animate = function(momentum) {
			momentum = momentum || {x:0,y:0};
			var angle = Utils.getRandomInt(0,range);
			var scale = Utils.getRandomFloat(.2,1);
			var swirl = Utils.getRandomInt(-360, 360);
			var move = Utils.getAxisSpeed(angle+this.rotation, Utils.getRandomInt(50,100));
			smoke.scaleX = smoke.scaleY = scale;
			
			var duration = 3000;

			createjs.Tween.get(this,{loop:false})
				.to({
					x: (smoke.x+move.x)+(momentum.x*30),//30 seems to be the magic number for 60fps
					y: (smoke.y+move.y)+(momentum.y*30)
				},duration,createjs.Ease.circOut);

			createjs.Tween.get(this,{loop:false})
				.to({
					scaleX: 0,
					scaleY: 0
				},duration,createjs.Ease.expoIn)
				.call(dissapate);
			
			createjs.Tween.get(img,{loop:false})
				.to({
					rotation: swirl
				},duration,createjs.Ease.circOut)
				
		}

		return smoke;
	}

	particles.Splinter = function(range) {
		range = range || 360;

		var splinter = new createjs.Container();
		var type = Utils.getRandomInt(1,3);
		var shrapnel = new createjs.Bitmap("images/splinter"+Utils.getRandomInt(1,3)+".png");
		shrapnel.regX = (15*type)/2;
		shrapnel.regY = 5;
		splinter.addChild(shrapnel);

		function sink() {
			splinter.parent.removeChild(splinter);
		}

		splinter.animate = function() {
			var angle = Utils.getRandomInt(0,range);
			var scale = Utils.getRandomFloat(.2,1);
			var spin = Utils.getRandomInt(-720, 720);
			var move = Utils.getAxisSpeed(angle+this.rotation, Utils.getRandomInt(0,100));
			splinter.scaleX = splinter.scaleY = scale;

			createjs.Tween.get(splinter,{loop:false})
				.to({
					x: splinter.x+move.x,
					y: splinter.y+move.y,
				},1500,createjs.Ease.quintOut)
				.to({
					scaleX: .1,
					scaleY: .1,
					alpha: 0
				},2000,createjs.Ease.quadIn)
				.call(sink);
				
			createjs.Tween.get(shrapnel,{loop:false})
				.to({
					rotation: spin
				},2000,createjs.Ease.quintOut);
				
		}

		return splinter;
	}

	particles.Bubble = function() {
		var _floatVariance = 100;
		var bubble = new createjs.Shape();
		
		bubble.graphics.beginFill('#639ebe');
		bubble.graphics.drawCircle(-5,-5,10);
		bubble.graphics.endFill();
	
		bubble.scaleX = bubble.scaleY = .1;
		function pop() {
			bubble.parent.removeChild(bubble);
		}
	
		bubble.animate = function() {
			var floatX = Utils.getRandomFloat(-_floatVariance,_floatVariance)+bubble.x;
			var floatY = Utils.getRandomFloat(-_floatVariance,_floatVariance)+bubble.y;
			var scale = Utils.getRandomFloat(.5,2);
		
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
	var scaleIncrements = [.5, 1];

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
// Top Down world class
var World = function(playerBoat){
	var _eventFrequency = 10000;

	var world = new createjs.Container();
	world.name = 'world';
	world.places = [];
	world.ships = [];
	world.playerBoat = playerBoat;

	var map = world.map = new createjs.Container();
	var ocean = world.ocean = new Ocean(500,500);
	var weather = world.weather = new Weather();

	var island = new Island();
	island.y = -200;

	var mapCenter = new createjs.Shape();
	mapCenter.graphics.beginFill('#F00');
	mapCenter.graphics.drawCircle(-5,-5,20);
	mapCenter.graphics.endFill();

	map.addChild(mapCenter);
	world.addChild(ocean, map);

	addBoat(playerBoat);
	addPlace(island);

	//var eventTick = setInterval(eventSpawner, _eventFrequency);

	//Start playing water sound
	createjs.Sound.play("water", {loop:-1});

	function addBoat(boat) {
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

	function addPlace(obj) {
		map.addChildAt(obj, 0);
		world.places.push(obj);
	}

	function addPirate() {
		if (world.ships.length < 5) {
			var pirate = new Pirate();
			var minDistance = 1000;

			var xAmount = Utils.getRandomInt(minDistance,3000)
			var xDistance = (Utils.getRandomInt(0,1)) ? -xAmount:xAmount;
			var yAmount = Utils.getRandomInt(minDistance,3000)
			var yDistance = (Utils.getRandomInt(0,1)) ? -yAmount:yAmount;

			pirate.x = xDistance+playerBoat.x;
			pirate.y = yDistance+playerBoat.y;
			if (playerBoat.health > 0) {
				pirate.attack(playerBoat);
			}
			addBoat(pirate);
			return pirate;
		}
	}

	function eventSpawner() {
		var spawnEvent = (Utils.getRandomInt(0,10) === 10);
		console.log('Spawn event: ', spawnEvent);
		if (spawnEvent) {
			addPirate();
		}
	}

	function triggerCollision(boat, object, collisionRect) {
		var localPos = boat.globalToLocal(collisionRect.x,collisionRect.y)
		collisionRect.x = localPos.x;
		collisionRect.y = localPos.y;
		boat.collision(object, collisionRect);
	}
	
	function update() {
		document.getElementById('heading').innerHTML = "Heading: "+Math.round(playerBoat.heading);
		document.getElementById('knots').innerHTML = "Knots: "+Math.round(playerBoat.knots);

		// boat collision detection
		for (var ship in world.ships) {
			var boat = world.ships[ship];
			for (var otherShip in world.ships) {
				var otherBoat = world.ships[otherShip];
				if (boat != otherBoat) {
					var crashRect = ndgmr.checkPixelCollision(boat.hull,otherBoat.hull, 0, true);
					if (crashRect) {
						triggerCollision(boat, otherBoat, crashRect);
					}
				}
			}

			for (var place in world.places) {
				var object = world.places[place];
				var hitBox = ndgmr.checkPixelCollision(boat.hull,object.hitBox, 0.5, true);
				if (hitBox) {
					triggerCollision(boat, object, hitBox);
				}
			}
		}

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

	var testBoat = new Boat();
	testBoat.x = 300;
	testBoat.y = 300;

	addBoat(testBoat);

	//var testRect = new createjs.Shape();
	//playerBoat.addChild(testRect);

	Game.stage.onMouseDown = function(e) {
		var location = playerBoat.globalToLocal(e.stageX,e.stageY);
		console.log(location);

		var pirate = addPirate();
		if (pirate) {
			pirate.x = playerBoat.x+location.x;
			pirate.y = playerBoat.y+location.y;
		}
		
		
		/*
		var hitRect = ndgmr.checkPixelCollision(playerBoat.hull,testBoat.hull, 0, true);
		
		var hitLocation = playerBoat.globalToLocal(hitRect.x,hitRect.y)
		console.log(hitRect);
		testRect.graphics.clear();
		testRect.graphics.beginFill('#fff');
		testRect.graphics.rect(hitLocation.x,hitLocation.y,hitRect.width,hitRect.height);
		testRect.graphics.endFill();

		if (hitRect) {
			playerBoat.collision({x:hitLocation.x,y:hitLocation.y});
		}
		*/
	}

	world.addPirate = addPirate;

	createjs.Ticker.addEventListener("tick", update);
	return world;
}
var WindGauge = function() {
	var gauge = new createjs.Container();
	gauge.width = gauge.height = 100;

	var windCircle = new createjs.Bitmap("images/windgauge.png");
	var compass = new createjs.Bitmap("images/compass.png");
	var needle = new createjs.Bitmap("images/needle.png");

	windCircle.regX = compass.regX = needle.regX = gauge.width/2;
	windCircle.regY = compass.regY = needle.regY = gauge.height/2;

	gauge.addChild(windCircle, compass, needle);

	function updateGauge() {
		windCircle.rotation = Game.world.weather.wind.direction;
		needle.rotation = Game.world.playerBoat.heading;
	}

	createjs.Ticker.addEventListener('tick', updateGauge);
	return gauge;
}

var HealthMeter = function(boat) {
	var meter = new createjs.Container();
	meter.width = 20;
	meter.height = 100;

	var bg = new createjs.Shape();
	bg.graphics.beginFill('#333');
	bg.graphics.rect(0,0,meter.width,meter.height);
	bg.graphics.endFill();

	var bar = new createjs.Shape();
	bar.graphics.beginFill('#F00');
	bar.graphics.rect(2,2,meter.width-4,meter.height-4);
	bar.graphics.endFill();
	bar.y = bar.regY = meter.height-4;

	meter.addChild(bg,bar);

	boat.addEventListener('healthChanged', function(amount) {
		bar.scaleY = boat.health/boat.life;
	});

	return meter;
}

var SpeedMeter = function(boat) {
	var meter = new createjs.Container();
	meter.width = 20;
	meter.height = 100;

	var bg = new createjs.Shape();
	bg.graphics.beginFill('#333');
	bg.graphics.rect(0,0,meter.width,meter.height);
	bg.graphics.endFill();

	var bar = new createjs.Shape();
	bar.graphics.beginFill('#BADA55');
	bar.graphics.rect(2,2,meter.width-4,meter.height-4);
	bar.graphics.endFill();
	bar.y = bar.regY = meter.height-4;

	var speed = new createjs.Shape();
	speed.graphics.beginFill('#BAD');
	speed.graphics.rect(2,2,meter.width-4,meter.height-4);
	speed.graphics.endFill();
	speed.y = speed.regY = meter.height-4;

	meter.addChild(bg,bar,speed);

	function updateSpeed() {
		bar.scaleY = boat.potentialSpeed/boat.topSpeed;
		speed.scaleY = boat.speed/boat.topSpeed;
	}

	createjs.Ticker.addEventListener('tick', updateSpeed);
	return meter;
}

var ShootButton = function(type) {
	var _width = 60;
	var _height = 60;
	var btn = new createjs.Container();

	var overlay = new createjs.Bitmap('images/cannon_button.png');
	overlay.x = overlay.y = overlay.regX = overlay.regY = 30;
	if (type == 'port') {
		overlay.rotation = -90;
	} else if (type == 'starboard') {
		overlay.rotation = 90;
	}

	var background = new createjs.Shape();

	background.graphics.beginFill('#604535');
	background.graphics.drawRect(6,6,48,48);
	background.graphics.endFill();

	var reloadMeter = new createjs.Shape();
	reloadMeter.x = 6;
	reloadMeter.y = 54;
	reloadMeter.regY = 48;
	reloadMeter.graphics.beginFill('#F00');
	reloadMeter.graphics.drawRect(0,0,48,48);
	reloadMeter.graphics.endFill();
	reloadMeter.alpha = .5;

	btn.addChild(background, reloadMeter, overlay);

	btn.__defineGetter__('width', function() {
		return _width;
	});

	btn.__defineGetter__('height', function() {
		return _height;
	});

	Game.world.playerBoat.addEventListener('gunsfired', function(event) {
		if (event.target.location == 'all' || event.target.location == type) {
			reloadMeter.scaleY = 0;
			createjs.Tween.get(reloadMeter,{loop:false})
				.to({
					scaleY: 1
				},event.target.reloadTime,createjs.Ease.linear);
		}
	});

	btn.addEventListener("click", handleClick);
	function handleClick(event) {
		event.nativeEvent.stopImmediatePropagation();
		console.log('event', event);
		Game.world.playerBoat.fireGuns(type);
	}
	return btn;
}
var Ocean = function(width, height){
	//Constants
	var MAX_TIDE_SPEED = 10;

	var _tideTopX = .1;
	var _tideTopY = .2;
	var _tideMidX = 0;
	var _tideMidY = -.1;
	var _tideBotX = -.2;
	var _tideBotY = .2;

	var ocean = new createjs.Container();
	ocean.width = width;
	ocean.height = height;
	ocean.position = {x:0, y:0};

	var crossWidth = width*3 + height*3;

	var tideTop = new createjs.Shape();
	var tideMid = new createjs.Shape();
	var tideBot = new createjs.Shape();
	
	tideTop.graphics.beginBitmapFill(Game.assets['tide_top']);
	tideTop.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	tideMid.graphics.beginBitmapFill(Game.assets['tide_mid']);
	tideMid.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	tideBot.graphics.beginBitmapFill(Game.assets['tide_bot']);
	tideBot.graphics.drawRect(-crossWidth, -crossWidth, crossWidth*2, crossWidth*2);

	var underwater = new createjs.Container();

	ocean.addChild(underwater, tideBot, tideMid, tideTop);

	function moveTide() {
		_tideTopX += _tideTopX;
		_tideTopY += _tideTopY;
		_tideMidX += _tideMidX;
		_tideMidY += _tideMidY;
		_tideBotX += _tideBotX;
		_tideBotY += _tideBotY;

		tideTop.x = (ocean.position.x) % 400;
		tideTop.y = (ocean.position.y) % 400;
		tideMid.x = (ocean.position.x*.8) % 400;
		tideMid.y = (ocean.position.y*.8) % 400;
		tideBot.x = (ocean.position.x*.6) % 400;
		tideBot.y = (ocean.position.y*.6) % 400;
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
			direction: 0
		}
	};

	return weather;
}
var Boat = (function() {
	var WIDTH = 56;
	var LENGTH = 125;
	var _agility = 1;
	
	// Movement Properties
	var _topSpeed = 0;
	var _speed = 0;
	var _limit = 10;
	var _heading = 0;
	var _bump = {x:0,y:0,rotation:0};
	
	var _furled = true;

	// Health Properties
	var _life = 100;
	var _health = 100;

	var bubbleTick = 0;

	var boat = new createjs.Container();
	//boat.regY = LENGTH/2;

	var dispatcher = createjs.EventDispatcher.initialize(boat);

	var hull = boat.hull = new createjs.Bitmap('images/small_boat.png');
	var mast = boat.mast = new createjs.Bitmap('images/small_boat_mast.png');
	var helm = new Helm(boat);
	hull.x = mast.x = -(WIDTH/2);
	hull.y = mast.y = -(LENGTH/2);

	boat.sails = [];
	boat.guns = [];

	boat.addChild(hull, mast);

	boat.turnLeft = helm.turnLeft;
	boat.turnRight = helm.turnRight;

	function speedCalc() {
		var potentialSpeed = 0;

		for (var i = 0; i < boat.sails.length; i++) {
			var sail = boat.sails[i];
			potentialSpeed += sail.power;
		};

		if (_health > 0) {
			potentialSpeed = (potentialSpeed/boat.sails.length)*_topSpeed;
			potentialSpeed = Math.round( potentialSpeed * 1000) / 1000; //Rounds to three decimals
		}

		var potentialAxisSpeed = Utils.getAxisSpeed(boat.heading, potentialSpeed);

		potentialAxisSpeed.x = Math.abs(Math.round( potentialAxisSpeed.x * 1000) / 1000);
		potentialAxisSpeed.y = Math.abs(Math.round( potentialAxisSpeed.y * 1000) / 1000);

		if (_speed != potentialSpeed) {
			if (_speed > potentialSpeed) {
				_speed -= .005;
			} if (_speed < potentialSpeed) {
				_speed += .01;
			}
		}
	}

	function adjustTrim() {
		var windHeading = Utils.convertToHeading(Game.world.weather.wind.direction - boat.rotation);
		boat.sails.map(function(sail){
			sail.trim(windHeading);
		});
	}

	function bumpDecay() {
		if (_bump.x != 0) {
			if (_bump.x > 0) {
				_bump.x -= 0.01;
				if (_bump.x < 0 ) {
					_bump.x = 0;
				}
			} else if (_bump.x < 0) {
				_bump.x += 0.01;
				if (_bump.x > 0 ) {
					_bump.x = 0;
				}
			}
		}

		if (_bump.y != 0) {
			if (_bump.y > 0) {
				_bump.y -= 0.01;
				if (_bump.y < 0 ) {
					_bump.y = 0;
				}
			} else if (_bump.y < 0) {
				_bump.y += 0.01;
				if (_bump.y > 0 ) {
					_bump.y = 0;
				}
			}
		}
		if (_bump.rotation != 0) {
			if (_bump.rotation > 0) {
				_bump.rotation -= 0.01;
				if (_bump.rotation < 0 ) {
					_bump.rotation = 0;
				}
			} else if (_bump.rotation < 0) {
				_bump.rotation += 0.01;
				if (_bump.rotation > 0 ) {
					_bump.rotation = 0;
				}
			}
		}
	}

	function sink() {
		console.log('sunk');
		boat.dispatchEvent('sunk');

		//Smoke
		for (var i = 0; i < 40; i++) {
			var smoke = new Particles.Smoke();
			smoke.x = boat.x;
			smoke.y = boat.y;
			boat.parent.addChildAt(smoke, 1);
			smoke.animate();
		};

		//Splinters
		for (var i = 0; i < 20; i++) {
			var splinter = new Particles.Splinter();
			splinter.x = boat.x;
			splinter.y = boat.y;
			boat.parent.addChildAt(splinter, 1);
			splinter.animate();
		};
		
		createjs.Ticker.removeEventListener("tick", update);
		boat.parent.removeChild(boat);
	}

	function getCurrentAgility() {
		var limit = 2; // speed at which velocity no longer factors into agility
		if (boat.speed < limit) {
			var reducedAgility = (boat.speed/limit)*_agility;
			if (reducedAgility < 0.3) {
				return 0.3
			} else {
				return reducedAgility
			}
		} else {
			return _agility;
		}
	}

	boat.setSailColor = function(hex) {
		for (var sail in this.sails) {
			this.sails[sail].color = hex;
		}
	}

	boat.addSail = function(sail, position) {
		this.sails.push(sail);

		// Recalculate top speed
		var topSpeed = 0;
		for (var i = 0; i < this.sails.length; i++) {
			topSpeed += this.sails[i].speed;
		};
		var diminishingReturns = 1/Math.sqrt(this.sails.length);
		_topSpeed = (topSpeed*diminishingReturns);
		if (sail.type == "sqare") {
			this.addChildAt(sail);
		} else {
			this.addChildAt(sail, 1);
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

	boat.increaseSpeed = function() {
		if (_limit <= 0) {
			boat.hoistSails();
		}
		_limit++;
		if (_limit > 10) {
			_limit = 10;
		}
	}

	boat.decreaseSpeed = function() {
		_limit--;
		if (_limit <= 0) {
			_limit = 0;
			boat.furlSails();
		}
	}

	boat.furlSails = function() {
		boat.sails.map(function(sail){
			sail.reef();
		});
	}

	boat.hoistSails = function() {
		boat.sails.map(function(sail){
			sail.hoist();
		});
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

	boat.cannonHit = function(damageAmount, location) {
		createjs.Sound.play("hit").setVolume(0.5);
		createjs.Sound.play("small_explosion");
		var dmg = Math.round(damageAmount);
		for (var i = 0; i < dmg; i++) {
			var splinter = new Particles.Splinter();
			var pos = boat.localToLocal(location.x, location.y, boat.parent)
			splinter.x = pos.x;
			splinter.y = pos.y;
			boat.parent.addChildAt(splinter, 1);
			splinter.animate();
		};
		boat.damage(dmg);
	}

	//var hitMarker = Utils.getDebugMarker();
	//boat.addChild(hitMarker);

	boat.collision = function(object, location) {
		var objVelocity = {x:0,y:0};
		if (object.type === 'boat') {
			objVelocity = Utils.getAxisSpeed(object.heading, object.speed);
		}

		var boatVelocity = Utils.getAxisSpeed(this.heading, this.speed);
		var impactXForce = -(boatVelocity.x - objVelocity.x);
		var impactYForce = -(boatVelocity.y - objVelocity.y);
		var impactForce = Math.abs(Utils.getTotalSpeed(impactXForce,impactYForce));
		impactLocation = {
			x: location.x+(location.width/2),
			y: location.y+(location.height/2)
		}

		//hitMarker.x = impactLocation.x
		//hitMarker.y = impactLocation.y

		impactRoation = (impactLocation.x/impactLocation.y)*.5;
		boat.x += impactXForce;
		boat.y += impactYForce;
		_speed -= impactForce;
		if (_speed < 0 ) _speed = 0;

		_bump = {
			x: impactXForce*.5,
			y: impactYForce*.5,
			rotation: impactRoation*impactForce
		};

		if (impactForce > 1) {
			console.log(impactForce);
			boat.damage(impactForce);
			var hitSound = createjs.Sound.play("hit");
			hitSound.volume = 0.1;
		}
	}

	boat.repair = function(amount) {
		if (_health < _life) {
			_health += amount;
			if (_health > _life) {
				_health = _life;
			}
			boat.dispatchEvent('healthChanged', amount);
		}
	}

	boat.damage = function(amount) {
		if (_health > 0) {
			_health -= amount;
			if (_health <= 0) {
				_health = 0;
				sink();
			}
			boat.dispatchEvent('healthChanged', amount);
		}
	}

	// Getters
	boat.__defineGetter__('health', function(){
		return _health;
	});

	boat.__defineGetter__('life', function(){
		return _life;
	});

	boat.__defineGetter__('agility', function(){
		return _agility;
	});

	boat.__defineGetter__('topSpeed', function(){
		return _topSpeed*.75;
	});

	boat.__defineGetter__('potentialSpeed', function(){
		return _speed;
	});

	boat.__defineGetter__('speed', function(){
		return _speed*(_limit/10);
	});

	boat.__defineGetter__('knots', function(){
		var knotConversion = 4;
		return Math.round(boat.speed*knotConversion);
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

		if (!_furled && _health > 0) {
			adjustTrim();
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


		var axisSpeed = Utils.getAxisSpeed(boat.heading, boat.speed);
		boat.x += axisSpeed.x+_bump.x;
		boat.y += axisSpeed.y+_bump.y;
		boat.rotation += getCurrentAgility()*helm.turnAmount+_bump.rotation;

		bumpDecay();

		boat.dispatchEvent('moved');
	}

	createjs.Ticker.addEventListener("tick", update);
	return boat;
});
var PlayerBoat = function() {
	var boat = new Boat();
	boat.name = 'PlayerBoat';
	boat.setSailColor('#FFF');

	var _fireAtWill = false;

	var WIDTH = 56;
	var LENGTH = 125;
	
	// Sails
	var squareRig = new SquareRig(WIDTH*1.5, {x:-23,y:-10}, {x:23,y:-10});
	var mainSail = new ForeAft(LENGTH*.5, {x:0,y:30});
	var telltail = new TellTail(10);
	squareRig.y = -35;
	mainSail.y = -26;
	telltail.y = -30;
	boat.addSail(squareRig);
	boat.addSail(mainSail);
	boat.addChild(telltail);

	// GUNS!
	var portGun1 = new Gun(4, 10, boat);
	var portGun2 = new Gun(4, 10, boat);

	var starboardGun1 = new Gun(4, 10, boat);
	var starboardGun2 = new Gun(4, 10, boat);

	portGun1.boatLocation = portGun2.boatLocation = "port";
	starboardGun1.boatLocation = starboardGun2.boatLocation = "starboard";
	portGun1.y = starboardGun1.y = -16;
	portGun2.y = starboardGun2.y = 21;
	portGun1.x = portGun2.x = -20;
	starboardGun1.x = starboardGun2.x = 22;
	portGun1.rotation = -80
	portGun2.rotation = -95;
	starboardGun1.rotation = 80
	starboardGun2.rotation = 95;

	boat.addGun(portGun1);
	boat.addGun(portGun2);
	boat.addGun(starboardGun1);
	boat.addGun(starboardGun2);

	var proximityCheck = setInterval(checkProximity, 100);

	function checkProximity() {
		telltail.rotation = (Game.world.weather.wind.direction - boat.heading)+180;
		if (_fireAtWill) {
			for (var ship in Game.world.ships) {
				var target = Game.world.ships[ship];
				if (target != boat) {
					var targetProximity = Utils.distanceBetweenTwoPoints(boat, target);
					if (targetProximity < 500) {
						attemptToFireOn(target)
					}
				}
			}
		}
	}

	function attemptToFireOn(target) {
		for (var gun in boat.guns) {
			var cannon = boat.guns[gun];
			if (cannon.isInRange(target)) {
				cannon.shoot();
			}
		}
	}

	Game.addEventListener('onKeyDown', function(event) {
		switch(event.key) {
			case 37: // Left arrow
				boat.turnLeft();
				break;
			case 39: // Right arrow
				boat.turnRight();
				break;
			case 38: // Up arrow
				boat.increaseSpeed();
				break;
			case 40: // Down arrow
				boat.decreaseSpeed();
				break;
			case 32: // Space
				boat.fireGuns("all");
			case 81: // Q
				boat.fireGuns("port");
				break;
			case 87: // W
				boat.fireGuns("bow");
				break;
			case 69: // E
				boat.fireGuns("starboard");
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

	boat.startRepairs = function() {
		var repairInterval = setInterval(function(){
			if (boat.health < boat.life) {
				boat.repair(2);
			} else {
				clearInterval(repairInterval);
			}
		}, 1000);
	}

	boat.fireGuns = function(location) {
		var gunsFired = [];
		for (var gun in boat.guns) {
			var cannon = boat.guns[gun];
			if (location === "all" || cannon.boatLocation === location) {
				gunsFired.push(cannon);
				setTimeout(cannon.shoot, Utils.getRandomInt(50,200));
			}
		}
		var reload = 0;
		for (var gun in gunsFired) {
			if (gunsFired[gun].reloadTime > reload) {
				reload = gunsFired[gun].reloadTime;
			}
			
		}
		boat.dispatchEvent('gunsfired', {
			location: location,
			reloadTime: reload
		});
	}

	boat.toggleFireMode = function() {
		_fireAtWill = !_fireAtWill;
		document.getElementById('fireMode').innerHTML = (_fireAtWill) ? "Hold Fire":"Fire At Will";
		return _fireAtWill;
	}

	return boat;
}
var AIBoat = function() {
	var boat = new Boat();
	var _mode = 'wander';
	var _enemies = [];
	var _currentTarget = false;

	var moveInterval = setInterval(moveBoat, 2000); //Adjust movement every 2 seconds
	var lookInterval = setInterval(checkSurroundings, 100); //React 10 times every second

	function moveBoat() {

		if (_currentTarget) {
			if (_mode === 'combat') {
				var attackPosition = getAttackPosition(_currentTarget);
				sailToDestination(attackPosition);
			} else if (_mode === 'evade') {
				var evadeHeading = Utils.getRandomInt(_currentTarget.heading-90, _currentTarget.heading+90)
				sailToDestination(Utils.convertToHeading(evadeHeading));
			}
		} else if (_mode === 'wander') {
			wander();
		}
		
		/*
		// Check player proximity
		var distanceFromPlayer = Utils.distanceBetweenTwoPoints(boat, Game.world.playerBoat);
		if (distanceFromPlayer < 500) {
			boat.attack(Game.world.playerBoat);
		}
		*/
	}

	function checkSurroundings() {
		if (_currentTarget) {
			for (var gun in boat.guns) {
				var cannon = boat.guns[gun];
				if (cannon.isInRange(_currentTarget)) {
					cannon.shoot();
				}
			}
		} 
	}

	function checkStatus() {
		if ((boat.life/boat.health) < 0.2 && _mode != 'evade' && _currentTarget) {
			console.log('evade target');
			evadeTarget(_currentTarget);
		}
	}

	function sailToDestination(location) {
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

	function wander() {
		if (!_currentTarget) {
			var duration = Utils.getRandomInt(30,120)/2;// halving turns the duration to seconds
			_currentTarget = duration;
			var randomHeading = Utils.getRandomInt(1,360);
			sailToDestination(randomHeading);
		} else {
			_currentTarget--;
			if (_currentTarget <= 0) {
				_currentTarget = false;
			}
		}
	}

	function getAttackPosition(enemy) {
		var leadAmount = 120;
		var attackPositions = {
			left: enemy.localToLocal(-leadAmount, -leadAmount, boat.parent),
			right: enemy.localToLocal(leadAmount, -leadAmount, boat.parent)
		}

		var distanceFromLeft = Utils.distanceBetweenTwoPoints(attackPositions.left, {x:boat.x,y:boat.y});
		var distanceFromRight = Utils.distanceBetweenTwoPoints(attackPositions.right, {x:boat.x,y:boat.y});
		
		if (distanceFromRight > distanceFromLeft) {
			return attackPositions.left;
		} else {				
			return attackPositions.right;
		}
	}

	function getEvadePosition(enemy) {
		var runAmount = 2000;

	}

	function clearChecks() {
		clearInterval(moveInterval);
		clearInterval(lookInterval);
		boat.removeEventListener('damaged', checkStatus);
		boat.removeEventListener('sunk', clearChecks);
	}

	function attackTarget(enemy) {
		_mode = 'combat';
		_currentTarget = enemy;
	}

	function evadeTarget(enemy) {
		_mode = 'evade';
		_currentTarget = enemy;
	}

	function removeEnemy(event) {
		var enemy = event.target;
		Utils.removeFromArray(_enemies, enemy);
		enemy.removeEventListener('sunk', removeEnemy);

		if (enemy === _currentTarget) {
			_currentTarget = false;
			if (_enemies.length > 0) {
				attackTarget(_enemies[0]);
			} else {
				_mode = 'wander';
			}
		}
	}

	boat.attack = function(enemy) {
		_enemies.push(enemy);
		enemy.addEventListener('sunk', removeEnemy);

		if (!_currentTarget) {
			attackTarget(enemy);
		}
	}

	boat.evade = function(enemy) {
		_mode = 'evade';
	}

	boat.addEventListener('damaged', checkStatus);
	boat.addEventListener('sunk', clearChecks);

	return boat;
}
var Pirate = function() {
	var boat = new AIBoat();
	
	var LENGTH = 125;
	var mainSail = new ForeAft(LENGTH*.5, {x:0,y:30});

	var mainGun = new Gun(8, 32, boat);

	mainSail.y = -30;
	mainGun.x = -8;
	mainGun.y = -25;

	boat.addSail(mainSail);
	boat.setSailColor('#444');
	
	boat.addGun(mainGun);

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
	sail.speed = 2.2;
	sail.sailColor = '#ded5be';
	sail.lineColor = '#2a2824';

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
	sail.speed = 2.5;

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
	// turn rates are degrees per second
	var helm = {};

	var _acceleration = 30;//frames it takes to get to full turn speed
	var _momentum = 0;
	var _direction = null;

	function increaseTurnRate() {
		_momentum++;
		if (_momentum > _acceleration) {
			_momentum = _acceleration;
		}
	}

	function decreaseTurnRate() {
		_momentum--;
		if (_momentum < -_acceleration) {
			_momentum = -_acceleration;
		}
	}

	helm.turnLeft = function() {
		_direction = "left";
	}

	helm.turnRight = function() {
		_direction = "right";
	}

	helm.stopTurning = function() {
		_direction = false;
	}

	helm.__defineGetter__('turnAmount', function(){
		// Assumes getter is getting called by a tick method
		if (_direction == "left" || (!_direction && _momentum > 0)) {
			decreaseTurnRate();
		}
		if (_direction == "right" || (!_direction && _momentum < 0)) {
			increaseTurnRate();
		}
		return _momentum/_acceleration;
	});

	return helm;
}


var TellTail = function(length, color) {
	length = length || 10;
	color = color || '#FF0000'
	
	var waveVariation = 3;
	var waveAmount = 0;
	var direction = 'forward'
	
	var tail = new createjs.Shape();
	var gfx = tail.graphics;

	function updateTail() {
		if (waveAmount >= waveVariation) {
			direction = 'reverse';
		} else if (waveAmount <= -waveVariation) {
			direction = 'forward';
		}

		if (direction === 'reverse') {
			waveAmount--;
		} else {
			waveAmount++;
		}

		var waveFactor = waveAmount;
		gfx.clear();
		gfx.beginStroke(color);
		gfx.setStrokeStyle(2, 1);
		gfx.moveTo(0,0);
		//gfx.lineTo(0, length);
		gfx.bezierCurveTo(waveFactor, length/2, -waveFactor, length/2, -waveFactor/2, length);
		gfx.endStroke();
	}

	createjs.Ticker.addEventListener('tick', updateTail);
	return tail;
}
var Gun = function(caliber, length, owner) {
	var maximumInaccuracy = 5; //degrees
	var gun = new createjs.Container();
	var cannon = new createjs.Shape();

	gun.addChild(cannon);

	var reloadTime = (caliber*1000)+(length*100);
	var loaded = true;

	var width = caliber;
	var length = length || caliber*3;

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
		cannon.y += caliber;

		// Roll back when reloaded
		createjs.Tween.get(cannon, {override:true})
			.wait(reloadTime-1000)
			.to({y:0}, 1000, createjs.Ease.sineOut)
	}

	function fire() {
		var angle = Utils.convertToHeading(owner.rotation+gun.rotation)
		//var accuracy = (caliber/length)*maximumInaccuracy;
		createjs.Sound.play("cannon");

		var ball = new Projectile(caliber*.75,angle, owner);
		var pos = gun.localToLocal(0,-length,owner.parent);
		ball.x = pos.x;
		ball.y = pos.y;
		owner.parent.addChildAt(ball, 2);

		for (var i = 0; i < caliber; i++) {
			var smoke = new Particles.Smoke(60);
			smoke.x = pos.x;
			smoke.y = pos.y;
			smoke.rotation = owner.rotation+gun.rotation-30;
			var momentum = Utils.getAxisSpeed(owner.heading,owner.speed);
			smoke.animate(momentum);
			owner.parent.addChild(smoke);
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
		var targetHeading = Utils.getRelativeHeading(gun.localToLocal(0,0,owner.parent), target);
		var rangeThreshold = 10;
		var headingDifference = Utils.headingDifference(gunHeading, targetHeading);
		return (Math.abs(headingDifference) <= rangeThreshold);
	}

	gun.__defineGetter__('reloadTime', function() {
		return reloadTime;
	});

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

	function removeProjectile() {
		createjs.Ticker.removeEventListener("tick", update);
		cannonBall.parent.removeChild(cannonBall);
	}

	function checkForHit() {
		for (var ship in Game.world.ships) {
			var boat = Game.world.ships[ship]
			if (boat != owner) {
				var globalPos = cannonBall.localToGlobal(0,0);
				var local = boat.globalToLocal(globalPos.x, globalPos.y);
				var hit = boat.hitTest(local.x, local.y);
				if (hit) {
					boat.cannonHit(size+velocity, local);
					removeProjectile();
					return;
				}
			}
		};
	}

	function miss() {
		for (var i = 0; i < 30; i++) {
			var bubble = new Particles.Bubble();
			bubble.x = cannonBall.x;
			bubble.y = cannonBall.y;
			cannonBall.parent.addChild(bubble);
			bubble.animate();
		};
		removeProjectile();
	}

	function update() {
		range--;
		if (range > 0) {
			cannonBall.x += Math.sin(angle*Math.PI/180)*velocity+boatXSpeed;
			cannonBall.y -= Math.cos(angle*Math.PI/180)*velocity-boatYSpeed;
			checkForHit();
		} else {
			miss();
		}
	}

	createjs.Ticker.addEventListener("tick", update);
	return cannonBall;
}
var Place = function() {
	var place = new createjs.Container();
	place.type = "stationary";
	return place;
}
var Island = function() {
	var island = new Place();
	var top = new createjs.Bitmap("images/island.png");
	var bottom = new createjs.Bitmap("images/island_bottom.png")
	island.addChild(bottom, top);

	island.__defineGetter__('hitBox', function(){
		return top;
	});

	return island;
}


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
		stage.snapToPixelEnabled = true;

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
			{src:"images/tide_top.png", id:"tide_top"},
			{src:"images/tide_mid.png", id:"tide_mid"},
			{src:"images/tide_bot.png", id:"tide_bot"}
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
			stage.canvas.width = window.innerWidth;
			stage.canvas.height = window.innerHeight;
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