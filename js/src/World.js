// Main world class
// Acts as a model containing the majority of the info
// about the world as well the parent display object

var World = function(width, height){
	var _width = width;
	var _height = _height;

	var currentScale = 0;
	var scaleIncrements = [.5, 1]
	var world = new createjs.Container();
	world.name = 'world';

	var playerBoat = world.playerBoat = new Boat();
	playerBoat.scaleX = playerBoat.scaleY = scaleIncrements[currentScale];
	playerBoat.x = width/2;
	playerBoat.y = height/2;

	world.addChild(playerBoat);

	function changeScale(inc) {
		currentScale += inc;
		var nextScale = Math.abs(currentScale%scaleIncrements.length);
		playerBoat.scaleX = playerBoat.scaleY = scaleIncrements[nextScale];
		Game.update();
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
		playerBoat.x = width/2;
		playerBoat.y = height/2;
	}

	world.zoomIn = function() {
		changeScale(1);
	}

	world.zoomOut = function() {
		changeScale(-1);
	}

	return world;
}