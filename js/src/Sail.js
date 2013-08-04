var Sail = (function(width, height, sloop) {
	var _maxAngle = 60;
	var _desiredTrim = 0;

	var sail = new createjs.Container();
	var sheet = new	createjs.Shape();
	var boom = new createjs.Shape();

	boom.graphics.beginFill('#52352A');
	boom.graphics.drawRoundRect(-(width/2),-height, width, height, 4);
	boom.graphics.endFill();

	function distanceFromOptimalAngle() {
		var windDirection = Game.world.weather.wind.direction;
		var sailAngle = (sail.parent.rotation+sail.rotation)%360;
		var sailHeading = (sailAngle < 0) ? sailAngle+360:sailAngle;
		if (sailAngle - windDirection <= 180) {
			return sailAngle - windDirection;
		} else {
			return (windDirection+360) - sailAngle;
		}
	}

	function drawSail(power) {
		var angleOffset = distanceFromOptimalAngle*.1
		var g = sheet.graphics;
		g.clear();
		g.beginFill('#FFF');
		g.moveTo(-(width/2), -height/2);
		g.curveTo(-height/2, power*-100, width/2, -height/2);
		g.lineTo(-(width/2), -height/2);
		g.endFill();
	}

	sail.getPower = function() {
		var sailPower = (90-Math.abs(distanceFromOptimalAngle()))/90;
		var percentOfPower = (sailPower >= 0) ? sailPower : 0;
		drawSail(percentOfPower);
		return percentOfPower;
	}

	sail.trim = function(heading) {
		sail.angle = Utils.headingToInt(heading);
	}

	sail.__defineSetter__('angle', function(amount){
		var offLeft = Utils.headingDifference(360-_maxAngle, amount);
		var offRight = Utils.headingDifference(_maxAngle, amount);
		console.log(offLeft+" | "+offRight);
		if (sail.rotation != amount) {
			var sailAngle;
			if (Math.abs(amount) < _maxAngle) {
				sailAngle = amount;
			} else {
				if (offLeft < offRight) {
					sailAngle = -_maxAngle;
				} else {
					sailAngle = _maxAngle;
				}
			}
			createjs.Tween.get(sail, {override:true}).to({rotation:sailAngle}, 300, createjs.Ease.linear);
		}
		
	});

	sail.__defineGetter__('angle', function(){
		return sail.rotation;
	});

	sail.addChild(sheet,boom);

	return sail;
});