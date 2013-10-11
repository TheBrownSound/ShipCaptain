// Top Down world class
var World = function(playerBoat){
	var world = new createjs.Container();
	world.name = 'world';
	world.ships = [];
	world.playerBoat = playerBoat;

	var map = world.map = new createjs.Container();
	var ocean = world.ocean = new Ocean(500,500);
	var weather = world.weather = new Weather();

	var island = new createjs.Bitmap("images/island.png");
	island.y = -2000;

	var mapCenter = new createjs.Shape();
	mapCenter.graphics.beginFill('#F00');
	mapCenter.graphics.drawCircle(-5,-5,20);
	mapCenter.graphics.endFill();

	map.addChild(mapCenter, island);
	world.addChild(ocean, map);

	addBoat(playerBoat);

	//Start playing water sound
	createjs.Sound.play("water", {loop:-1});

	function addBoat(boat) {
		if (world.ships.length < 5) {
			console.log('adding boat', boat);
			boat.addEventListener('sunk', function(){
				var boatIndex = world.ships.indexOf(boat);
				if (boatIndex >= 0) {
					world.ships.splice(boatIndex, 1);
				}
			})
			map.addChild(boat);
			world.ships.push(boat);
		}
	}

	function addPirate() {
		var pirate = new Pirate();
		var minDistance = 1000;

		var xAmount = Utils.getRandomInt(minDistance,3000)
		var xDistance = (Utils.getRandomInt(0,1)) ? -xAmount:xAmount;
		var yAmount = Utils.getRandomInt(minDistance,3000)
		var yDistance = (Utils.getRandomInt(0,1)) ? -yAmount:yAmount;

		pirate.x = xDistance+playerBoat.x;
		pirate.y = yDistance+playerBoat.y;
		if (playerBoat.health > 0) {
			pirate.attack(playerBoat);
		}
		addBoat(pirate);
	}

	function eventSpawner() {
		var spawnEvent = (Utils.getRandomInt(0,10) === 10);
		console.log('Spawn event: ', spawnEvent);
		if (spawnEvent) {
			addPirate();
		}
	}
	
	function update() {
		document.getElementById('heading').innerHTML = "Heading: "+Math.round(playerBoat.heading);
		document.getElementById('knots').innerHTML = "Knots: "+Math.round(playerBoat.knots);

		// Update relative positions
		map.regX = playerBoat.x;
		map.regY = playerBoat.y;
		ocean.position.x = -playerBoat.x;
		ocean.position.y = -playerBoat.y;
		ocean.update();

		// Camera animation based on directional velocity
		var xSpeed = Math.sin(playerBoat.heading*Math.PI/180)*-playerBoat.speed;
		var ySpeed = Math.cos(playerBoat.heading*Math.PI/180)*playerBoat.speed;
		createjs.Tween.get(map, {override:true})
			.to({x:xSpeed*100, y:ySpeed*100}, 1000, createjs.Ease.sineOut)
		createjs.Tween.get(ocean, {override:true})
			.to({x:xSpeed*100, y:ySpeed*100}, 1000, createjs.Ease.sineOut)
		
	}

	setInterval(function(){
		eventSpawner();
	}, 10000);

	Game.stage.onMouseDown = function(e) {
		var location = Game.world.playerBoat.globalToLocal(e.stageX,e.stageY);
		console.log(location);
	}

	world.addPirate = addPirate;

	createjs.Ticker.addEventListener("tick", update);
	return world;
}