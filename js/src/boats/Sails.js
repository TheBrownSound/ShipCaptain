var Sail = (function(windOffset, sailRange, noSail) {
	var _optimalAngle =  180;
	var _maxAngle = 50;
	var _power = 0;
	var trimAngle = 180-windOffset;
	var windToBoat = 0;

	var sail = new createjs.Container();
	sail.speed = 1.8;
	sail.sailColor = '#ded5be';
	sail.lineColor = '#231F20';

	function trimTo(angle) {
		var animate = createjs.Tween.get(sail, {override:true});
		animate.to({rotation:angle}, 2000, createjs.Ease.linear);
		animate.addEventListener("change", function(event){
			if (sail.changed) sail.changed(false);
		});
	}

	sail.trim = function(windHeading) {
		windToBoat = windHeading;
		//console.log('Trim for wind: ', windHeading);
		var nosail = (Math.abs(Utils.convertToNumber(windHeading)) > noSail);
		if (nosail || _power <= 0) { // in irons
			sail.angle = 0;
		} else {
			var offset = (windHeading > 180) ? trimAngle : -trimAngle;
			sail.angle = Utils.convertToNumber(windHeading+offset);
		}
	}

	sail.__defineSetter__('angle', function(desiredAngle){
		// console.log('set angle: ', desiredAngle);
		var actualAngle = desiredAngle;
		if (desiredAngle < -sailRange) {
			actualAngle = -sailRange;
		} else if (desiredAngle > sailRange) {
			actualAngle = sailRange;
		}
		trimTo(actualAngle);
	});

	sail.__defineGetter__('angle', function(){
		return sail.rotation;
	});

	sail.__defineGetter__('power', function(){
		return _power;
	});

	sail.__defineSetter__('power', function(perc){
		_power = perc;
		if (sail.powerChanged) sail.powerChanged();
	});

	sail.__defineGetter__('tack', function(){
		return (windToBoat > 180) ? 'port' : 'starboard';
	});

	sail.__defineSetter__('color', function(hex){
		sail.sailColor = hex;
		if (sail.changed) sail.changed(true);
	});

	return sail;
});

var SquareRig = function(length, anchor1, anchor2) {
	var sail = new Sail(180, 26, 90);
	sail.name = 'square';
	sail.speed = 2.0;

	var sheet_luff = 20;
	var yard_thickness = 4;

	var bunches = 5;
	var bunchSize = length/bunches;
	
	var sheet = new	createjs.Shape();
	var furl = new createjs.Shape();
	var yard = new createjs.Shape();

	var anchorPoint1 = new createjs.Shape();
	var anchorPoint2 = new createjs.Shape();

	anchorPoint1.x = -(length/2)+10;
	anchorPoint2.x = length/2-10;
	anchorPoint1.y = anchorPoint2.y = 0;

	// Draw Yard
	yard.graphics.beginFill('#382822');
	yard.graphics.drawRoundRect(-(length/2),-3, length, yard_thickness, yard_thickness/2);
	yard.graphics.endFill();
	
	// Draw Ties
	yard.graphics.beginFill(sail.lineColor);
	for (var i = 0; i < bunches-1; i++) {
		yard.graphics.drawRoundRect((-length/2+bunchSize)+(bunchSize*i), -(yard_thickness+2)/2, 2, yard_thickness+2, 2);
	};
	yard.graphics.endFill();

	sail.addChild(anchorPoint1, anchorPoint2, furl, sheet, yard);

	function drawSail() {
		console.log('getting drawn')
		var s = sheet.graphics;
		var f = furl.graphics;
		s.clear();
		f.clear();

		var luffAmount = -14;
		s.beginFill(sail.sailColor);
		s.moveTo(-(length/2), -2);
		s.curveTo(-(length*.4), luffAmount/2, -(length*.4), luffAmount);
		s.curveTo(0, luffAmount*2, length*.4, luffAmount);
		s.curveTo(length*.4, luffAmount/2, length/2, -2);
		s.curveTo(0,luffAmount, -(length/2), -2);
		s.endFill();

		f.beginFill(sail.sailColor);
		for (var i = 0; i < bunches; i++) {
			f.drawEllipse((-length/2)+(bunchSize*i),-bunchSize/4, bunchSize, bunchSize/2);
		};
		f.endFill();

		//sail.drawLines();
	}

	sail.drawLines = function() {
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

	sail.changed = function(fullRedraw) {
		if (fullRedraw) {
			drawSail();
		} else {
			sail.drawLines();
		}
	}

	sail.powerChanged = function() {
		if (sail.power <= 0) {
			createjs.Tween.get(furl, {override:true})
			.to({scaleY:1}, 400, createjs.Ease.linear)
			scaleY = 1;
		} else {
			createjs.Tween.get(furl, {override:true})
			.to({scaleY:0}, 400, createjs.Ease.linear)
		}
		createjs.Tween.get(sheet, {override:true})
			.to({scaleY:sail.power+.1}, 400, createjs.Ease.linear)
	}

	sheet.scaleY = 0;
	drawSail();
	return sail;
}

var ForeAft = function(length, anchorPoint) {
	var sail = new Sail(45, 45, 135);
	sail.name = 'fore-aft';

	var tack;
	var sheet = new	createjs.Shape();
	var furl = new	createjs.Shape();
	var boom = new createjs.Shape();

	var anchorLine = new createjs.Shape();
	anchorLine.y = length-10;

	boom.graphics.beginFill('#382822');
	boom.graphics.drawRoundRect(-3, 0, 4, length, 4);
	boom.graphics.endFill();

	sail.addChild(anchorLine, boom, furl, sheet);

	function drawLine() {
		var g = anchorLine.graphics;
		g.clear();
		g.setStrokeStyle('2').beginStroke(sail.lineColor);
		
		var anchor = sail.parent.localToLocal(anchorPoint.x,anchorPoint.y, anchorLine);

		g.moveTo(0,0);
		g.lineTo(anchor.x, anchor.y);
		g.endStroke();
	}

	function drawSail() {
		var s = sheet.graphics;
		var f = furl.graphics;
		s.clear();
		f.clear();

		s.beginFill(sail.sailColor);
		s.moveTo(0, 0);
		s.curveTo(-20, length*.7, 0, length);
		s.curveTo(-6, length/2, 0,0);
		s.endFill();

		var bunches = 4;
		var bunchSize = length/bunches;
		f.beginFill(sail.sailColor);
		for (var i = 0; i < bunches; i++) {
			f.drawEllipse(-bunchSize/4,bunchSize*i, bunchSize/2, bunchSize);
		};
		f.endFill();
		f.beginFill(sail.lineColor);
		for (var i = 0; i < bunches-1; i++) {
			f.drawRoundRect(-bunchSize/8,bunchSize*i+bunchSize-2, bunchSize/4, 2, 2);
		};
		f.endFill();

		sheet.scaleX = 0;
		
		//drawLine();
	}

	sail.changed = function(fullRedraw) {
		if (fullRedraw) {
			drawSail();
		} else {
			drawLine();
			if (tack != sail.tack) {
				tack = sail.tack;
				sail.powerChanged();
			}
		}
	}

	sail.powerChanged = function() {
		if (sail.power <= 0) {
			createjs.Tween.get(furl, {override:true})
			.to({scaleX:1}, 400, createjs.Ease.linear)
			scaleY = 1;
		} else {
			createjs.Tween.get(furl, {override:true})
			.to({scaleX:0}, 400, createjs.Ease.linear)
		}

		var scale = (sail.tack == 'port') ? sail.power : -sail.power;
		createjs.Tween.get(sheet, {override:true})
			.to({scaleX:scale}, 400, createjs.Ease.linear)
	}

	drawSail();
	return sail;
}