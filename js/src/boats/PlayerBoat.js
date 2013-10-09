var PlayerBoat = function() {
	var boat = new Boat();
	boat.name = 'PlayerBoat';
	boat.setSailColor('#FFF');

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
	var portGun = new Gun(6, boat);
	var starboardGun = new Gun(6, boat);
	portGun.y = starboardGun.y = 58;
	portGun.x = -14;
	starboardGun.x = 14;
	portGun.rotation = -90;
	starboardGun.rotation = 90;

	boat.addGun(portGun);
	boat.addGun(starboardGun);

	function shootGuns() {
		for (var gun in boat.guns) {
			var cannon = boat.guns[gun];
			for (var ship in Game.world.ships) {
				var target = Game.world.ships[ship];
				if (target != boat && cannon.isInRange(target)) {
					cannon.shoot();
				}
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
			case 32: // Space
				shootGuns();
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

	return boat;
}