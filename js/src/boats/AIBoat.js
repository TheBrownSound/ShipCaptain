var AIBoat = function() {
	var boat = new Boat();
	var _mode = 'wander';
	var _enemies = [];
	var _currentTarget = false;

	var moveInterval = setInterval(moveBoat, 2000);
	var lookInterval = setInterval(checkSurroundings, 100);

	function moveBoat() {
		if (_mode === 'combat' && _currentTarget) {
			var attackPosition = getAttackPosition(_currentTarget);
			sailToDestination(attackPosition);
		} 
	}

	function checkSurroundings() {
		if (_mode === 'combat' && _currentTarget) {
			for (var gun in boat.guns) {
				var cannon = boat.guns[gun];
				if (cannon.isInRange(_currentTarget)) {
					cannon.shoot();
				}
			}
		} 
	}

	function sailToDestination(location) {
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

	function getAttackPosition(enemy) {
		var leadAmount = 120;
		var attackPositions = {
			left: enemy.localToLocal(-leadAmount, 0, boat.parent),
			right: enemy.localToLocal(leadAmount, 0, boat.parent)
		}

		var distanceFromLeft = Utils.distanceBetweenTwoPoints(attackPositions.left, {x:boat.x,y:boat.y});
		var distanceFromRight = Utils.distanceBetweenTwoPoints(attackPositions.right, {x:boat.x,y:boat.y});
		
		if (distanceFromRight > distanceFromLeft) {
			return attackPositions.left;
		} else {				
			return attackPositions.right;
		}
	}

	function clearChecks() {
		clearInterval(moveInterval);
		clearInterval(lookInterval);
	}

	function attackTarget(enemy) {
		_mode = 'combat';
		_currentTarget = enemy;
	}

	function removeEnemy(event) {
		var enemy = event.target;
		Utils.removeFromArray(_enemies, enemy);
		enemy.removeEventListener('sunk', removeEnemy);

		if (enemy === _currentTarget) {
			if (_enemies.length > 0) {
				attackTarget(_enemies[0]);
			} else {
				_currentTarget = false;
				_mode = 'wander';
			}
		}
	}

	boat.attack = function(enemy) {
		_enemies.push(enemy);
		enemy.addEventListener('sunk', removeEnemy);

		if (!_currentTarget) {
			attackTarget(enemy);
		}
	}

	boat.evade = function(enemy) {
		_mode = 'evade';
	}

	boat.wander = function() {
		var heading = Utils.getRandomInt(1,360);
		sailToDestination(heading);
	}

	boat.addEventListener('sunk', function(){
		clearChecks();
	});

	return boat;
}