var Boat = (function() {
	var WIDTH = 56;
	var LENGTH = 125;
	var SPEED = 10;
	var AGILITY = 1;

	var _turningLeft = false;
	var _turningRight = false;
	var _speed = 0;
	var _heading = 0;
	var _trim = 0;
	var _reefed = true;

	var oldWindHeading = 0;

	var boat = new createjs.Container();
	boat.regX = WIDTH/2;
	boat.regY = LENGTH/2;

	var hull = new createjs.Bitmap('images/small_boat.png');
	var helm = new Helm();
	var squareRig = new SquareRig(WIDTH*1.5, {x:10,y:LENGTH/2+20}, {x:WIDTH-10,y:LENGTH/2+20});
	var mainSail = new ForeAft(LENGTH*.5, {x:WIDTH/2,y:LENGTH-20});
	squareRig.x = WIDTH/2;
	mainSail.x = WIDTH/2;
	squareRig.y = 45;
	mainSail.y = 55;

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
				_speed += .05;
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
		_reefed = true;
		squareRig.reef();
		mainSail.reef();
	}

	boat.hoistSails = function() {
		_reefed = false;
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
		var windChange = oldWindHeading-Game.world.weather.wind.direction;
		if (turnAmount !== 0 || windChange !== 0) {
			console.log(windChange);
			oldWindHeading = Game.world.weather.wind.direction;
			if (turnAmount !== 0) {
				var newHeading = (boat.rotation+turnAmount)%360
				boat.rotation = (newHeading < 0) ? newHeading+360:newHeading;
			}
			
			if (!_reefed) {
				boat.adjustTrim();
			}
		}
	}

	return boat;
});