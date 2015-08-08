var WIDTH, HEIGHT = WIDTH;
var running, ready;
var frames, fps, secTimer, lastTime, survivalTime, spawnTimer;
var canvas, ctx, keystate
var mouseClicked, mouseY, mouseY, keys;
var player, bullets, enemies;


function main() {
	WIDTH = 800;
	HEIGHT = WIDTH * 9/16
	mouseClicked = false;
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
	document.addEventListener("click", function(event) {
		mouseX = event.clientX - canvas.getBoundingClientRect().left;
		mouseY = event.clientY - canvas.getBoundingClientRect().top;
		if (running && mouseX > 0 && mouseX < WIDTH && mouseY > 0 && mouseY < HEIGHT) mouseClicked = true;
	});
	document.addEventListener("contextmenu", function(event) {
		keystate = {};
	})

	if (localStorage.getItem("record") === null) {
		localStorage.setItem("record", "0");
	}

	init();
}

function init() {
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
		ctx.fillText("Use either W-A-S-D or the arrow keys to move.", WIDTH/2, 48);
		ctx.fillText("Click to shoot the red squares, and be sure not to touch them.", WIDTH/2, 70);
		ctx.fillText("Press P to pause and R to resume. Have fun!", WIDTH/2, 92);
		ctx.font = "50px Verdana, sans-serif";
		ctx.textBaseline = "middle";
		ctx.fillText("Click to start!", WIDTH/2, HEIGHT/2);
		ctx.restore();
	} else {
		ready = false;
		ctx.save();
		if (survivalTime.toString() != localStorage.getItem("record")) {
			ctx.font = "30px Verdana, sans-serif";
			ctx.fillText("You died at", WIDTH/2, 45);
			ctx.font = "50px Verdana, sans-serif";
			ctx.fillText(getSurvivalTime(survivalTime), WIDTH/2, 100);
			ctx.fillStyle = "#00ff00";
			ctx.font = "15px Verdana, sans-serif";
			ctx.fillText("Record: " + getSurvivalTime(localStorage.getItem("record")), WIDTH/2, 130);
		} else {
			ctx.fillStyle = "#00ff00";
			ctx.font = "30px Verdana, sans-serif";
			ctx.fillText("New record at", WIDTH/2, 45);
			ctx.font = "50px Verdana, sans-serif";
			ctx.fillText(getSurvivalTime(survivalTime), WIDTH/2, 100);
		}
		ctx.restore();
		ctx.textBaseline = "middle";

		setTimeout(function() {
			ready = true;
			ctx.fillText("Click to try again!", WIDTH/2, HEIGHT/2);
			ctx.restore();
		}, 1000);
	}

	document.addEventListener("click", function(event) {
		if (!running && ready && mouseX > 0 && mouseX < WIDTH && mouseY > 0 && mouseY < HEIGHT) {
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
	if (survivalTime > localStorage.getItem("record")) localStorage.setItem("record", survivalTime.toString());
	update();
	render();
	frames++;
	if (new Date().getTime() - secTimer > 1000) {
		fps = frames;
		secTimer += 1000;
		frames = 0;
	}
	if (new Date().getTime() - spawnTimer > 1000 - survivalTime/100) {
		spawnTimer += 1000 - survivalTime/100;
		enemies.push(new Enemy());
	}
	if (keystate[keys.P]) window.requestAnimationFrame(checkPaused);
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
	ctx.fillText(getSurvivalTime(survivalTime), WIDTH/2, 100);

	ctx.restore();
}

function checkPaused() {
	if (keystate[keys.R]) {
		spawnTimer = new Date().getTime();
		lastTime = new Date().getTime();
		loop();
	}
	else window.requestAnimationFrame(checkPaused);
}

function getSurvivalTime(time) {
	var minutes = (Math.floor(time/60000));
	var seconds = ("0" + Math.floor((time % 60000) / 1000)).slice(-2);
	var centiseconds = ("0" + Math.floor(((time % 60000) % 1000) / 10)).slice(-2);
	return minutes+":"+seconds+"."+centiseconds;
}

main();