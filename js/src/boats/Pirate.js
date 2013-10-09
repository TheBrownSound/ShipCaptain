var Pirate = function() {
	var boat = new AIBoat();
	boat.setSailColor('#444');

	var LENGTH = 125;
	var mainSail = new ForeAft(LENGTH*.5, {x:0,y:LENGTH-10});

	var portGun = new Gun(8, boat);
	var starboardGun = new Gun(8, boat);

	mainSail.y = 55;
	portGun.y = starboardGun.y = 100;
	portGun.x = -10;
	starboardGun.x = 10;
	portGun.rotation = -90;
	starboardGun.rotation = 90;

	boat.addSail(mainSail);
	boat.addGun(portGun);
	boat.addGun(starboardGun);

	return boat;
}