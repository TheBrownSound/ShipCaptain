var Raft = function() {
  var raft = new Boat(Game.assets['raft']);
  var rudder = new RaftRudder();
  var mast = new SmallMast();
  var sail = new SquareRig(40, {x:-30,y:0}, {x:30,y:0});

  rudder.x = 17;
  rudder.y = 34;
  mast.x = sail.x = -10;
  mast.y = sail.y = -20;

  raft.setAnchorPoints({x:-30,y:-40},{x:30,y:-40},{x:30,y:40},{x:-30,y:40});
  
  raft.addRudder(rudder, true);
  raft.addMast(mast);
  raft.addSail(sail);
  return raft;
}

var SmallBoat = function() {
  var boat = new Boat(Game.assets['basicBoat']);
  var rudder = new BasicRudder();
  var mast = SmallMast();
  var sail = new ForeAft(boat.length/3, {x:0,y:22});
  
  rudder.y = 73;
  mast.y = -36;
  sail.y = -32;

  boat.setAnchorPoints({x:-30,y:-40},{x:30,y:-40},{x:30,y:40},{x:-30,y:40});

  boat.addRudder(rudder, true);
  boat.addMast(mast);
  boat.addSail(sail);
  return boat;
}

var Cruiser = function() {
  var boat = new Boat(Game.assets['cruiser']);
  var rudder = new BasicRudder();
  var mast = SmallMast();
  var jib = new ForeAft(80, {x:1,y:-20});
  var main = new SquareRig(120, {x:-38,y:26}, {x:40,y:30});
  
  rudder.y = 106;
  jib.y = -120;
  mast.x = 1;
  mast.y = -19;
  main.y = -24;

  boat.setAnchorPoints({x:-30,y:-40},{x:30,y:-40},{x:30,y:40},{x:-30,y:40});

  boat.addRudder(rudder);
  boat.addSail(main);
  boat.addSail(jib);
  boat.addMast(mast);
  return boat;
}

var SmallMast = function() {
  var mast = new createjs.Bitmap('images/mast_small.png');
  mast.regX = mast.regY = 7;

  mast.sails = 1;
  return mast;
}

var RaftRudder = function() {
  var rudder = new createjs.Bitmap('images/raft_rudder.png');
  rudder.regX = 2;
  rudder.regY = 24;
  return rudder;
}

var BasicRudder = function() {
  var rudder = new createjs.Bitmap('images/basic_rudder.png');
  rudder.regX = 2;
  rudder.regY = 24;
  return rudder;
}