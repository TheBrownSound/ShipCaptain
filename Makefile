sourceFile = js/src/Game.js
outputDir = js/
name = ShipCaptainGame

compile:
	fuse -i $(sourceFile) -o $(outputDir)$(name).js
	fuse -i $(sourceFile) -o $(outputDir)$(name).min.js -m -c

watch:
	fuse -i $(sourceFile) -o $(outputDir)$(name).js -w

server:
	python -m SimpleHTTPServer