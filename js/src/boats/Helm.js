var Helm = function(ship) {
	var MAX_AMOUNT = 100;
	var MIN_AMOUNT = 20;

	var helm = {};
	var _turning = false;
	var _amount = 0;

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
		_turning = true;
		_amount = -getTurnSpeed();
	}

	helm.turnRight = function() {
		_turning = true;
		_amount = getTurnSpeed();
	}

	helm.stopTurning = function() {
		_turning = false;
		_amount = 0;
	}

	helm.__defineGetter__('turnAmount', function(){
		return _amount/MAX_AMOUNT;
	});

	return helm;
}

