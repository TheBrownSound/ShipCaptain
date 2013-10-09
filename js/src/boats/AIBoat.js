var AIBoat = function() {
	var boat = new Boat();

	var destination = 0;
	var boatInterval = 0;
	var shootInterval = 0;

	function sailToDestination(location) {
		destination = location;
		switch(typeof(location)) {
			case 'number': // Heading
				turnToHeading(location);
				break;
			case 'object':
				var heading = Utils.getRelativeHeading(boat, location);
				turnToHeading(heading);
				break;
		}
		boat.hoistSails();
	}

	function turnToHeading(heading) {
		var turnAmount = (heading - boat.heading)%360
		if(turnAmount > 180) {
			turnAmount = turnAmount - 360;
		}
		var turnSpeed = Math.abs(turnAmount)*50;
		createjs.Tween.get(boat, {override:true})
			.to({rotation:boat.rotation+turnAmount}, turnSpeed, createjs.Ease.sineOut)
	}

	boat.attack = function(enemy) {
		boatInterval = setInterval(function(){
			var leadAmount = 120;
			var attackPositions = {
				left: enemy.localToLocal(-leadAmount, 0, enemy.parent),
				right: enemy.localToLocal(leadAmount, 0, enemy.parent)
			}
			var distanceFromLeft = Utils.distanceBetweenTwoPoints(attackPositions.left, {x:boat.x,y:boat.y});
			var distanceFromRight = Utils.distanceBetweenTwoPoints(attackPositions.right, {x:boat.x,y:boat.y});
			
			if (distanceFromRight > distanceFromLeft) {
				sailToDestination(attackPositions.left);
			} else {				
				sailToDestination(attackPositions.right);
			}
			
		}, 2000);

		shootInterval = setInterval(function(){
			for (var gun in boat.guns) {
				var cannon = boat.guns[gun];
				if (cannon.isInRange(enemy)) {
					cannon.shoot();
				}
			}
		}, 100);
	}

	boat.evade = function(enemy) {
		
	}

	boat.navigateTo = function(point) {

	}

	boat.wander = function(heading) {
		sailToDestination(heading);
	}

	boat.addEventListener('sunk', function(){
		clearInterval(boatInterval);
		clearInterval(shootInterval);
	});

	return boat;
}