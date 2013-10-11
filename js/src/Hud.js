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

	boat.addEventListener('damaged', function(damage) {
		bar.scaleY = boat.life/boat.health;
	});

	return meter;
}