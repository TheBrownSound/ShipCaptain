var Boat = (function() {
	var WIDTH = 112;
	var HEIGHT = 250;
	var boomDiameter = 10;
	var boomWidth = 300;

	var _momentum = 0;

	var boat = new createjs.Container();
	boat.regX = WIDTH/2;
	boat.regY = HEIGHT/2;

	var hull = new createjs.Bitmap('images/small_boat.png');

	var sail = new Sail(WIDTH*1.5, boomDiameter);
	sail.x = WIDTH/2;
	sail.y = 95;

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

	boat.getHeading = function() {
		return (boat.rotation+90) % 360;
	}

	return boat;
});