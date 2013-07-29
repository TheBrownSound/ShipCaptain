var Boat = (function() {
	var WIDTH = 426;
	var HEIGHT = 946;

	var boat = new createjs.Container();
	boat.regX = WIDTH/2;
	boat.regY = HEIGHT/2;

	var hull = new createjs.Bitmap('images/small_boat.png');

	var sail = new createjs.Bitmap('images/small_sail.png');
	sail.regX = 792/2;
	sail.regY = 145;
	sail.x = WIDTH/2;
	sail.y = 400;

	boat.addChild(hull);
	boat.addChild(sail);

	boat.moveSail = function(amount) {
		sail.rotation += amount;
		Game.update();
	}

	return boat;
});