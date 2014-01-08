var AIBoat = function(boat, boatClass) {
	boat.class = (boatClass) ? boatClass : 'merchant'; // pirate, navy, merchant
	var _mode = 'float';
	var _destinations = [];
	var _enemies = [];
	var _currentTarget = false;
	var _docked = false;

	var moveInterval = setInterval(moveBoat, 2000); //Adjust movement every 2 seconds
	var lookInterval = setInterval(checkSurroundings, 100); //React 10 times every second

	function moveBoat() {
		console.log('moveBoat: ', _mode);

		if (_currentTarget) {
			if (_mode === 'combat') {
				var attackPosition = getAttackPosition(_currentTarget);
				sailToDestination(attackPosition);
				if (_currentTarget.speed > boat.speed) {
					boat.increaseSpeed();
				} else if (_currentTarget.speed < boat.speed) {
					boat.decreaseSpeed();
				}
			} else if (_mode === 'evade') {
				var evadeHeading = Utils.getRandomInt(_currentTarget.heading-90, _currentTarget.heading+90)
				sailToDestination(Utils.convertToHeading(evadeHeading));
				boat.increaseSpeed();
			} 
		} else if (_mode === 'destination') {
			console.log(_destinations[0]);
			if (_destinations.length >= 1) {
				sailToDestination(_destinations[0]);
				boat.increaseSpeed();
			} else {
				_mode = 'float';
			}
		} else if (_mode === 'docked') {
			checkForMissionFrom(_docked.port)
		} else if (_mode === 'wander') {
			wander();
			var speedChange = Utils.getRandomInt(0,10);
			if (speedChange == 0) {
				boat.decreaseSpeed();
			} else if (speedChange == 1) {
				boat.increaseSpeed();
			}
		} else if (_mode === 'float') {
			while (boat.speed > 0) {
				boat.decreaseSpeed();
			}
		}
		
		/*
		// Check player proximity
		var distanceFromPlayer = Utils.distanceBetweenTwoPoints(boat, Game.world.playerBoat);
		if (distanceFromPlayer < 500) {
			boat.attack(Game.world.playerBoat);
		}
		*/
	}

	function checkSurroundings() {
		if (_destinations[0]) {
			var prox = Math.abs(Utils.distanceBetweenTwoPoints(boat,_destinations[0]));
			if (prox <= 10) {
				_destinations.shift();
			}
		}

		if (_currentTarget) {
			for (var gun in boat.guns) {
				var cannon = boat.guns[gun];
				if (cannon.isInRange(_currentTarget)) {
					cannon.shoot();
				}
			}
		}
	}

	function checkStatus() {
		if ((boat.life/boat.health) < 0.2 && _mode != 'evade' && _currentTarget) {
			console.log('evade target');
			evadeTarget(_currentTarget);
		}
	}

	function checkForMissionFrom(port) {
		if (port.missions.length >= 1) {
			console.log('got mission!');
			var mission = port.acceptMission(0);
			port.undock(_docked.num);
			boat.sailTo(Utils.getPointAwayFromPoint({x:_docked.x, y:_docked.y}, 300, _docked.heading));
			boat.sailTo(mission.target);
			console.log(_destinations);
		}
	}

	function sailToDestination(location) {
		console.log('sailToDestination', location)
		switch(typeof(location)) {
			case 'number': // Heading
				turnToHeading(location);
				break;
			case 'object':
				var heading = Utils.getRelativeHeading(boat, location);
				turnToHeading(heading);
				break;
		}
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

	function wander() {
		if (!_currentTarget) {
			var duration = Utils.getRandomInt(30,120)/2;// halving turns the duration to seconds
			_currentTarget = duration;
			var randomHeading = Utils.getRandomInt(1,360);
			sailToDestination(randomHeading);
		} else {
			_currentTarget--;
			if (_currentTarget <= 0) {
				_currentTarget = false;
			}
		}
	}

	function getAttackPosition(enemy) {
		var leadAmount = 120;
		var attackPositions = {
			left: enemy.localToLocal(-leadAmount, -leadAmount, boat.parent),
			right: enemy.localToLocal(leadAmount, -leadAmount, boat.parent)
		}

		var distanceFromLeft = Utils.distanceBetweenTwoPoints(attackPositions.left, {x:boat.x,y:boat.y});
		var distanceFromRight = Utils.distanceBetweenTwoPoints(attackPositions.right, {x:boat.x,y:boat.y});
		
		if (distanceFromRight > distanceFromLeft) {
			return attackPositions.left;
		} else {				
			return attackPositions.right;
		}
	}

	function getEvadePosition(enemy) {
		var runAmount = 2000;
	}

	function clearChecks() {
		clearInterval(moveInterval);
		clearInterval(lookInterval);
		boat.removeEventListener('damaged', checkStatus);
		boat.removeEventListener('sunk', clearChecks);
	}

	function attackTarget(enemy) {
		_mode = 'combat';
		_currentTarget = enemy;
	}

	function evadeTarget(enemy) {
		_mode = 'evade';
		_currentTarget = enemy;
	}

	function removeEnemy(event) {
		var enemy = event.target;
		Utils.removeFromArray(_enemies, enemy);
		enemy.removeEventListener('sunk', removeEnemy);

		if (enemy === _currentTarget) {
			_currentTarget = false;
			if (_enemies.length > 0) {
				attackTarget(_enemies[0]);
			} else {
				_mode = 'wander';
			}
		}
	}

	boat.float = function() {
		_mode = 'float';
	}

	boat.sailTo = function(location) {
		_mode = 'destination';
		_destinations.push(location);
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

	boat.dock = function(dock) {
		_mode = 'docked';
		_docked = dock;
	}

	boat.addEventListener('damaged', checkStatus);
	boat.addEventListener('sunk', clearChecks);

	return boat;
}