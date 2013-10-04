// Main world class
// Acts as a model containing the majority of the info
// about the world as well the parent display object

var World = function(width, height){
	var _width = width;
	var _height = _height;

	var currentScale = 1;
	var scaleIncrements = [.25, .5, 1];
	var bubbleTick = 0;

	var world = new createjs.Container();
	world.name = 'world';

	var ocean = world.ocean = new Ocean(width,height);
	var weather = world.weather = new Weather();

	var playerBoat = world.playerBoat = new Boat();
	playerBoat.scaleX = playerBoat.scaleY = ocean.scaleX = ocean.scaleY = scaleIncrements[currentScale];
	
	ocean.x = playerBoat.x = width/2;
	ocean.y = playerBoat.y = height/2;

	world.addChild(ocean, playerBoat);

	function changeScale(inc) {
		currentScale += inc;
		var nextScale = Math.abs(currentScale%scaleIncrements.length);
		createjs.Tween.get(playerBoat, {override:true})
			.to({scaleX:scaleIncrements[nextScale], scaleY:scaleIncrements[nextScale]}, 1000, createjs.Ease.sineOut)
		createjs.Tween.get(ocean, {override:true})
			.to({scaleX:scaleIncrements[nextScale], scaleY:scaleIncrements[nextScale]}, 1000, createjs.Ease.sineOut)
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
		var speed = playerBoat.getSpeed();

		document.getElementById('heading').innerHTML = "Heading: "+Math.round(heading);
		document.getElementById('knots').innerHTML = "Knots: "+Math.round(speed);
		var knotConversion = speed*.3;
		ocean.position.x -= Math.sin(heading*Math.PI/180)*knotConversion;
		ocean.position.y += Math.cos(heading*Math.PI/180)*knotConversion;

		bubbleTick += Math.round(speed);
		if (bubbleTick >= 7) {
			bubbleTick = 0;
			ocean.spawnBubble();
		}

		playerBoat.update();
		ocean.update();
	}

	return world;
}