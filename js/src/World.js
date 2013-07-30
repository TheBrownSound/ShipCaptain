// Main world class
// Acts as a model containing the majority of the info
// about the world as well the parent display object

var World = function(width, height){
	var _width = width;
	var _height = _height;

	var currentScale = 0;
	var scaleIncrements = [.5, 1];

	var world = new createjs.Container();
	world.name = 'world';

	var ocean = new Ocean(width,height);
	//var weather = new Weather();

	var playerBoat = world.playerBoat = new Boat();
	playerBoat.scaleX = playerBoat.scaleY = ocean.scaleX = ocean.scaleY = scaleIncrements[currentScale];
	
	ocean.x = playerBoat.x = width/2;
	ocean.y = playerBoat.y = height/2;

	world.addChild(ocean, playerBoat);

	function changeScale(inc) {
		currentScale += inc;
		var nextScale = Math.abs(currentScale%scaleIncrements.length);
		playerBoat.scaleX = playerBoat.scaleY = ocean.scaleX = ocean.scaleY = scaleIncrements[nextScale];
	}

	world.getWidth = function() {
		return _width;
	}

	world.setWidth = function(val) {
		_width = val;
		return _width;
	}

	world.getHeight = function() {
		return _height;
	}

	world.setHeight = function(val) {
		_height = val;
		return _height;
	}

	world.canvasSizeChanged = function(width,height) {
		console.log(width, height);
		_width = width;
		_height = height;

		ocean.x = playerBoat.x = width/2;
		ocean.y = playerBoat.y = height/2;
	}

	world.zoomIn = function() {
		changeScale(1);
	}

	world.zoomOut = function() {
		changeScale(-1);
	}

	world.update = function() {
		var heading = playerBoat.getHeading();
		document.getElementById('heading').innerHTML = "Heading: "+heading;
		var speed = playerBoat.getSpeed();
		ocean.position.x -= Math.sin(heading*Math.PI/180)*speed;
		ocean.position.y += Math.cos(heading*Math.PI/180)*speed;
		ocean.spawnBubble();
		ocean.update();
	}

	return world;
}