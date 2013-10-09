var PlayerBoat = function() {
	var boat = new Boat();
	boat.name = 'PlayerBoat';
	boat.setSailColor('#FFF');
	// GUN!
	var gun1 = new Gun(10, boat);

	gun1.y = 30;

	Game.addEventListener('onKeyDown', function(event) {
		switch(event.key) {
			case 37: // Left arrow
				boat.turnLeft();
				break;
			case 39: // Right arrow
				boat.turnRight();
				break;
			case 32: // Space
				gun1.shoot();
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

	boat.addChildAt(gun1, 1);

	return boat;
}