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
				var heading = findHeadingToPoint(location.x,location.y);
				turnToHeading(heading);
				break;
		}
		boat.hoistSails();
	}

	function findHeadingToPoint(xPos, yPos) {
		var xDiff = xPos - boat.x;
		var yDiff = yPos - boat.y;
		var heading = Math.round(Math.atan2(xDiff, -yDiff) * (180 / Math.PI));
		return Utils.convertToHeading(heading);
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
			
			var attackMarkerOne = Utils.getDebugMarker();
			var attackMarkerTwo = Utils.getDebugMarker();

			attackMarkerOne.x = attackPositions.left.x;
			attackMarkerOne.y = attackPositions.left.y;

			attackMarkerTwo.x = attackPositions.right.x;
			attackMarkerTwo.y = attackPositions.right.y;

			enemy.parent.addChild(attackMarkerTwo, attackMarkerOne);
			
			if (distanceFromRight > distanceFromLeft) {
				sailToDestination(attackPositions.left);
			} else {
				sailToDestination(attackPositions.right);
			}
			
			
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