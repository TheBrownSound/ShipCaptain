var Boat = (function() {
	var WIDTH = 56;
	var LENGTH = 125;
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
	hull.x = -(WIDTH/2);

	boat.sails = [];
	boat.guns = [];

	boat.addChild(hull);

	boat.turnLeft = helm.turnLeft;
	boat.turnRight = helm.turnRight;

	function speedCalc() {
		var topSpeed = 0;
		var potentialSpeed = 0;

		for (var i = 0; i < boat.sails.length; i++) {
			var sail = boat.sails[i];
			topSpeed += sail.speed;
			potentialSpeed += sail.power;
		};

		if (_health > 0) {
			var diminishingReturns = 1/Math.sqrt(boat.sails.length);
			potentialSpeed = (potentialSpeed/boat.sails.length)*(topSpeed*diminishingReturns);
			potentialSpeed = Math.round( potentialSpeed * 1000) / 1000; //Rounds to three decimals
		}
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

	boat.addSail = function(sail, position) {
		this.sails.push(sail);
		this.addChild(sail);
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
		var dmg = Math.round(damageAmount);
		boat.damage(dmg);
		for (var i = 0; i < dmg; i++) {
			var splinter = new Particles.Splinter();
			var pos = boat.localToLocal(location.x, location.y, boat.parent)
			splinter.x = pos.x;
			splinter.y = pos.y;
			boat.parent.addChildAt(splinter, 1);
			splinter.animate();
		};
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