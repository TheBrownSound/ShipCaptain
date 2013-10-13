var PlayerBoat = function() {
	var boat = new Boat();
	boat.name = 'PlayerBoat';
	boat.setSailColor('#FFF');

	var _fireAtWill = false;

	var WIDTH = 56;
	var LENGTH = 125;
	
	// Sails
	var squareRig = new SquareRig(WIDTH*1.5, {x:-23,y:-10}, {x:23,y:-10});
	var mainSail = new ForeAft(LENGTH*.5, {x:0,y:30});
	squareRig.y = -35;
	mainSail.y = -30;
	boat.addSail(squareRig);
	boat.addSail(mainSail);

	// GUNS!
	var bowGun = new Gun(8, 30, boat);

	var portGun1 = new Gun(4, 10, boat);
	var portGun2 = new Gun(4, 10, boat);

	var starboardGun1 = new Gun(4, 10, boat);
	var starboardGun2 = new Gun(4, 10, boat);

	bowGun.boatLocation = "bow";
	portGun1.boatLocation = portGun2.boatLocation = "port";
	starboardGun1.boatLocation = starboardGun2.boatLocation = "starboard";
	bowGun.y = -38;
	portGun1.y = starboardGun1.y = 0;
	portGun2.y = starboardGun2.y = 20;
	portGun1.x = portGun2.x = -16;
	starboardGun1.x = starboardGun2.x = 16;
	portGun1.rotation = portGun2.rotation = -90;
	starboardGun1.rotation = starboardGun2.rotation = 90;

	boat.addGun(bowGun);
	boat.addGun(portGun1);
	boat.addGun(portGun2);
	boat.addGun(starboardGun1);
	boat.addGun(starboardGun2);

	var proximityCheck = setInterval(checkProximity, 100);

	function checkProximity() {
		if (_fireAtWill) {
			for (var ship in Game.world.ships) {
				var target = Game.world.ships[ship];
				if (target != boat) {
					var targetProximity = Utils.distanceBetweenTwoPoints(boat, target);
					if (targetProximity < 500) {
						attemptToFireOn(target)
					}
				}
			}
		}
	}

	function attemptToFireOn(target) {
		for (var gun in boat.guns) {
			var cannon = boat.guns[gun];
			if (cannon.isInRange(target)) {
				cannon.shoot();
			}
		}
	}

	Game.addEventListener('onKeyDown', function(event) {
		switch(event.key) {
			case 37: // Left arrow
				boat.turnLeft();
				break;
			case 39: // Right arrow
				boat.turnRight();
				break;
			case 38: // Up arrow
				boat.increaseSpeed();
				break;
			case 40: // Down arrow
				boat.decreaseSpeed();
				break;
			case 32: // Space
				boat.fireGuns("all");
			case 81: // Q
				boat.fireGuns("port");
				break;
			case 87: // W
				boat.fireGuns("bow");
				break;
			case 69: // E
				boat.fireGuns("starboard");
		}
	});

	Game.addEventListener('onKeyUp', function(event) {
		switch(event.key) {
			case 83: // S Key
				boat.toggleSails();
				break;
			case 37: // Right arrow
			case 39: // Left arrow
				boat.stopTurning();
				break;
		}
	});

	boat.startRepairs = function() {
		var repairInterval = setInterval(function(){
			if (boat.health < boat.life) {
				boat.repair(2);
			} else {
				clearInterval(repairInterval);
			}
		}, 1000);
	}

	boat.fireGuns = function(location) {
		for (var gun in boat.guns) {
			var cannon = boat.guns[gun];
			if (location === "all" || cannon.boatLocation === location) {
				setTimeout(cannon.shoot, Utils.getRandomInt(50,200));
			}
		}
	}

	boat.toggleFireMode = function() {
		_fireAtWill = !_fireAtWill;
		document.getElementById('fireMode').innerHTML = (_fireAtWill) ? "Hold Fire":"Fire At Will";
		return _fireAtWill;
	}

	return boat;
}