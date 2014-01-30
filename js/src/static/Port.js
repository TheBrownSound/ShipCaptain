var Port = function(xPos,yPos) {
  var MAX_MISSIONS = 4;

  var port = new Place();
  port.type = 'port';
  
  var missions = [];
  var dockPositions = [];
  var ships = [];
  var missionInterval = setInterval(generateMission, 60000); // New mission every minute

  // Graphics setup
  var top = new createjs.Bitmap("images/city_top.png");
  var bottom = new createjs.Bitmap("images/city_bottom.png")
  port.addChild(bottom, top);
  port.regX = 500;
  port.regY = 500;

  port.x = xPos;
  port.y = yPos;

  function generateMission() {
    switch (Utils.getRandomInt(1,1)) {
      case 1:
        var ports = Game.world.ports.slice(0);
        ports.splice(ports.indexOf(port), 1);//removes this port
        if (ports.length >= 1) {
          var targetPort = ports[Utils.getRandomInt(0,ports.length-1)];
          port.addMission({
            type: 'deliver',
            target: targetPort
          });
        }
        break;
    }
  }

  function addDockPosition(xLoc,yLoc,head,approach) {
    // Create Dock
    var dock = new Dock(port, xLoc, yLoc, head, approach);
    dockPositions.push(dock);

    // Spawn merchant for dock position
    var newBoat = new Merchant();
    ships.push(newBoat);

    newBoat.x = dock.x;
    newBoat.y = dock.y;
    newBoat.rotation = dock.heading;

    Game.world.addBoat(newBoat);
    newBoat.dockAt(dock);
  }

  port.init = function() {
    addDockPosition(-180,390,220,200);
    addDockPosition(-312,264,220,240);
  }

  port.addMission = function(mission) {
    if (missions.length >= MAX_MISSIONS) {
      missions.shift();
    }
    missions.push(mission);
  }

  port.acceptMission = function(num) {
    var mission = missions.slice(num, 1);
    return (mission.length == 1) ? mission[0] : false;
  }

  port.dock = function(boat, dockNum) {
    var position = dockPositions[dockNum];
    if (position) {
      //boat.dock(dockPositions[dockNum]);
      position.occupied = boat;
      return true;
    } else {
      return false;
    }
  }

  port.undock = function(dockNum) {
    dockPositions[dockNum].occupied = false;
  }

  port.requestDockPosition = function(boat) {
    for (var position in dockPositions) {
      var dock = dockPositions[position];
      if (!dock.occupied) {
        dock.occupied = boat;
        return dock;
      }
    }
    return false;
  }

  port.__defineGetter__('dockPositions', function(){
    return dockPositions;
  });

  port.__defineGetter__('hitBox', function(){
    return top;
  });

  port.__defineGetter__('missions', function(){
    return missions;
  });

  return port;
}

var Dock = function(port, xLoc, yLoc, dockAngle, approachAngle) {
  var _occupied = false;
  var _owner = port;
  var _heading = dockAngle;
  var _approachAngle = approachAngle || dockAngle;

  var dock = {
    x: _owner.x+xLoc,
    y: _owner.y+yLoc,
    type: 'dock'
  }

  var _approachPoint = Utils.getPointAwayFromPoint(dock, 300, _approachAngle);
  _approachPoint.type = 'approach';

  dock.__defineGetter__('occupied', function(){
    return _occupied;
  });

  dock.__defineSetter__('occupied', function(boat){
    _occupied = boat;
  });

  dock.__defineGetter__('port', function(){
    return _owner;
  });

  dock.__defineGetter__('heading', function(){
    return _heading
  });

  dock.__defineGetter__('approachLocation', function(){
    return _approachPoint;
  });

  return dock;
}