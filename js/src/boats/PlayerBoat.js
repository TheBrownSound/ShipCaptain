var PlayerBoat = function() {
	var boat = new Boat();
	boat.setSailColor('#000');
	// GUNS!
	var gun1 = new Gun(6, boat);
	var gun2 = new Gun(6, boat);
	var gun3 = new Gun(6, boat);
	var gun4 = new Gun(6, boat);
	gun1.rotation = gun3.rotation = 90;
	gun2.rotation = gun4.rotation = -90;

	//gun.x = boat.width/2;
	gun1.y = gun2.y = 60;
	gun3.y = gun4.y = 100;

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
				gun2.shoot();
				gun3.shoot();
				gun4.shoot();
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
	boat.addChildAt(gun2, 1);
	boat.addChildAt(gun3, 1);
	boat.addChildAt(gun4, 1);

	return boat;
}