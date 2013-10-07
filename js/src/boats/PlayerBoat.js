var PlayerBoat = function() {
	var boat = new Boat();
	var gun = new Gun(12, boat);
	//gun.rotation = 90;
	//gun.x = boat.width/2;
	gun.y = 30;

	Game.addEventListener('onKeyDown', function(event) {
		switch(event.key) {
			case 37: // Left arrow
				boat.turnLeft();
				break;
			case 39: // Right arrow
				boat.turnRight();
				break;
			case 32: // Space
				gun.shoot();
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

	boat.addChildAt(gun, 1);

	return boat;
}