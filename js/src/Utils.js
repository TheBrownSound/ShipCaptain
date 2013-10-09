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
		var angle = (headingTwo - headingOne)%360;
		if (angle > 180) {
			angle = angle - 360;
		}
		return angle;
	}

	utils.oldHeadingDifference = function(headingOne, headingTwo) {
		var angle = Math.abs((headingTwo - headingOne))%360;
		if (angle > 180) {
			angle = 360 - angle;
		}
		return angle;
	}

	utils.getRelativeHeading = function(currentPosition, target) {
		var xDiff = target.x - currentPosition.x;
		var yDiff = currentPosition.y - target.y;
		var heading = Math.round(Math.atan2(xDiff, yDiff) * (180 / Math.PI));
		return this.convertToHeading(heading);
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

	utils.yesNo = function() {
		return (this.getRandomInt(0,1) == 1) ? true:false;
	}

	utils.getDebugMarker = function(){
		var marker = new createjs.Shape();
		marker.graphics.beginFill('#F00');
		marker.graphics.drawCircle(0,0,10);
		marker.graphics.endFill();
		return marker;
	}

	utils.removeFromArray = function(array, item) {
		var itemIndex = array.indexOf(item);
		if (itemIndex >= 0) {
			array.splice(item, 1);
			return true;
		}
		return false;
	}

	return utils;
}();