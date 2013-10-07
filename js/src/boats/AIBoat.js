var AIBoat = function() {
	var boat = new Boat();
	var destination = 0;

	function sailToDestination() {
		switch(typeof(destination)) {
			case 'number':
				turnToHeading(destination);
				break;
			case 'object':
				
				break;
		}
	}

	function turnToHeading(heading) {
		var turnAmount = (heading - boat.heading)%360
		if(turnAmount > 180) {
			turnAmount = turnAmount - 360;
		}
		var turnSpeed = Math.abs(turnAmount)*10;
		createjs.Tween.get(boat, {override:true})
			.to({rotation:boat.rotation+turnAmount}, turnSpeed, createjs.Ease.sineOut)

	}

	boat.attack = function(enemy) {

	}

	boat.evade = function(enemy) {
		
	}

	boat.navigateTo = function(point) {

	}

	boat.wander = function(heading) {
		destination = heading;
		sailToDestination();
	}

	return boat;
}