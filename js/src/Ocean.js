// Main world class
// Acts as a model containing the majority of the info
// about the world as well the parent display object

var Ocean = function(){
	//Constants
	var TOP_THRESHOLD = 300;
	var FAR_FACTOR = 0.1;
	var MID_FACTOR = 0.3;
	var FOR_FACTOR = 1.8;
	
	var currentScale = 0;
	var scaleIncrements = [0.05,0.1,0.3,0.6,1];
	var constructionQueue = [];

	var sky;
	var farRange;
	var midRange;
	var mountain;
	var foreground;

	var _width = 0;
	var _height = 0;
	var _following = false;
	var _mouseDragOffset = false;

	var world = new createjs.Container();
	world.name = 'world';

	function buildMountains() {
		sky = new createjs.Bitmap("images/sky.png");
		sky.regX = 1000;

		world.mountain = new Mountain();
		mountain = world.mountain;
		mountain.scaleX = mountain.scaleY = scaleIncrements[currentScale];
		
		foreground = new createjs.Shape();
		foreground.graphics.beginBitmapFill(Game.images.foregroundImage, "repeat-x");
		foreground.graphics.drawRect(0,0,mountain.width*FOR_FACTOR,157);
		foreground.graphics.endFill();

		farRange = RangeBuilder.createRange({color:"#4481a4", peaks:180, variance:100});
		midRange = RangeBuilder.createRange({color:"#c9ebff", peaks:90, variance:120});

		world.addChild(sky);
		world.addChild(farRange);
		world.addChild(midRange);
		world.addChild(mountain);
		world.addChild(foreground);

		world.canvasSizeChanged(Game.stage.canvas.width, Game.stage.canvas.height);

		var startX = (_width-mountain.getWidth())/2;
		var startY = _height/3;
		moveMountain(startX, startY);
	};

	function mouseDownEvent(event) {
		if (_following) {
			_following = false;
		}

		if (constructionQueue.length > 0) {
			var building = constructionQueue[0];
			var hitBox = mountain.getHitBox();
			var pt = hitBox.globalToLocal(building.x, building.y);
	
			if (Game.stage.mouseInBounds && hitBox.hitTest(pt.x, pt.y)) {
				placeBuilding(constructionQueue.shift());
			} else {
				console.log("cannot place structure there!")
			}
		} else {
			_mouseDragOffset = {x:mountain.x-event.stageX, y:mountain.y-event.stageY};
		}
	};

	function mouseUpEvent(event) {
		_mouseDragOffset = false;
	}

	function mouseMoveEvent(event) {
		if (constructionQueue.length > 0) {
			constructionQueue[0].x = event.stageX;
			constructionQueue[0].y = event.stageY;
			Game.update();
		} else if (_mouseDragOffset) {
			var targetX = event.stageX+_mouseDragOffset.x;
			var targetY = event.stageY+_mouseDragOffset.y;
			moveMountain(targetX, targetY);
		}
	}

	function placeBuilding(building) {
		world.removeChild(building);
		var newStructCoords = mountain.globalToLocal(building.x, building.y);
		building.x = Math.round(newStructCoords.x);
		building.y = Math.round(newStructCoords.y);
		mountain.addBuilding(building);

		if (constructionQueue.length > 0) {
			world.addChild(constructionQueue[0]);
		}

		Game.update();
	}

	function moveMountain(targetX, targetY) {
		//console.log(targetX, targetY)
		targetX = Math.round(targetX);
		targetY = Math.round(targetY);
		var rightLimit = Math.floor(_width-mountain.getWidth());
		var topLimit = Math.floor(_height-mountain.getHeight());
		var bottomLimit = TOP_THRESHOLD;

		// Horizontal scroll restrictions
		if (targetX <= 0 && targetX >= rightLimit) {
			mountain.x = targetX;
		} else {
			mountain.x = (targetX < rightLimit) ? rightLimit : 0;
		}

		// Vertical scroll restrictions
		if (targetY >= topLimit && targetY <= bottomLimit) {
			mountain.y = targetY;
		} else {
			mountain.y = (targetY < topLimit) ? topLimit : bottomLimit;
		}

		// Paralax
		farRange.x = mountain.x*FAR_FACTOR;
		midRange.x = mountain.x*MID_FACTOR;
		farRange.y = mountain.y*FAR_FACTOR+100;
		midRange.y = mountain.y*MID_FACTOR+200;
		foreground.x = mountain.x*FOR_FACTOR;
		foreground.y = (mountain.y-topLimit)*FOR_FACTOR+Game.stage.canvas.height-157;

		document.getElementById('coords').innerHTML = ('x:'+mountain.x+' - y:'+mountain.y);
		world.dispatchEvent("moved");

		Game.update();
	};

	function changeScale(index) {
		if (index >= 0 && index < scaleIncrements.length) {
    		var focalPoint = mountain.globalToLocal(_width/2,_height/2);
			mountain.scaleX = mountain.scaleY = scaleIncrements[index];
			
			var scaledFocalPoint = {
				x: focalPoint.x*scaleIncrements[index],
				y: focalPoint.y*scaleIncrements[index]
			}
			moveMountain(_width/2 - scaledFocalPoint.x, _height/2 - scaledFocalPoint.y);

			currentScale = index;

			for (var i = 0; i < constructionQueue.length; i++) {
				constructionQueue[i].scaleX = constructionQueue[i].scaleY = scaleIncrements[currentScale];
			};

			world.dispatchEvent("scaled");
			Game.update();
		}
	};

	function checkMinScale() {
		var fitScale = _width/mountain.width;
		if (fitScale > scaleIncrements[0]) {
			scaleIncrements[0] = fitScale;
		}
	}

	function moveToFollowedRider() {
		var focalPoint = {
			x: _following.x*scaleIncrements[currentScale],
			y: _following.y*scaleIncrements[currentScale]
		}
		moveMountain(_width/2 - focalPoint.x, _height/2 - focalPoint.y);
	}

	function handleTick() {
		if (_following) {
			moveToFollowedRider();
		}
	}

	//Public
	world.buildWorld = function() {
		createjs.EventDispatcher.initialize(world);
		createjs.Ticker.addEventListener("tick", handleTick);
		world.addEventListener('mousedown', mouseDownEvent);
		Game.stage.addEventListener('stagemouseup', mouseUpEvent);
		Game.stage.addEventListener('stagemousemove', mouseMoveEvent);

		buildMountains();
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

	world.followRider = function(rider) {
		_following = rider;
	}

	world.buildBuilding = function(building) {
		console.log('[DEBUG] buildBuilding', building);
		building.scaleX = building.scaleY = scaleIncrements[currentScale];
		if (constructionQueue.length < 1) {
			world.addChild(building);
		}
		constructionQueue.push(building);
	}

	world.buildLift = function() {
		var lift = new Chairlift();
		world.buildBuilding(lift.entry);
		world.buildBuilding(lift.exit);
	}

	world.cancelBuilding = function() {
		if (constructionBuilding) {
			Game.stage.removeChild(constructionBuilding);
			constructionBuilding = null;
			Game.update();
		}
	}

	world.canvasSizeChanged = function(width,height) {
		_width = width;
		_height = height;
		sky.x = width/2;

		checkMinScale();
		changeScale(currentScale);
	}

	world.moveToPercentage = function (xPercent,yPercent) {
		var focalPoint = {
			x: Game.world.mountain.getWidth()*xPercent,
			y: Game.world.mountain.getHeight()*yPercent
		}
		moveMountain(_width/2 - focalPoint.x, _height/2 - focalPoint.y);
	}

	world.zoomIn = function() {
		changeScale(currentScale+1);
	}

	world.zoomOut = function() {
		changeScale(currentScale-1);
	}

	return world;
}