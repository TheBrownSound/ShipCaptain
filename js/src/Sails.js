var Sail = (function(windOffset, sailRange, noSail) {
	var _optimalAngle =  180;
	var _maxAngle = 50;
	var trimAngle = 180-windOffset;
	var _power = 0;
	var _reefed = true;

	var windToBoat = 0;

	var sail = new createjs.Container();

	function updateSail() {
		var sailHeading = Utils.convertToHeading(sail.angle);
		var angleFromWind = Utils.headingDifference(windToBoat, sailHeading);
		if (angleFromWind > noSail) {
			_power = 0;
		} else {
			var distanceFromTrim = Math.abs(trimAngle-angleFromWind);
			var power = (noSail - distanceFromTrim)/noSail;
			_power = power;
		}
		if (sail.drawSail) sail.drawSail();
	}

	sail.hoist = function() {
		_reefed = false;
	}

	sail.reef = function() {
		_reefed = true;
		sail.angle = 0;
	}

	sail.trim = function(windHeading) {
		windToBoat = windHeading;
		//console.log('Trim for wind: ', windHeading);
		var nosail = (Math.abs(Utils.convertToNumber(windHeading)) > noSail);
		if (nosail) { // in irons
			sail.angle = 0;
		} else {
			var offset = (windHeading > 180) ? trimAngle : -trimAngle;
			sail.angle = Utils.convertToNumber(windHeading+offset);
		}
	}

	sail.__defineSetter__('angle', function(desiredAngle){
		//console.log('set angle: ', desiredAngle);
		var actualAngle = desiredAngle;
		if (desiredAngle < -sailRange) {
			actualAngle = -sailRange;
		} else if (desiredAngle > sailRange) {
			actualAngle = sailRange;
		}
		createjs.Tween.get(sail, {override:true})
			.to({rotation:actualAngle}, 2000, createjs.Ease.linear)
			.addEventListener("change", updateSail);
	});

	sail.__defineGetter__('angle', function(){
		return sail.rotation;
	});

	sail.__defineGetter__('power', function(){
		return (_reefed) ? 0 : _power;
	});

	sail.__defineGetter__('tack', function(){
		return (windToBoat > 180) ? 'port' : 'starboard';
	});

	return sail;
});

var SquareRig = function(length) {
	var sail = new Sail(180, 26, 90);
	sail.name = 'square';
	
	var sheet = new	createjs.Shape();
	var yard = new createjs.Shape();

	var sheet_luff = 40;

	yard.graphics.beginFill('#52352A');
	yard.graphics.drawRoundRect(-(length/2),-10, length, 10, 4);
	yard.graphics.endFill();

	sail.drawSail = function() {
		var g = sheet.graphics;
		g.clear();
		g.beginFill('#FFF');
		if (sail.power > 0) {
			var luffAmount = -(sail.power*sheet_luff);
			g.moveTo(-(length/2), -5);
			g.curveTo(-(length*.4), luffAmount/2, -(length*.4), luffAmount);
			g.curveTo(0, luffAmount*2, length*.4, luffAmount);
			g.curveTo(length*.4, luffAmount/2, length/2, -5);
			g.lineTo(-(length/2), -5);
		}
		g.endFill();
	}

	sail.addChild(sheet,yard);

	return sail;
}

var ForeAft = function(length) {
	var sail = new Sail(45, 60, 135);
	sail.name = 'fore-aft';

	var sheet = new	createjs.Shape();
	var boom = new createjs.Shape();

	boom.graphics.beginFill('#52352A');
	boom.graphics.drawRoundRect(-5, 0, 10, length, 4);
	boom.graphics.endFill();

	sail.drawSail = function() {
		var g = sheet.graphics;
		g.clear();
		g.beginFill('#FFF');
		g.moveTo(0, 0);
		var power = (sail.tack == 'port') ? sail.power : -sail.power;
		g.curveTo(power*-50, length*.9, 0, length);
		g.lineTo(0,0);
		g.endFill();
	}

	sail.addChild(boom, sheet);

	return sail;
}