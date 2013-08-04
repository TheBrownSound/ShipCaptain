var Helm = function(turnSpeed) {
	var TURN_SPEED = turnSpeed || 10;
	var MAX_AMOUNT = 100;

	var helm = {};
	var _turning = false;
	var _amount = 0;

	helm.turnLeft = function() {
		_turning = true;
		if (_amount > -MAX_AMOUNT) {
			_amount -= TURN_SPEED;
		}
	}

	helm.turnRight = function() {
		_turning = true;
		if (_amount < MAX_AMOUNT) {
			_amount += TURN_SPEED;
		}
	}

	helm.stopTurning = function() {
		_turning = false;
	}

	helm.__defineGetter__('turnAmount', function(){
		return _amount/MAX_AMOUNT;
	});

	setInterval(function() {
		if (!_turning) {
			if (_amount > 0) {
				_amount -= TURN_SPEED;
			} else if (_amount < 0) {
				_amount += TURN_SPEED;
			}
		}
	}, 100);

	return helm;
}