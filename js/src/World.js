// Top Down world class
var World = function(playerBoat){
  var MAP_TILES = 20;
  var TILE_SIZE = 1000;

  var PLACES = [{
    type: 'civilian',
    count: 6
  }, {
    type: 'pirate',
    count: 3
  }, {
    type: 'island',
    count: 10
  }];

  var _eventFrequency = 10000;
  var updateInterval = setInterval(update, Math.floor(1000/60));

  var world = new createjs.Container();
  world.name = 'world';
  world.ports = [];
  world.places = [];
  world.ships = [];
  world.playerBoat = playerBoat;

  var map = world.map = new createjs.Container();
  var ocean = world.ocean = new Ocean(500,500);
  var weather = world.weather = new Weather();
  
  world.addChild(ocean, map);
  addBoat(playerBoat);

  var eventTick = setInterval(eventSpawner, _eventFrequency);

  function addBoat(boat) {
    console.log('adding boat', boat);
    boat.addEventListener('sunk', function(){
      var boatIndex = world.ships.indexOf(boat);
      if (boatIndex >= 0) {
        world.ships.splice(boatIndex, 1);
      }
    })
    map.addChild(boat);
    world.ships.push(boat);
  }

  function addPlace(obj) {
    if (obj.type == 'port') {
      world.ports.push(obj);
      obj.init();
    }
    map.addChildAt(obj, 0);
    world.places.push(obj);
  }

  function addPirate() {
      var pirate = new Pirate();
      var minDistance = 1000;

      var xAmount = Utils.getRandomInt(minDistance,3000)
      var xDistance = (Utils.getRandomInt(0,1)) ? -xAmount:xAmount;
      var yAmount = Utils.getRandomInt(minDistance,3000)
      var yDistance = (Utils.getRandomInt(0,1)) ? -yAmount:yAmount;

      pirate.x = xDistance+playerBoat.x;
      pirate.y = yDistance+playerBoat.y;
      if (playerBoat.health > 0) {
        pirate.attack(playerBoat);
      }
      addBoat(pirate);
      return pirate;
  }

  function addMerchant() {
    var merchant = new Merchant();

    var randomPort = Utils.getRandomInt(0, world.ports.length-1);
    var port = world.ports[randomPort];
    console.log('Port: ', port);
    if (port) {
      console.log('port docks: ', port.dockPositions);
      var docks = port.dockPositions;
      for (var position in docks) {
        var dock = docks[position];
        console.log('DOCK:', dock);
        if (!dock.occupied) {
          merchant.x = dock.x;
          merchant.y = dock.y;
          merchant.rotation = dock.heading;
          port.dock(merchant, position);
          break;
        }
      }
    }

    addBoat(merchant);
    return merchant;
  }

  function eventSpawner() {
    var spawnEvent = (Utils.getRandomInt(0,5) === 0);
    console.log('Spawn event: ', spawnEvent);
    if (spawnEvent) {
      //var location = getEventLocation();
      //var boat = addPirate();
      /*
      if (boat) {
        boat.x = location.x;
        boat.y = location.y;
      }
      */
    }
  }

  function getEventLocation() {
    var distance = 400;
    var speed = Utils.getAxisSpeed(playerBoat.heading, playerBoat.speed);
    return {
      x: playerBoat.x+(speed.x*distance),
      y: playerBoat.y+(speed.y*distance)
    }
  }

  function triggerCollision(boat, object, collisionRect) {
    var localPos = map.globalToLocal(collisionRect.x,collisionRect.y)
    collisionRect.x = localPos.x;
    collisionRect.y = localPos.y;

    var centerOfImpact = {
      x: collisionRect.x+(collisionRect.width/2),
      y: collisionRect.y+(collisionRect.height/2)
    }

    if (boat.x < centerOfImpact.x) {
      boat.x -= collisionRect.width;
    } else {
      boat.x += collisionRect.width;
    }

    if (boat.y < centerOfImpact.y) {
      boat.y -= collisionRect.height;
    } else {
      boat.y += collisionRect.height;
    }
    /*
    var hitMarker = new createjs.Shape();
    map.addChild(hitMarker);
    hitMarker.graphics.clear();
    hitMarker.graphics.beginFill('#F00');
    hitMarker.graphics.rect(collisionRect.x,collisionRect.y,collisionRect.width,collisionRect.height);
    hitMarker.graphics.endFill();
  */
    //boat.collision(object, collisionRect);
  }
  
  function update() {
    document.getElementById('heading').innerHTML = "Heading: "+Math.round(playerBoat.heading);
    document.getElementById('knots').innerHTML = "Knots: "+Math.round(playerBoat.knots);

    // boat collision detection
    for (var ship in world.ships) {
      var boat = world.ships[ship];
      for (var otherShip in world.ships) {
        var otherBoat = world.ships[otherShip];
        if (boat != otherBoat) {
          var crashRect = ndgmr.checkPixelCollision(boat.hull,otherBoat.hull, 0, true);
          if (crashRect) {
            triggerCollision(boat, otherBoat, crashRect);
          }
        }
      }

      for (var place in world.places) {
        var object = world.places[place];
        var hitBox = ndgmr.checkPixelCollision(boat.hull,object.hitBox, 0.5, true);
        if (hitBox) {
          triggerCollision(boat, object, hitBox);
        }
      }
    }

    // Update relative positions
    map.regX = playerBoat.x;
    map.regY = playerBoat.y;
    ocean.position.x = -playerBoat.x;
    ocean.position.y = -playerBoat.y;
    ocean.update();

    // Camera animation based on directional velocity
    var xSpeed = Math.sin(playerBoat.heading*Math.PI/180)*-playerBoat.speed;
    var ySpeed = Math.cos(playerBoat.heading*Math.PI/180)*playerBoat.speed;
    createjs.Tween.get(map, {override:true})
      .to({x:xSpeed*50, y:ySpeed*50}, 1000, createjs.Ease.sineOut)
    createjs.Tween.get(ocean, {override:true})
      .to({x:xSpeed*50, y:ySpeed*50}, 1000, createjs.Ease.sineOut)
  }

  var testRect = new createjs.Shape();
  map.addChild(testRect);

  Game.stage.addEventListener('stagemousedown', function(e) {
    var location = map.globalToLocal(e.stageX,e.stageY);
    checkCollisions(location);

    var marker = Utils.getDebugMarker();
    marker.x = location.x;
    marker.y = location.y;
    map.addChild(marker);
  });

  function checkCollisions(destination) {
    // Pathfinding!
    // any collisions between origin and destination?
    var places = world.places.slice(0); // Copies world places array
    places = places.filter(function(place){
      if (place.poly) {
        var slices = PolyK.Slice(place.poly, playerBoat.x, playerBoat.y, destination.x, destination.y);
        console.log(slices.length);
        return slices.length > 1;
      } else {
        return false;
      }
    });

    if (places.length > 1) {
      var nearest = places[0];
      for (var place in places) {
        if (places) {}
      }
    }
  }

  function getRandomNodeType() {
    switch(Utils.getRandomInt(0,10)) {
      case 1:
        return 'island';
      case 2:
        return 'city';
      default:
        return 'empty';
    }
  }

  world.generateWorld = function(worldObj) {
    //TODO implement building from worldObj
    var tileOffset = (MAP_TILES*TILE_SIZE)/2;
    var nodes = [];

    if (worldObj) {

    } else {
      // creates the world
      for (var i = 0; i < MAP_TILES*MAP_TILES; i++) {
        var node = {};
        node.num = i;
        node.col = i%MAP_TILES
        node.row = Math.floor(i/MAP_TILES);
        node.info = {
          type: 'empty'
        }
        nodes.push(node);
      };

      var availableNodes = nodes.slice(0);
      for (var obj in PLACES) {
        var place = PLACES[obj];
        for (var i = 0; i < place.count; i++) {
          var randomIndex = Utils.getRandomInt(0, availableNodes.length);
          var randomNode = availableNodes.splice(randomIndex,1)[0];
          nodes[randomNode.num].info = {
            type: place.type
          }
          console.log('randomNode', randomNode.num);
        };
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var location = nodes[i];
      location.x = (TILE_SIZE*location.col)-tileOffset;
      location.y = (TILE_SIZE*location.row)-tileOffset;
      switch (location.info.type) {
        case 'civilian':
        case 'pirate':
          var city = new Port();
          city.x = location.x+city.regX;
          city.y = location.y+city.regY;
          addPlace(city);
          break;
        case 'island':
          var island = new Island();
          island.x = location.x;
          island.y = location.y;
          addPlace(island);
          break;
      }
      // outlines the nodes
      var rect = new createjs.Shape();
      rect.graphics.beginStroke(1);
      rect.graphics.drawRect(location.x, location.y, TILE_SIZE, TILE_SIZE);
      rect.graphics.endStroke();
      map.addChild(rect);
    };

    //Start playing water sound
    createjs.Sound.play("water", {loop:-1});
  }

  world.addBoat = addBoat;
  world.addMerchant = addMerchant;
  world.addPirate = addPirate;
  
  return world;
}