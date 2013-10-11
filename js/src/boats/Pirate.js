var Pirate = function() {
	var boat = new AIBoat();
	
	var LENGTH = 125;
	var mainSail = new ForeAft(LENGTH*.5, {x:0,y:LENGTH-10});

	var mainGun = new Gun(8, 32, boat);

	mainSail.y = 32;
	mainGun.x = -8;
	mainGun.y = 30;

	boat.addSail(mainSail);
	boat.setSailColor('#444');
	
	boat.addGun(mainGun);

	return boat;
}