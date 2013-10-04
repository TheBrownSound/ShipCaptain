var PlayerBoat = function() {
	var boat = new Boat();

	Game.addEventListener('onKeyDown', function(event) {
		//console.log(event.key);
		switch(event.key) {
			case 37: // Left arrow
				boat.turnLeft();
				break;
			case 39: // Right arrow
				boat.turnRight();
				break;
		}
	});

	Game.addEventListener('onKeyUp', function(event) {
		switch(event.key) {
			case 83: // S Key
				boat.reefSails();
				break;
			case 87: // W Key
				boat.hoistSails();
				break;
			case 37: // Right arrow
			case 39: // Left arrow
				boat.stopTurning();
				break;
		}
	});

	return boat;
}