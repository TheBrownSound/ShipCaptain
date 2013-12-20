var Raft = function() {
  var raft = new Boat(Game.assets['raft']);
  var rudder = new createjs.Bitmap('images/raft_rudder.png');
  raft.setAnchorPoints({x:-30,y:-40},{x:30,y:-40},{x:30,y:40},{x:-30,y:40});
  raft.addRudder(rudder, true);

  rudder.regX = 2;
  rudder.regY = 24;
  rudder.x = 17;
  rudder.y = 34;

  return raft;
}

var SmallBoat = function() {
  var boat = new Boat(Game.assets['basicBoat']);
  boat.setAnchorPoints();
  return boat;
}