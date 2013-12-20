var Pirate = function() {
	var boat = new AIBoat();
	var mainGun = new Gun(3, 10, boat);
	mainGun.x = 20;
	mainGun.y = -25;
	
	boat.addGun(mainGun);

	return boat;
}