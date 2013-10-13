var Pirate = function() {
	var boat = new AIBoat();
	
	var LENGTH = 125;
	var mainSail = new ForeAft(LENGTH*.5, {x:0,y:30});

	var mainGun = new Gun(8, 32, boat);

	mainSail.y = -30;
	mainGun.x = -8;
	mainGun.y = -25;

	boat.addSail(mainSail);
	boat.setSailColor('#444');
	
	boat.addGun(mainGun);

	return boat;
}