var Boat = (function() {
	var WIDTH = 426;
	var HEIGHT = 946;

	var boat = new createjs.Container();

	var hull = new createjs.Bitmap('images/small_boat.png');


	boat.regX = WIDTH/2;
	boat.regY = HEIGHT/2;
	boat.scaleX = boat.scaleY = .5;

	boat.addChild(hull);

	return boat;
});