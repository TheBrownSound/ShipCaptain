var AIBoat = function(boat, boatClass) {
  boat.class = (boatClass) ? boatClass : 'merchant'; // pirate, navy, merchant
  var _mode = 'float';
  var _destinations = [];
  var _enemies = [];
  var _wait = 0;
  var _currentTarget = false;

  var moveInterval = setInterval(moveBoat, 2000); //Adjust movement every 2 seconds
  var lookInterval = setInterval(checkSurroundings, 100); //React 10 times every second

  var mark = Utils.getDebugMarker();

  function moveBoat() {
    // Check curent heading for near collisions

    // Check for nearby enemies
    /*
    var distanceFromPlayer = Utils.distanceBetweenTwoPoints(boat, Game.world.playerBoat);
    if (distanceFromPlayer < 500) {
      boat.attack(Game.world.playerBoat);
    }
    */

    boat.parent.addChild(mark);

    if (_wait > 0) {
      _wait--;
      return;
    }

    // Check prioritized actions
    if (_enemies.length > 0) {
      // Has enemies, decide what to do (assumes greatest threat is always first in the array)
      if (boat.health > 40) { //check health
        // attack or defend
        attackEnemy(_enemies[0]);
      } else {
        evadeEnemy(_enemies[0]);
      }
    } else if (_destinations.length > 0) {
      var location = _destinations[0];
      if (location.type == 'dock') {
        _wait = Utils.getRandomInt(4,15);
        boat.setSpeed(0);
        boat.dockAt(location);
        //animateToDock(location);
      } else {
        var distance = Utils.distanceBetweenTwoPoints(boat,location);
        if (location.type == 'port') {
          if (distance < 1200) {
            var dock = location.requestDockPosition(boat);
            if (dock) {
              _destinations.splice(0,1);
              _destinations.unshift(dock);
              _destinations.unshift(dock.approachLocation);
            } else {
              boat.setSpeed(0);
              return;
            }
          }
        }

        // set speed
        if (distance > 1000) {
          boat.setSpeed(10);
        } else {
          var newSpeed = Math.round(distance)/100;
          boat.setSpeed(newSpeed);
        }

        sailToDestination(location); // sail to next destination
      }
    } else {
      chooseAction(); // not doing anything select new action
    }
  }

  function chooseAction() {
    if (boat.class == 'merchant') {
      // Sail to a port!
      var ports = Game.world.ports.slice(0); // Copies world port array
      if (boat.docked) {
        console.log('undock!')
        ports.splice(ports.indexOf(boat.docked.port), 1);//removes port docked at

        _destinations.push(boat.docked.approachLocation);
        //removes references for docking
        boat.docked.occupied = false;
        boat.dockAt(false);
      }
      if (ports.length >= 1) {
        var targetPort = ports[Utils.getRandomInt(0,ports.length-1)];
        _destinations.push(targetPort);
      }
    } else {
      // wander! get random heading
      var randomHeading = Utils.getRandomInt(1,360);
      _destinations.push(randomHeading);
    }
  }

  function checkSurroundings() {
    /*
    // Dummy pathfinding
    var lookAhead = Utils.getPointAwayFromPoint({x:boat.x, y:boat.y}, 300, boat.heading);
    for (var place in Game.world.places) {
      var staticPlace = Game.world.places[place];
      if (staticPlace.hitTest(lookAhead.x,lookAhead.y)) {
        var lookAheadLeft = Utils.getPointAwayFromPoint({x:boat.x, y:boat.y}, 300, boat.heading-20);
        var lookAheadRight = Utils.getPointAwayFromPoint({x:boat.x, y:boat.y}, 300, boat.heading+20);
        var hitOnLeft = staticPlace.hitTest(lookAheadLeft.x,lookAheadLeft.y);
        var hitOnRight = staticPlace.hitTest(lookAheadRight.x,lookAheadRight.y);
        if ((hitOnLeft && hitOnRight) || (!hitOnLeft && !hitOnRight)) {
          if (Utils.yesNo()) {
            
          }
          _destinations.unshift(location);
        }
      }
    }
    */

    // Removes destinations arrived at
    if (_destinations[0]) {
      var prox = Math.abs(Utils.distanceBetweenTwoPoints(boat,_destinations[0]));
      if (prox <= 100) {
        _destinations.shift();
      }
    }

    // SHOOOT HIMM!
    if (_enemies.length > 0) {
      for (var gun in boat.guns) {
        var cannon = boat.guns[gun];
        for (var enemy in _enemies) {
          if (cannon.isInRange(_enemies[enemy])) {
            cannon.shoot();
          }
        }
      }
    }
  }

  function attackEnemy(enemy) {
    var attackPosition = getAttackPosition(enemy);
    sailToDestination(attackPosition);
    if (enemy.speed > boat.speed) {
      boat.increaseSpeed();
    } else if (enemy.speed < boat.speed) {
      boat.decreaseSpeed();
    }
  }

  function evadeEnemy(enemy) {
    // Get heading away from the enemies heading
    var evadeHeading = Utils.getRandomInt(enemy.heading-90, enemy.heading+90)
    sailToDestination(Utils.convertToHeading(evadeHeading));
    // Go fast!
    boat.increaseSpeed();
  }

  function boatDamaged() {
    // Add enemy if not already
    // Re-prioritize enemies
  }

  function checkForMissionFrom(port) {
    if (port.missions.length >= 1) {
      console.log('got mission!');
      var mission = port.acceptMission(0);
      //port.undock(_docked.num);
      //boat.sailTo(Utils.getPointAwayFromPoint({x:_docked.x, y:_docked.y}, 300, _docked.heading));
      //boat.sailTo(mission.target);
      console.log(_destinations);
    }
  }

  function sailToDestination(location) {
    //console.log('sailToDestination', location)
    switch(typeof(location)) {
      case 'number': // Heading
        turnToHeading(location);
        break;
      case 'object': // Location
        var heading = Utils.getRelativeHeading(boat, location);
        turnToHeading(heading);
        break;
    }

    mark.x = location.x;
    mark.y = location.y;
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

  function clearChecks() {
    clearInterval(moveInterval);
    clearInterval(lookInterval);
    boat.removeEventListener('damaged', boatDamaged);
    boat.removeEventListener('sunk', clearChecks);
  }

  function addEnemy(enemy) {
    if (_enemies.indexOf(enemy) < 0) {
      _enemies.push(enemy);
      enemy.addEventListener('sunk', function(){
        removeEnemy(event.target);
      });
    }
  }

  function removeEnemy(enemy) {
    Utils.removeFromArray(_enemies, enemy);
    enemy.removeEventListener('sunk', removeEnemy);
  }

  boat.addEventListener('damaged', boatDamaged);
  boat.addEventListener('sunk', clearChecks);

  return boat;
}