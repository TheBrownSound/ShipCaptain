var WindGauge = function() {
	var gauge = new createjs.Container();
	gauge.width = gauge.height = 100;

	var windCircle = new createjs.Bitmap("images/windgauge.png");
	var compass = new createjs.Bitmap("images/compass.png");
	var needle = new createjs.Bitmap("images/needle.png");

	windCircle.regX = compass.regX = needle.regX = gauge.width/2;
	windCircle.regY = compass.regY = needle.regY = gauge.height/2;

	gauge.addChild(windCircle, compass, needle);

	function updateGauge() {
		windCircle.rotation = Game.world.weather.wind.direction;
		needle.rotation = Game.world.playerBoat.heading;
	}

	createjs.Ticker.addEventListener('tick', updateGauge);
	return gauge;
}

var HealthMeter = function(boat) {
	var meter = new createjs.Container();
	meter.width = 20;
	meter.height = 100;

	var bg = new createjs.Shape();
	bg.graphics.beginFill('#333');
	bg.graphics.rect(0,0,meter.width,meter.height);
	bg.graphics.endFill();

	var bar = new createjs.Shape();
	bar.graphics.beginFill('#F00');
	bar.graphics.rect(2,2,meter.width-4,meter.height-4);
	bar.graphics.endFill();
	bar.y = bar.regY = meter.height-4;

	meter.addChild(bg,bar);

	boat.addEventListener('healthChanged', function(amount) {
		bar.scaleY = boat.health/boat.life;
	});

	return meter;
}

var SpeedMeter = function(boat) {
	var meter = new createjs.Container();
	meter.width = 20;
	meter.height = 100;

	var bg = new createjs.Shape();
	bg.graphics.beginFill('#333');
	bg.graphics.rect(0,0,meter.width,meter.height);
	bg.graphics.endFill();

	var bar = new createjs.Shape();
	bar.graphics.beginFill('#BADA55');
	bar.graphics.rect(2,2,meter.width-4,meter.height-4);
	bar.graphics.endFill();
	bar.y = bar.regY = meter.height-4;

	var speed = new createjs.Shape();
	speed.graphics.beginFill('#BAD');
	speed.graphics.rect(2,2,meter.width-4,meter.height-4);
	speed.graphics.endFill();
	speed.y = speed.regY = meter.height-4;

	meter.addChild(bg,bar,speed);

	function updateSpeed() {
		bar.scaleY = boat.potentialSpeed/boat.topSpeed;
		speed.scaleY = boat.speed/boat.topSpeed;
	}

	createjs.Ticker.addEventListener('tick', updateSpeed);
	return meter;
}

var ShootButton = function(type) {
	var _width = 60;
	var _height = 60;
	var btn = new createjs.Container();

	var overlay = new createjs.Bitmap('images/cannon_button.png');
	overlay.x = overlay.y = overlay.regX = overlay.regY = 30;
	if (type == 'port') {
		overlay.rotation = -90;
	} else if (type == 'starboard') {
		overlay.rotation = 90;
	}

	var background = new createjs.Shape();

	background.graphics.beginFill('#604535');
	background.graphics.drawRect(6,6,48,48);
	background.graphics.endFill();

	var reloadMeter = new createjs.Shape();
	reloadMeter.x = 6;
	reloadMeter.y = 54;
	reloadMeter.regY = 48;
	reloadMeter.graphics.beginFill('#F00');
	reloadMeter.graphics.drawRect(0,0,48,48);
	reloadMeter.graphics.endFill();
	reloadMeter.alpha = .5;

	btn.addChild(background, reloadMeter, overlay);

	btn.__defineGetter__('width', function() {
		return _width;
	});

	btn.__defineGetter__('height', function() {
		return _height;
	});

	Game.world.playerBoat.addEventListener('gunsfired', function(event) {
		if (event.target.location == 'all' || event.target.location == type) {
			console.log('rawr', event, type);
			reloadMeter.scaleY = 0;
			
			createjs.Tween.get(reloadMeter,{loop:false})
				.to({
					scaleY: 1
				},event.target.reloadTime,createjs.Ease.linear);
		}
	});

	btn.addEventListener("click", handleClick);
	function handleClick(event) {
		event.nativeEvent.stopImmediatePropagation();
		console.log('event', event);
		Game.world.playerBoat.fireGuns(type);
	}
	return btn;
}