var Boat = (function() {
	var WIDTH = 56;
	var LENGTH = 125;
	var _agility = 1;
	
	// Movement Properties
	var _topSpeed = 0;
	var _speed = 0;
	var _xspeed = 0;
	var _yspeed = 0;
	var _limit = 10;
	var _heading = 0;
	
	var _furled = true;

	// Health Properties
	var _life = 100;
	var _health = 100;

	var bubbleTick = 0;

	var boat = new createjs.Container();
	//boat.regY = LENGTH/2;

	var dispatcher = createjs.EventDispatcher.initialize(boat);

	var hull = boat.hull = new createjs.Bitmap('images/small_boat.png');
	var helm = new Helm(boat);
	hull.x = -(WIDTH/2);
	hull.y = -(LENGTH/2);

	boat.sails = [];
	boat.guns = [];

	boat.addChild(hull);

	boat.turnLeft = helm.turnLeft;
	boat.turnRight = helm.turnRight;

	function speedCalc() {
		var potentialSpeed = 0;

		for (var i = 0; i < boat.sails.length; i++) {
			var sail = boat.sails[i];
			potentialSpeed += sail.power;
		};

		if (_life > 0) {
			potentialSpeed = (potentialSpeed/boat.sails.length)*_topSpeed;
			potentialSpeed = Math.round( potentialSpeed * 1000) / 1000; //Rounds to three decimals
		}

		var potentialAxisSpeed = Utils.getAxisSpeed(boat.heading, potentialSpeed);

		potentialAxisSpeed.x = Math.abs(Math.round( potentialAxisSpeed.x * 1000) / 1000);
		potentialAxisSpeed.y = Math.abs(Math.round( potentialAxisSpeed.y * 1000) / 1000);

		if (_xspeed != potentialAxisSpeed.x) {
			if (_xspeed > potentialAxisSpeed.x) {
				_xspeed -= .005;
			} if (_xspeed < potentialAxisSpeed.x) {
				_xspeed += .01;
			}
		}

		if (_yspeed != potentialAxisSpeed.y) {
			if (_yspeed > potentialAxisSpeed.y) {
				_yspeed -= .005;
			} if (_yspeed < potentialAxisSpeed.y) {
				_yspeed += .01;
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
		_topSpeed = topSpeed*diminishingReturns;
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

	var hitMarker = Utils.getDebugMarker();
	boat.addChild(hitMarker);

	var crashVelocity = {x:0,y:0};

	Game.getVelocityDifference = function(v1, v2) {
		// Ever tried 1.2 - 1.1 in the console... awesome js >.<
		var v1 = Math.round(v1 * 1000);
		var v2 = Math.round(v2 * 1000);
		var diff; 
		if ( (v1 > 0 && v2 > 0) || (v1 < 0 && v2 < 0)) {
			diff =  v1 - v2;
		} else if (v1 > v2) {
			diff =  v1 + v2;
		} else {
			diff = -(v1 + v2);
		}
		return diff / 1000;
	}

	boat.collision = function(ship, location) {
		var shipVelocity = Utils.getAxisSpeed(ship.heading, ship.speed);
		//var boatVelocity = Utils.getAxisSpeed(this.heading, this.speed);

		/*
		var crashVelocity = {
			x: Game.getVelocityDifference(boatVelocity.x, shipVelocity.x),
			y: Game.getVelocityDifference(boatVelocity.y, shipVelocity.y)
		};
		*/
		this.x += shipVelocity.x;
		this.y += shipVelocity.y;

		//_yspeed -= crashVelocity.y;

		//_speed -= Utils.getTotalSpeed(crashVelocity.x, crashVelocity.y);
		/*
		hitMarker.x = location.x;
		hitMarker.y = location.y;
		*/
	}

	boat.damage = function(amount) {
		if (_life > 0) {
			_life -= amount;
			if (_life <= 0) {
				_life = 0;
				sink();
			}
			boat.dispatchEvent('damaged', amount);
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
		return _topSpeed;
	});

	boat.__defineGetter__('potentialSpeed', function(){
		return Utils.getTotalSpeed(_xspeed,_yspeed);
	});

	boat.__defineGetter__('speed', function(){
		return boat.potentialSpeed*(_limit/10);
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
		boat.x += axisSpeed.x;//+crashVelocity.x;
		boat.y += axisSpeed.y;//+crashVelocity.y;
		boat.rotation += getCurrentAgility()*helm.turnAmount;

		boat.dispatchEvent('moved');
	}

	createjs.Ticker.addEventListener("tick", update);
	return boat;
});