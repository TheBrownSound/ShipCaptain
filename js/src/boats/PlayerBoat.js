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
	var telltail = new TellTail(10);
	squareRig.y = -35;
	mainSail.y = -26;
	telltail.y = -30;
	boat.addSail(squareRig);
	boat.addSail(mainSail);
	boat.addChild(telltail);

	// GUNS!
	var portGun1 = new Gun(4, 10, boat);
	var portGun2 = new Gun(4, 10, boat);

	var starboardGun1 = new Gun(4, 10, boat);
	var starboardGun2 = new Gun(4, 10, boat);

	portGun1.boatLocation = portGun2.boatLocation = "port";
	starboardGun1.boatLocation = starboardGun2.boatLocation = "starboard";
	portGun1.y = starboardGun1.y = -16;
	portGun2.y = starboardGun2.y = 21;
	portGun1.x = portGun2.x = -20;
	starboardGun1.x = starboardGun2.x = 22;
	portGun1.rotation = -80
	portGun2.rotation = -95;
	starboardGun1.rotation = 80
	starboardGun2.rotation = 95;

	boat.addGun(portGun1);
	boat.addGun(portGun2);
	boat.addGun(starboardGun1);
	boat.addGun(starboardGun2);

	var proximityCheck = setInterval(checkProximity, 100);

	function checkProximity() {
		telltail.rotation = (Game.world.weather.wind.direction - boat.heading)+180;
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
		var gunsFired = [];
		for (var gun in boat.guns) {
			var cannon = boat.guns[gun];
			if (location === "all" || cannon.boatLocation === location) {
				gunsFired.push(cannon);
				setTimeout(cannon.shoot, Utils.getRandomInt(50,200));
			}
		}
		var reload = 0;
		for (var gun in gunsFired) {
			if (gunsFired[gun].reloadTime > reload) {
				reload = gunsFired[gun].reloadTime;
			}
			
		}
		boat.dispatchEvent('gunsfired', {
			location: location,
			reloadTime: reload
		});
	}

	boat.toggleFireMode = function() {
		_fireAtWill = !_fireAtWill;
		document.getElementById('fireMode').innerHTML = (_fireAtWill) ? "Hold Fire":"Fire At Will";
		return _fireAtWill;
	}

	return boat;
}