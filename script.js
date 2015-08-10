var WIDTH, HEIGHT = WIDTH;
var running, ready;
var frames, fps, secTimer, lastTime, survivalTime, spawnTimer, paused;
var canvas, ctx, keystate
var mouseDown, mouse, keys;
var player, bullets, enemies;


function main() {
	WIDTH = 800;
	HEIGHT = WIDTH * 9/16
	mouseDown = false;
	mouse = {x: null, y: null};
	survivalTime = 0;
	running = false;
	ready = true;
	keys  = {left: 37, up: 38, right: 39, down: 40, W: 87, A: 65, S: 83, D: 68, space: 32, P: 80, R: 82}

	canvas = document.createElement("canvas");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	document.body.appendChild(canvas);
	ctx = canvas.getContext("2d");

	keystate = {};
	document.addEventListener("keydown", function(event) {
		keystate[event.keyCode] = true;
	});
	document.addEventListener("keyup", function(event) {
		delete keystate[event.keyCode];
	})
	document.addEventListener("mousedown", function(event) {
		mouse = {
			x: event.clientX - canvas.getBoundingClientRect().left,
			y: event.clientY - canvas.getBoundingClientRect().top
		}
		if (running && mouse.x > 0 && mouse.x < WIDTH && mouse.y > 0 && mouse.y < HEIGHT) mouseDown = true;
	});
	document.addEventListener("mousemove", function(event) {
		mouse.x = event.clientX - canvas.getBoundingClientRect().left;
		mouse.y = event.clientY - canvas.getBoundingClientRect().top;
	});
	document.addEventListener("mouseup", function(event) {
		mouseDown = false;
	});
	document.addEventListener("contextmenu", function(event) {
		keystate = {};
		mouseDown = false;
	})
	
	init();
}

function init() {
	paused = false;
	keystate = {};
	mouseDown = false;

	Player.size = 20;
	player = new Player((WIDTH - Player.size) / 2, (HEIGHT - Player.size) / 2, 2);
	playerGhost = new Player((WIDTH - Player.size) / 2, (HEIGHT - Player.size) / 2, 1);

	Bullet.size = 5;
	Bullet.speed = 6;
	bullets = [];

	Enemy.size = 20;
	Enemy.speed = 1;
	enemies = [];

	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.save();
	ctx.fillStyle = "#ffffff";
	ctx.font = "50px Verdana, sans-serif";
	ctx.textAlign = "center";
	if (survivalTime == 0) {
		ctx.font = "16px Verdana, sans-serif";
		printText("Use either W-A-S-D or the arrow keys to move.", WIDTH/2, 48);
		printText("Click to shoot at the red squares, and be sure not to touch them.", WIDTH/2, 70);
		printText("Press the space bar to pause and click the screen to resume. Have fun!", WIDTH/2, 92);
		ctx.fillStyle = "#00ff00";
		ctx.font = "15px Verdana, sans-serif";
		printText("Record: " + getSurvivalTime(getRecord()), WIDTH/2, 130);
		ctx.fillStyle = "#ffffff";
		ctx.font = "50px Verdana, sans-serif";
		ctx.textBaseline = "middle";
		printText("Click to start!", WIDTH/2, HEIGHT/2);
		ctx.restore();
	} else {
		ready = false;
		ctx.save();
		if (survivalTime != getRecord()) {
			ctx.font = "30px Verdana, sans-serif";
			printText("You died at", WIDTH/2, 45);
			ctx.font = "50px Verdana, sans-serif";
			printText(getSurvivalTime(survivalTime), WIDTH/2, 100);
			ctx.fillStyle = "#00ff00";
			ctx.font = "15px Verdana, sans-serif";
			printText("Record: " + getSurvivalTime(getRecord()), WIDTH/2, 130);
		} else {
			ctx.fillStyle = "#00ff00";
			ctx.font = "30px Verdana, sans-serif";
			printText("New record at", WIDTH/2, 45);
			ctx.font = "50px Verdana, sans-serif";
			printText(getSurvivalTime(survivalTime), WIDTH/2, 100);
		}
		ctx.restore();
		ctx.textBaseline = "middle";

		setTimeout(function() {
			ready = true;
			printText("Click to try again!", WIDTH/2, HEIGHT/2);
			ctx.restore();
		}, 1000);
	}

	document.addEventListener("click", function(event) {
		if (!running && ready && mouse.x > 0 && mouse.x < WIDTH && mouse.y > 0 && mouse.y < HEIGHT) {
			running=true;
			frames=0;
			fps=0;
			secTimer = new Date().getTime();
			lastTime = new Date().getTime();
			survivalTime = 0;
			spawnTimer = new Date().getTime();
			window.requestAnimationFrame(loop);
		}
	});
}

function loop() {
	survivalTime += new Date().getTime() - lastTime;
	lastTime = new Date().getTime();
	if (typeof getRecord() == "number") {
		if (survivalTime > getRecord()) setRecord(survivalTime);
	} else if (getRecord() == "hacked record") {
		// Yes I know the other alert has a :), not a ;) -- this is so debugging is quicker ;)
		alert("If you want to hack the game, you'll have to put in a bit more effort :)");
		setRecord(survivalTime);
	}
	update();
	render();
	frames++;
	if (new Date().getTime() - secTimer > 1000) {
		fps = frames;
		secTimer += 1000;
		frames = 0;
	}
	var deltaSpawn = 10000 * Math.pow(survivalTime, -1/3);
	if (new Date().getTime() - spawnTimer > deltaSpawn) {
		spawnTimer += deltaSpawn;
		enemies.push(new Enemy());
	}
	paused = document.hasFocus();
	if (keystate[keys.P] || keystate[keys.space] || !paused) {
		window.requestAnimationFrame(function() {checkPaused(true)});
	}
	else if (running) window.requestAnimationFrame(loop);
	else init();
}

function update() {
	for (var i = 0; i < bullets.length; i++) {
		bullets[i].update(i);
	}
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].update(i);
	}
	player.realUpdate();
	playerGhost.ghostUpdate();
}

function render() {
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.save();

	ctx.fillStyle = "#ffffff";
	for (var i = 0; i < bullets.length; i++) {
		bullets[i].draw();
	}
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].draw();
	}
	player.draw();

	ctx.font = "50px Verdana, sans-serif";
	ctx.textAlign = "center";
	printText(getSurvivalTime(survivalTime), WIDTH/2, 100);
	ctx.restore();
}

function checkPaused(firstLoop) {
	if (firstLoop) {
		paused = true;
		keystate = {};
		mouseDown = false;
		ctx.save();
		ctx.font = "50px Verdana, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#ffffff";
		printText("Click to resume...", WIDTH/2, HEIGHT/2);
		ctx.restore();
	}
	if (keystate[keys.R] || mouseDown == true) {
		spawnTimer = new Date().getTime();
		lastTime = new Date().getTime();
		paused = false;
		loop();
	}
	else {
		window.requestAnimationFrame(function() {checkPaused(false)});
	}
}

function getSurvivalTime(time) {
	if (typeof time == "number") {
		var minutes = (Math.floor(time/60000));
		var seconds = ("0" + Math.floor((time % 60000) / 1000)).slice(-2);
		var centiseconds = ("0" + Math.floor(((time % 60000) % 1000) / 10)).slice(-2);
		return minutes+":"+seconds+"."+centiseconds;
	} else if (typeof time == "string") {
		if (time == "no storage") {
			return "Sorry, your browser does not support record storage";
		} else if (time == "hacked record") {
			// Yes I know the other alert has a :), not a ;) -- this is so debugging is quicker :)
			alert("If you want to hack the game, you'll have to put in a bit more effort ;)");
			setRecord(survivalTime);
			return getSurvivalTime(getRecord());
		}
	}
}

function printText(text, x, y) {
	ctx.save();
	ctx.lineWidth = 2;
	ctx.strokeText(text, x, y);
	ctx.fillText(text, x, y);
	ctx.restore();
}

function getRecord() {
	try {
		localStorage.setItem("support?", "yes");
		if (localStorage.getItem("support?") != null) {
			localStorage.removeItem("support?");
			if (localStorage.getItem("record") == null) setRecord(0);
			return decryptRecord(Number(localStorage.getItem("record")));
		}
		else {
			return "no storage";
		}
	} catch (e) {
		return "no storage";
	}
}

function setRecord(record) {
	try {
		localStorage.setItem("support?", "yes");
		if (localStorage.getItem("support?") != null) {
			localStorage.removeItem("support?");
			localStorage.setItem("record", encryptRecord(record).toString());
		}
		else {
			// missing support for HTML5 localStorage is dealt with in getRecord()
		}
	} catch (e) {
		// missing support for HTML5 localStorage is dealt with in getRecord()
	}
}

/*
This "encryption" stuff isn't meant to be secure, it's meant to
prevent people who don't understand javascript from "hacking" the game.
I'm not worried about you programmers though -- surely you are all above
boasting to your friends about how "awesome" you are at this little game ;)
*/
function encryptRecord(number) {
	// see comment above
	return number *= 5915587277;
}

function decryptRecord(number) {
	// see comment above
	if (number % 5915587277 == 0) {
		return number / 5915587277;
	}
	else {
		return "hacked record";
	}
}

main();