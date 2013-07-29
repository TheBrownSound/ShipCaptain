// Parent Game Logic
var Game = (function(){
	var self = {};
	var _update = false;

	self.init = function(canvasId) {
		self.stage = new createjs.Stage(document.getElementById(canvasId));

		//Enable User Inputs
		createjs.Touch.enable(self.stage);
		self.stage.enableMouseOver(10);
		self.stage.mouseMoveOutside = false; // keep tracking the mouse even when it leaves the canvas
		self.stage.snapToPixelEnabled = true;
		
		var playerBoat = self.playerBoat = new Boat();
		playerBoat.x = self.stage.canvas.width/2;
		playerBoat.y = self.stage.canvas.height/2;

		playerBoat.scaleX = playerBoat.scaleY = .5;

		self.stage.addChild(playerBoat);
		
		//Ticker
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addListener(this);

		self.update();
	}

	self.canvasResized = function() {
		self.update();
	}

	self.escape = function() {

	}

	self.update = function() {
		_update = true;
	}

	self.tick = function() {
		// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
		if (_update) {
			_update = false; // only update once
			self.stage.update();
		}
		document.getElementById('fps').innerHTML = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
	}

	return self;
})();