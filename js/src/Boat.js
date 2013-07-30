var Boat = (function() {
	var WIDTH = 220;
	var HEIGHT = 500;
	var boomDiameter = 16;
	var boomWidth = 300;

	var _momentum = 0;

	var boat = new createjs.Container();
	boat.regX = WIDTH/2;
	boat.regY = HEIGHT/2;

	var hull = new createjs.Bitmap('images/small_boat.png');

	var sail = new Sail(boomWidth, boomDiameter);
	sail.x = WIDTH/2;
	sail.y = 210;

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

	return boat;
});