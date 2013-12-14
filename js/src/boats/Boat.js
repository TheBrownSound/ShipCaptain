var Boat = (function() {
	var WIDTH = 56;
	var LENGTH = 125;
	var _agility = 1;
	
	// Movement Properties
	var _topSpeed = 0;
	var _speed = 0;
	var _limit = 0;

	var _heading = 0;
	var _bump = {x:0,y:0,rotation:0};
	
	// Health Properties
	var _life = 100;
	var _health = 100;

	var bubbleTick = 0;

	var boat = new createjs.Container();

	var dispatcher = createjs.EventDispatcher.initialize(boat);
	var updateInterval = setInterval(update, Math.floor(1000/60))

	var hull = boat.hull = new createjs.Bitmap('images/small_boat.png');
	var mast = boat.mast = new createjs.Bitmap('images/small_boat_mast.png');
	var till = boat.till = new createjs.Bitmap('images/rudder.png');
	var helm = new Helm(boat);
	hull.x = mast.x = -(WIDTH/2);
	hull.y = mast.y = -(LENGTH/2);
	till.y = 58;
	till.regX = 2;
	till.regY = 24;

	boat.sails = [];
	boat.guns = [];

	boat.addChild(hull, till, mast);

	boat.turnLeft = helm.turnLeft;
	boat.turnRight = helm.turnRight;

	function speedCalc() {
		var potentialSpeed = 0;
		/*
		for (var i = 0; i < boat.sails.length; i++) {
			var sail = boat.sails[i];
			potentialSpeed += sail.power;
		};
		*/

		if (_health > 0) {
			potentialSpeed = (_limit/10)*_topSpeed;
			potentialSpeed = Math.round( potentialSpeed * 1000) / 1000; //Rounds to three decimals
		}

		var potentialAxisSpeed = Utils.getAxisSpeed(boat.heading, potentialSpeed);

		potentialAxisSpeed.x = Math.abs(Math.round( potentialAxisSpeed.x * 1000) / 1000);
		potentialAxisSpeed.y = Math.abs(Math.round( potentialAxisSpeed.y * 1000) / 1000);

		if (_speed != potentialSpeed) {
			if (_speed > potentialSpeed) {
				_speed -= .005;
			} else if (_speed < potentialSpeed) {
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

	function updateSails() {
		boat.sails.map(function(sail){
			sail.power = _limit/10;
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
		
		clearInterval(updateInterval);
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
		_limit++;
		if (_limit > 10) {
			_limit = 10;
		}
		updateSails();
	}

	boat.decreaseSpeed = function() {
		_limit--;
		if (_limit <= 0) {
			_limit = 0;
		}
		updateSails();
	}

	
	boat.cannonHit = function(damageAmount, location) {
		createjs.Sound.play("hit").setVolume(0.5);
		createjs.Sound.play("small_explosion");
		var dmg = Math.round(damageAmount);
		for (var i = 0; i < dmg; i++) {
			var splinter = new Particles.Splinter();
			var pos = boat.hull.localToLocal(location.x, location.y, boat.parent)
			splinter.x = pos.x;
			splinter.y = pos.y;
			boat.parent.addChildAt(splinter, 1);
			splinter.animate();
		};
		boat.damage(dmg);
	}

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
		//_speed -= impactForce;
		if (_speed < 0 ) _speed = 0;

		_bump = {
			x: impactXForce*.5,
			y: impactYForce*.5,
			rotation: impactRoation*impactForce
		};

		if (impactForce > 1) {
			//console.log(impactForce);
			//boat.damage(impactForce);
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
		return _topSpeed;
	});

	boat.__defineGetter__('potentialSpeed', function(){
		return _topSpeed*(_limit/10);
	});

	boat.__defineGetter__('speed', function(){
		return _speed;
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

		if (_health > 0) {
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
		boat.x += axisSpeed.x//+_bump.x;
		boat.y += axisSpeed.y//+_bump.y;
		till.rotation = -(helm.turnAmount*20);
		boat.rotation += getCurrentAgility()*helm.turnAmount//+_bump.rotation;

		bumpDecay();

		boat.dispatchEvent('moved');
	}

	return boat;
});