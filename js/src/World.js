// Main world class
var World = function(){

	var world = new createjs.Container();
	world.name = 'world';

	var map = world.map = new createjs.Container();
	var ocean = world.ocean = new Ocean(500,500);
	var weather = world.weather = new Weather();
	var playerBoat = world.playerBoat = new PlayerBoat();

	var enemy = world.enemy = new AIBoat();
	enemy.attack(playerBoat);

	var island = new createjs.Bitmap("images/island.png");
	island.y = -2000;

	var mapCenter = new createjs.Shape();
	mapCenter.graphics.beginFill('#F00');
	mapCenter.graphics.drawCircle(-5,-5,20);
	mapCenter.graphics.endFill();

	map.addChild(mapCenter, island, playerBoat, enemy);
	world.addChild(ocean, map);

	createjs.Ticker.addEventListener("tick", update);
	function update() {
		document.getElementById('heading').innerHTML = "Heading: "+Math.round(playerBoat.heading);
		document.getElementById('knots').innerHTML = "Knots: "+Math.round(playerBoat.speed);

		enemy.update();

		// Save boat position for velocity check
		var boatX = playerBoat.x;
		var boatY = playerBoat.y;

		// Update relative positions
		map.regX = playerBoat.x;
		map.regY = playerBoat.y;
		ocean.position.x = -playerBoat.x;
		ocean.position.y = -playerBoat.y;
		ocean.update();
		playerBoat.update();

		// Camera animation based on directional velocity
		var xSpeed = Math.round((boatX - playerBoat.x)*60);
		var ySpeed = Math.round((boatY - playerBoat.y)*60);
		createjs.Tween.get(map, {override:true})
			.to({x:xSpeed, y:ySpeed}, 1000, createjs.Ease.sineOut)
		createjs.Tween.get(ocean, {override:true})
			.to({x:xSpeed, y:ySpeed}, 1000, createjs.Ease.sineOut)
		
	}

	return world;
}