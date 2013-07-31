var Boat = (function() {
	var WIDTH = 112;
	var LENGTH = 250;
	var boomDiameter = 10;
	var boomWidth = 300;

	var _momentum = 0;
	var _heading = 0;

	var boat = new createjs.Container();
	boat.regX = WIDTH/2;
	boat.regY = LENGTH/2;

	var hull = new createjs.Bitmap('images/small_boat.png');

	var sail = new Sail(WIDTH*1.5, boomDiameter);
	sail.x = WIDTH/2;
	sail.y = 95;

	boat.addChild(hull, sail);

	boat.adjustHeading = function(degree) {
		_heading += degree;
		createjs.Tween.get(boat,{loop:false, override:true})
			.to({rotation:_heading},1000,createjs.Ease.backOut)
	}

	boat.adjustSail = function(amount) {
		sail.rotation += amount;
	}

	boat.toggleSail = function() {

	}

	boat.getSpeed = function() {
		var power = 0;
		power += sail.getPower();
		return power;
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

	return boat;
});