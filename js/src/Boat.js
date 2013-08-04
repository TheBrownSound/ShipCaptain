var Boat = (function() {
	var WIDTH = 112;
	var LENGTH = 250;
	var SPEED = 12;
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
	var sail = new Sail(WIDTH*1.5, boomDiameter);
	sail.x = WIDTH/2;
	sail.y = 95;

	var helm = new Helm();

	boat.addChild(hull, sail);

	boat.turnLeft = helm.turnLeft;
	boat.turnRight = helm.turnRight;

	function speedCalc() {
		var potentialSpeed = Math.round(sail.getPower()*SPEED)
		if (_speed != potentialSpeed) {
			if (_speed > potentialSpeed) {
				_speed -= .03;
			} if (_speed < potentialSpeed) {
				_speed += .03;
			}
		}
	}

	boat.stopTurning = function(){
		helm.stopTurning();
		boat.rotation = Math.round(boat.rotation);
	}

	boat.adjustTrim = function() {
		var windHeading = Game.world.weather.wind.direction;
		var boatHeading = boat.rotation;
		var headingOffset = windHeading - boatHeading;
		if (headingOffset < 0) headingOffset += 360;
		sail.trim(headingOffset);
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