var Sail = (function(width, height, sloop) {

	var sail = new createjs.Container();

	var potentialSailPower = 5;

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
		g.curveTo(-height/2, power*-20, width/2, -height/2);
		g.lineTo(-(width/2), -height/2);
		g.endFill();
	}

	sail.getPower = function() {
		var sailPower = (90-Math.abs(distanceFromOptimalAngle()))/90;
		var percentOfPower = (sailPower >= 0) ? sailPower : sailPower/8;
		var power = potentialSailPower*percentOfPower;
		drawSail(power);
		return power;
	}

	sail.addChild(sheet,boom);

	return sail;
});