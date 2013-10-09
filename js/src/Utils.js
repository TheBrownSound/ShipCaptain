var Utils = function() {
	var utils = {};

	utils.convertToHeading = function(number) {
		var heading = number%360;
		return (heading < 0) ? heading+360:heading;
	}

	utils.convertToNumber = function(heading) {
		if (heading > 180) {
			return heading-360;
		} else {
			return heading;
		}
	}

	utils.getAxisSpeed = function(angle, speed) {
		return {
			x: Math.sin(angle*Math.PI/180)*speed,
			y: Math.cos(angle*Math.PI/180)*speed
		}
	}

	utils.headingDifference = function(headingOne, headingTwo) {
		var angle = (Math.abs(headingOne - headingTwo))%360;
		if(angle > 180) {
			angle = 360 - angle;
		}
		return angle;
	}

	utils.getRelativeHeading = function(currentPosition, target) {
		var xDiff = target.x - currentPosition.x;
		var yDiff = target.y - currentPosition.y;
		var heading = Math.round(Math.atan2(xDiff, -yDiff) * (180 / Math.PI));
		console.log('heading = ', heading);
		return Utils.convertToHeading(heading);
	}

	utils.distanceBetweenTwoPoints = function(point1, point2) {
		var xs = point2.x - point1.x;
		xs = xs * xs;
		var ys = point2.y - point1.y;
		ys = ys * ys;
		return Math.sqrt(xs + ys);
	}

	utils.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	utils.getRandomFloat = function(min, max) {
		return Math.random() * (max - min) + min;
	}

	utils.getDebugMarker = function(){
		var marker = new createjs.Shape();
		marker.graphics.beginFill('#F00');
		marker.graphics.drawCircle(0,0,10);
		marker.graphics.endFill();
		return marker;
	}

	return utils;
}();