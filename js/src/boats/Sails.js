var Sail = (function(windOffset, sailRange, noSail) {
	var _optimalAngle =  180;
	var _maxAngle = 50;
	var trimAngle = 180-windOffset;
	var _power = 0;
	var _reefed = true;

	var windToBoat = 0;

	var sail = new createjs.Container();
	sail.speed = 2.2;
	sail.sailColor = '#FFF';
	sail.lineColor = '#ded2b3';

	function updateSail() {
		//console.log('update sail');

		if (_reefed) {
			_power = Math.round( _power * 10) / 10;
			if (_power > 0) {
				_power -= 0.1;
			} else if (_power < 0) {
				_power += 0.1;
			}
		} else {
			var leeway = 10;
			var sailHeading = Utils.convertToHeading(sail.angle);

			// TODO revisit angle from wind logic, its confusing.
			var angleFromWind = Utils.oldHeadingDifference(windToBoat, sailHeading);
			if (angleFromWind > noSail+leeway) {
				_power = 0;
			} else {
				var distanceFromTrim = Math.abs(trimAngle-angleFromWind);
				var power = (noSail - distanceFromTrim)/noSail;
				_power = Math.round( power * 100) / 100; //Rounds to two decimals
			}
		}
		
		if (sail.drawSail) {
			sail.drawSail();
		} 
	}

	function trimTo(angle) {
		createjs.Tween.get(sail, {override:true})
			.to({rotation:angle}, 2000, createjs.Ease.linear);
	}

	sail.hoist = function() {
		_reefed = false;
	}

	sail.reef = function() {
		_reefed = true;
		trimTo(0);
	}

	sail.trim = function(windHeading) {
		if (!_reefed) {
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
	}

	sail.__defineSetter__('angle', function(desiredAngle){
		// console.log('set angle: ', desiredAngle);
		if (!_reefed) {
			var actualAngle = desiredAngle;
			if (desiredAngle < -sailRange) {
				actualAngle = -sailRange;
			} else if (desiredAngle > sailRange) {
				actualAngle = sailRange;
			}
			trimTo(actualAngle)
		}
	});

	sail.__defineGetter__('angle', function(){
		return sail.rotation;
	});

	sail.__defineGetter__('power', function(){
		return _power;
	});

	sail.__defineGetter__('reefed', function(){
		return _reefed;
	});

	sail.__defineGetter__('tack', function(){
		return (windToBoat > 180) ? 'port' : 'starboard';
	});

	sail.__defineSetter__('color', function(hex){
		sail.sailColor = hex;
	});

	createjs.Ticker.addEventListener('tick', updateSail);
	return sail;
});

var SquareRig = function(length, anchor1, anchor2) {
	var sail = new Sail(180, 26, 90);
	sail.name = 'square';
	sail.speed = 2.5;

	var sheet_luff = 20;
	var yard_thickness = 6;

	var bunches = 5;
	var bunchSize = length/bunches;
	
	var sheet = new	createjs.Shape();
	var yard = new createjs.Shape();
	var ties = new createjs.Shape();

	var anchorPoint1 = new createjs.Shape();
	var anchorPoint2 = new createjs.Shape();

	anchorPoint1.x = -(length/2)+10;
	anchorPoint2.x = length/2-10;
	anchorPoint1.y = anchorPoint2.y = 0;

	// Draw Yard
	yard.graphics.beginFill('#52352A');
	yard.graphics.drawRoundRect(-(length/2),-3, length, yard_thickness, yard_thickness/2);
	yard.graphics.endFill();
	
	// Draw Ties
	ties.graphics.beginFill(sail.lineColor);
	for (var i = 0; i < bunches-1; i++) {
		ties.graphics.drawRoundRect((-length/2+bunchSize)+(bunchSize*i), -(yard_thickness+2)/2, 2, yard_thickness+2, 2);
	};
	ties.graphics.endFill();

	sail.addChild(anchorPoint1, anchorPoint2, sheet, yard, ties);

	function drawLines() {
		var g1 = anchorPoint1.graphics;
		var g2 = anchorPoint2.graphics;
		g1.clear();
		g2.clear();
		g1.setStrokeStyle('2').beginStroke(sail.lineColor);
		g2.setStrokeStyle('2').beginStroke(sail.lineColor);
		
		var anchorOne = sail.parent.localToLocal(anchor1.x,anchor1.y, anchorPoint1);
		var anchorTwo = sail.parent.localToLocal(anchor2.x,anchor2.y, anchorPoint2);

		g1.moveTo(0,0);
		g2.moveTo(0,0);
		g1.lineTo(anchorOne.x, anchorOne.y);
		g2.lineTo(anchorTwo.x, anchorTwo.y);
		g1.endStroke();
		g2.endStroke();
	}

	sail.drawSail = function() {
		var g = sheet.graphics;
		g.clear();
		if (this.reefed && this.power == 0) {
			g.beginFill(this.sailColor);
			for (var i = 0; i < bunches; i++) {
				g.drawEllipse((-length/2)+(bunchSize*i),-bunchSize/4, bunchSize, bunchSize/2);
			};
			g.endFill();
		} else {
			var luffAmount = -(sail.power*sheet_luff);
			g.beginFill(this.sailColor);
			g.moveTo(-(length/2), -2);
			g.curveTo(-(length*.4), luffAmount/2, -(length*.4), luffAmount);
			g.curveTo(0, luffAmount*2, length*.4, luffAmount);
			g.curveTo(length*.4, luffAmount/2, length/2, -2);
			g.curveTo(0,luffAmount, -(length/2), -2);
			g.endFill();
		}
		
		drawLines();
	}

	return sail;
}

var ForeAft = function(length, anchorPoint) {
	var sail = new Sail(45, 45, 135);
	sail.name = 'fore-aft';

	var sheet = new	createjs.Shape();
	var boom = new createjs.Shape();

	var anchorLine = new createjs.Shape();
	anchorLine.y = length-10;

	boom.graphics.beginFill('#52352A');
	boom.graphics.drawRoundRect(-3, 0, 6, length, 4);
	boom.graphics.endFill();

	sail.addChild(anchorLine, boom, sheet);

	function drawLine() {
		var g = anchorLine.graphics;
		g.clear();
		g.setStrokeStyle('2').beginStroke(sail.lineColor);
		
		var anchor = sail.parent.localToLocal(anchorPoint.x,anchorPoint.y, anchorLine);

		g.moveTo(0,0);
		g.lineTo(anchor.x, anchor.y);
		g.endStroke();
	}

	sail.drawSail = function() {
		var g = sheet.graphics;
		g.clear();
		if (this.reefed && this.power == 0) {
			var bunches = 4;
			var bunchSize = length/bunches;
			g.beginFill(this.sailColor);
			for (var i = 0; i < bunches; i++) {
				g.drawEllipse(-bunchSize/4,bunchSize*i, bunchSize/2, bunchSize);
			};
			g.endFill();
			g.beginFill(this.lineColor);
			for (var i = 0; i < bunches-1; i++) {
				g.drawRoundRect(-bunchSize/8,bunchSize*i+bunchSize-2, bunchSize/4, 2, 2);
			};
			g.endFill();
		} else {
			var power = (sail.tack == 'port') ? this.power : -this.power;
			g.beginFill(this.sailColor);
			g.moveTo(0, 0);
			g.curveTo(power*-40, length*.7, 0, length);
			g.curveTo(power*-10, length/2, 0,0);
			g.endFill();
		}
		
		drawLine();
	}

	return sail;
}