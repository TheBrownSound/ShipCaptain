var Helm = function(ship) {
	var MAX_AMOUNT = 100;
	var MIN_AMOUNT = 20;

	var helm = {};
	var _direction = null;

	function getTurnSpeed() {
		var turnAmount = Math.round(ship.speed*50);
		if (turnAmount < MAX_AMOUNT && turnAmount > MIN_AMOUNT) {
			return turnAmount
		} else if (turnAmount >= MAX_AMOUNT) {
			return MAX_AMOUNT;
		} else {
			return MIN_AMOUNT;
		}
	}

	helm.turnLeft = function() {
		_direction = "left";
	}

	helm.turnRight = function() {
		_direction = "right";
	}

	helm.stopTurning = function() {
		_direction = null;
	}

	helm.__defineGetter__('turnAmount', function(){
		switch(_direction) {
			case 'left':
				return -getTurnSpeed()/MAX_AMOUNT;
			case 'right':
				return getTurnSpeed()/MAX_AMOUNT;
			default: 
				return 0;
		}
	});

	return helm;
}

