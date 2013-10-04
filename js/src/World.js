// Main world class
var World = function(){
	
	var bubbleTick = 0;

	var world = new createjs.Container();
	world.name = 'world';

	var map = world.map = new createjs.Container();
	var ocean = world.ocean = new Ocean(500,500);
	var weather = world.weather = new Weather();
	var playerBoat = world.playerBoat = new PlayerBoat();

	var island = new createjs.Bitmap("images/island.png");
	island.y = -2000;

	var mapCenter = new createjs.Shape();
	mapCenter.graphics.beginFill('#F00');
	mapCenter.graphics.drawCircle(-5,-5,20);
	mapCenter.graphics.endFill();

	map.addChild(mapCenter, island, playerBoat)
	world.addChild(ocean, map);

	createjs.Ticker.addEventListener("tick", update);
	function update() {
		var heading = playerBoat.getHeading();
		var speed = playerBoat.getSpeed();

		document.getElementById('heading').innerHTML = "Heading: "+Math.round(heading);
		document.getElementById('knots').innerHTML = "Knots: "+Math.round(speed);
		var knotConversion = speed*.3;
		var xPos = Math.sin(heading*Math.PI/180)*knotConversion;
		var yPos = Math.cos(heading*Math.PI/180)*knotConversion;

		var xSpeed = Math.round(xPos*60);
		var ySpeed = Math.round(yPos*60);
		//console.log('x-speed: ', xSpeed);
		//var ySpeed = Math.round(yPos*30);

		createjs.Tween.get(map, {override:true})
			.to({x:-xSpeed, y:ySpeed}, 1000, createjs.Ease.sineOut)
		createjs.Tween.get(ocean, {override:true})
			.to({x:-xSpeed, y:ySpeed}, 1000, createjs.Ease.sineOut)

		map.regX += xPos;
		map.regY -= yPos;
		playerBoat.x += xPos;
		playerBoat.y -= yPos;

		ocean.position.x -= xPos;
		ocean.position.y += yPos;

		bubbleTick += Math.round(speed);
		if (bubbleTick >= 7) {
			bubbleTick = 0;
			ocean.spawnBubble();
		}

		playerBoat.update();
		ocean.update();
	}

	return world;
}