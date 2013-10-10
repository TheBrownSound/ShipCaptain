var Helm = function(ship) {
	// turn rates are degrees per second
	var helm = {};

	var _acceleration = 30;//frames it takes to get to full turn speed
	var _momentum = 0;
	var _direction = null;

	function increaseTurnRate() {
		_momentum++;
		if (_momentum > _acceleration) {
			_momentum = _acceleration;
		}
	}

	function decreaseTurnRate() {
		_momentum--;
		if (_momentum < -_acceleration) {
			_momentum = -_acceleration;
		}
	}

	helm.turnLeft = function() {
		_direction = "left";
	}

	helm.turnRight = function() {
		_direction = "right";
	}

	helm.stopTurning = function() {
		_direction = false;
	}

	helm.__defineGetter__('turnAmount', function(){
		// Assumes getter is getting called by a tick method
		if (_direction == "left" || (!_direction && _momentum > 0)) {
			decreaseTurnRate();
		}
		if (_direction == "right" || (!_direction && _momentum < 0)) {
			increaseTurnRate();
		}
		return _momentum/_acceleration;
	});

	return helm;
}

