sourceFile = js/src/Game.js
outputDir = js/
name = ShipCaptainGame

compile:
	fuse -i $(sourceFile) -o $(outputDir)$(name).js

watch:
	fuse -i $(sourceFile) -o $(outputDir)$(name).js -w