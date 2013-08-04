var Utils = function() {
	var utils = {};

	utils.headingToInt = function(heading) {
		if (heading > 180) {
			return heading-360;
		} else {
			return heading;
		}
	}

	utils.headingDifference = function(headingOne, headingTwo) {
		var angle = (Math.abs(headingOne - headingTwo))%360;
		if(angle > 180) {
			angle = 360 - angle;
		}
		return angle;
	}

	return utils;
}();