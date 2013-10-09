var Pirate = function() {
	var boat = new AIBoat();
	boat.setSailColor('#444');

	var portGun = new Gun(8, boat);
	var starboardGun = new Gun(8, boat);

	portGun.y = starboardGun.y = 100;
	portGun.x = -10;
	starboardGun.x = 10;
	portGun.rotation = -90;
	starboardGun.rotation = 90;

	boat.addGun(portGun);
	boat.addGun(starboardGun);

	return boat;
}