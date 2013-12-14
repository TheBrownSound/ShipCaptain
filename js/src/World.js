// Top Down world class
var World = function(playerBoat){
	var _eventFrequency = 10000;

	var world = new createjs.Container();
	world.name = 'world';
	world.places = [];
	world.ships = [];
	world.playerBoat = playerBoat;

	var map = world.map = new createjs.Container();
	var ocean = world.ocean = new Ocean(500,500);
	var weather = world.weather = new Weather();

	var island = new Island();
	island.y = -200;

	var mapCenter = new createjs.Shape();
	mapCenter.graphics.beginFill('#F00');
	mapCenter.graphics.drawCircle(-5,-5,20);
	mapCenter.graphics.endFill();

	map.addChild(mapCenter);
	world.addChild(ocean, map);

	addBoat(playerBoat);
	addPlace(island);

	var eventTick = setInterval(eventSpawner, _eventFrequency);

	//Start playing water sound
	createjs.Sound.play("water", {loop:-1});

	function addBoat(boat) {
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

	function addPlace(obj) {
		map.addChildAt(obj, 0);
		world.places.push(obj);
	}

	function addPirate() {
		if (world.ships.length < 5) {
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
			return pirate;
		}
	}

	function eventSpawner() {
		var spawnEvent = (Utils.getRandomInt(0,5) === 0);
		console.log('Spawn event: ', spawnEvent);
		if (spawnEvent) {
			var location = getEventLocation();
			var boat = addPirate();
			if (boat) {
				boat.x = location.x;
				boat.y = location.y;
			}
		}
	}

	function getEventLocation() {
		var distance = 400;
		var speed = Utils.getAxisSpeed(playerBoat.heading, playerBoat.speed);
		return {
			x: playerBoat.x+(speed.x*distance),
			y: playerBoat.y+(speed.y*distance)
		}
	}

	function triggerCollision(boat, object, collisionRect) {
		var localPos = map.globalToLocal(collisionRect.x,collisionRect.y)
		collisionRect.x = localPos.x;
		collisionRect.y = localPos.y;

		var centerOfImpact = {
			x: collisionRect.x+(collisionRect.width/2),
			y: collisionRect.y+(collisionRect.height/2)
		}
		if (boat.x < centerOfImpact.x) {
			boat.x -= collisionRect.width;
		} else {
			boat.x += collisionRect.width;
		}

		if (boat.y < centerOfImpact.y) {
			boat.y -= collisionRect.height;
		} else {
			boat.y += collisionRect.height;
		}
		/*
		var hitMarker = new createjs.Shape();
		map.addChild(hitMarker);
		hitMarker.graphics.clear();
		hitMarker.graphics.beginFill('#F00');
		hitMarker.graphics.rect(collisionRect.x,collisionRect.y,collisionRect.width,collisionRect.height);
		hitMarker.graphics.endFill();
	*/
		//boat.collision(object, collisionRect);
	}
	
	function update() {
		document.getElementById('heading').innerHTML = "Heading: "+Math.round(playerBoat.heading);
		document.getElementById('knots').innerHTML = "Knots: "+Math.round(playerBoat.knots);

		// boat collision detection
		for (var ship in world.ships) {
			var boat = world.ships[ship];
			for (var otherShip in world.ships) {
				var otherBoat = world.ships[otherShip];
				if (boat != otherBoat) {
					var crashRect = ndgmr.checkPixelCollision(boat.hull,otherBoat.hull, 0, true);
					if (crashRect) {
						triggerCollision(boat, otherBoat, crashRect);
					}
				}
			}

			for (var place in world.places) {
				var object = world.places[place];
				var hitBox = ndgmr.checkPixelCollision(boat.hull,object.hitBox, 0.5, true);
				if (hitBox) {
					triggerCollision(boat, object, hitBox);
				}
			}
		}

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
			.to({x:xSpeed*50, y:ySpeed*50}, 1000, createjs.Ease.sineOut)
		createjs.Tween.get(ocean, {override:true})
			.to({x:xSpeed*50, y:ySpeed*50}, 1000, createjs.Ease.sineOut)
	}

	var testBoat = new Boat();
	testBoat.x = 300;
	testBoat.y = 300;

	addBoat(testBoat);

	var testRect = new createjs.Shape();
	map.addChild(testRect);

	Game.stage.addEventListener('stagemousedown', function(e) {
		var location = map.globalToLocal(e.stageX,e.stageY);
		console.log(location);
		
		//Spawn test pirate
		
		var pirate = addPirate();
		if (pirate) {
			pirate.x = location.x;
			pirate.y = location.y;
		}
		
		/*
		var hitRect = ndgmr.checkPixelCollision(playerBoat.hull,testBoat.hull, 0, true);
		
		var hitLocation = playerBoat.globalToLocal(hitRect.x,hitRect.y)
		console.log(hitRect);
		testRect.graphics.clear();
		testRect.graphics.beginFill('#fff');
		testRect.graphics.rect(hitLocation.x,hitLocation.y,hitRect.width,hitRect.height);
		testRect.graphics.endFill();

		if (hitRect) {
			playerBoat.collision({x:hitLocation.x,y:hitLocation.y});
		}
		*/
	});

	world.addPirate = addPirate;

	createjs.Ticker.addEventListener("tick", update);
	return world;
}