var Pirate = function() {
	var boat = new AIBoat();
	var portGun = new Gun(8);
	var starboardGun = new Gun(8);

	

	boat.addChild(portGun);
	boat.addChild(starboardGun);
	return boat;
}