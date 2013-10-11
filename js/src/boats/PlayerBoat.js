var PlayerBoat = function() {
	var boat = new Boat();
	boat.name = 'PlayerBoat';
	boat.setSailColor('#FFF');

	var _fireAtWill = false;

	var WIDTH = 56;
	var LENGTH = 125;
	
	// Sails
	var squareRig = new SquareRig(WIDTH*1.5, {x:-23,y:LENGTH*.6}, {x:23,y:LENGTH*.6});
	var mainSail = new ForeAft(LENGTH*.5, {x:0,y:LENGTH*.7});
	squareRig.y = 35;
	mainSail.y = 40;
	boat.addSail(squareRig);
	boat.addSail(mainSail);

	// GUNS!
	var portGun = new Gun(4, 10, boat);
	var starboardGun = new Gun(4, 10, boat);
	portGun.boatLocation = "port";
	starboardGun.boatLocation = "starboard";
	portGun.y = starboardGun.y = 58;
	portGun.x = -16;
	starboardGun.x = 16;
	portGun.rotation = -90;
	starboardGun.rotation = 90;

	boat.addGun(portGun);
	boat.addGun(starboardGun);

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
				boat.fireGuns("head");
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

	boat.fireGuns = function(location) {
		for (var gun in boat.guns) {
			var cannon = boat.guns[gun];
			if (location === "all" || cannon.boatLocation === location) {
				cannon.shoot();
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