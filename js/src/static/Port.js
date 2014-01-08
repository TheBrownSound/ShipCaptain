var Port = function(xPos,yPos) {
  var MAX_MISSIONS = 4;

  var port = new Place();
  port.type = 'port';
  
  var missions = [];
  var dockPositions = [];

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

  function addDockPosition(xLoc,yLoc,head) {
    dockPositions.push({
      num: dockPositions.length,
      x: port.x+xLoc,
      y: port.y+yLoc,
      heading: head,
      port: port,
      occupied: false
    });
  }

  port.init = function() {
    addDockPosition(-180,390,220);
    addDockPosition(-310,260,220);
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
      boat.dock(dockPositions[dockNum]);
      position.occupied = boat;
      return true;
    } else {
      return false;
    }
  }

  port.undock = function(dockNum) {
    dockPositions[dockNum].occupied = false;
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