var AIBoat = function() {
	var boat = new Boat();

	var destination = 0;

	function sailToDestination(location) {
		destination = location;
		switch(typeof(location)) {
			case 'number': // Heading
				turnToHeading(location);
				break;
			case 'object':
				var heading = Utils.getRelativeHeading(boat, location.x,location.y);
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
		setInterval(function(){
			var leadAmount = 120;
			var attackPositions = {
				left: enemy.localToLocal(-leadAmount, 0, enemy.parent),
				right: enemy.localToLocal(leadAmount, 0, enemy.parent)
			}
			var distanceFromLeft = Utils.distanceBetweenTwoPoints(attackPositions.left, {x:boat.x,y:boat.y});
			var distanceFromRight = Utils.distanceBetweenTwoPoints(attackPositions.right, {x:boat.x,y:boat.y});
			
			//var attackMarker = Utils.getDebugMarker();

			if (distanceFromRight > distanceFromLeft) {
				//attackMarker.x = attackPositions.left.x;
				//attackMarker.y = attackPositions.left.y;
				
				sailToDestination(attackPositions.left);
			} else {
				//attackMarker.x = attackPositions.right.x;
				//attackMarker.y = attackPositions.right.y;
				
				sailToDestination(attackPositions.right);
			}

			//enemy.parent.addChild(attackMarker);
			
		}, 2000);
	}

	boat.evade = function(enemy) {
		
	}

	boat.navigateTo = function(point) {

	}

	boat.wander = function(heading) {
		sailToDestination(heading);
	}

	return boat;
}