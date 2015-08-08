/*
BUGS:
 - does not detect keyup if mouse has right clicked and not "closed" options menu
*/

var WIDTH=800, HEIGHT=WIDTH*9/16;
var running=false, ready=true;
var frames, fps, secTimer, lastTime, survivalTime=0, spawnTimer, minutes, seconds, centiseconds;
var canvas, ctx, keystate, mouseClicked=false, mouseY, mouseY;
var keys  = {left: 37, up: 38, right: 39, down: 40, W: 87, A: 65, S: 83, D: 68, space: 32, P: 80, R: 82};
var bullets, enemies;
var player = {
	size: 20,
	x: null,
	y: null,
	xvel: null,
	yvel: null,
	speed: 2,

	update: function() {
		this.xvel = 0;
		this.yvel = 0;

		if (keystate[keys.up] || keystate[keys.W]) this.yvel -= this.speed;
		if (keystate[keys.down] || keystate[keys.S]) this.yvel += this.speed;
		if (keystate[keys.left] || keystate[keys.A]) this.xvel -= this.speed;
		if (keystate[keys.right] || keystate[keys.D]) this.xvel += this.speed;

		if (Math.abs(this.xvel) + Math.abs(this.yvel) > this.speed) {
			this.xvel = this.xvel / Math.sqrt(2);
			this.yvel = this.yvel / Math.sqrt(2);
		}

		this.x += this.xvel;
		this.y += this.yvel;

		if (this.x < 0) this.x = 0;
		if (this.x + this.size > WIDTH) this.x = WIDTH - this.size;
		if (this.y < 0) this.y = 0;
		if (this.y + this.size > HEIGHT) this.y = HEIGHT - this.size;

		if (mouseClicked) {
			mouseClicked = false;
			bullets.push(new Bullet(this.xvel, this.yvel, this.x+(this.size-Bullet.size)/2, this.y+(this.size-Bullet.size)/2, mouseX, mouseY));
		}
	},
	draw: function() {
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(this.x, this.y, this.size, this.size);
		ctx.restore();
	}
};

var playerGhost = {
	size: 20,
	x: null,
	y: null,
	xvel: null,
	yvel: null,
	speed: 1,

	calculateVelocity: function() {
		var theta = Math.atan2((player.y - this.y), (player.x - this.x))
		this.xvel = this.speed * Math.cos(theta);
		this.yvel = this.speed * Math.sin(theta);
	},

	update: function() {
		this.calculateVelocity();
		this.x += this.xvel;
		this.y += this.yvel;
	},

	draw: function() {
		ctx.save();
		ctx.strokeStyle = "#0000ff";
		ctx.lineWidth = 2;
		ctx.strokeRect(this.x, this.y, this.size, this.size);
		ctx.restore();
	}
};

function Bullet(xvel, yvel, x0, y0, x1, y1) {
	this.x = x0;
	this.y = y0;
	this.xvel = xvel;
	this.yvel = yvel;
	this.active = true;

	this.calculateVelocity = function() {
		var theta = Math.atan2((y1 - y0), (x1 - x0));
		this.xvel += Bullet.speed * Math.cos(theta);
		this.yvel += Bullet.speed * Math.sin(theta);
	}
	this.calculateVelocity();

	this.update = function() {
		if (this.x > WIDTH || this.x < -Bullet.size || this.y < -Bullet.size || this.y > HEIGHT) this.active = false;
		if (this.active) {
			this.x += this.xvel;
			this.y += this.yvel;
		}
	}

	this.draw = function() {
		if (this.active) {
			ctx.save();
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(this.x, this.y, Bullet.size, Bullet.size);
			ctx.restore();
		}
	}
}

function Enemy(x, y) {
	this.x = x;
	this.y = y;
	this.xvel = null;
	this.yvel = null;
	this.active = true;

	this.isCollision = function(x, y, size) {
		return x<this.x+Enemy.size && y<this.y+Enemy.size && this.x<x+size && this.y<y+size;
	}

	this.calculateVelocity = function() {
		if (this.active) {
			var theta = Math.atan2((playerGhost.y - this.y), (playerGhost.x - this.x))
			this.xvel = Enemy.speed * Math.cos(theta);
			this.yvel = Enemy.speed * Math.sin(theta);
		}
	}

	this.update = function() {
		if (this.active) {
			for (var i = 0; i < bullets.length; i++) {
				if (bullets[i].active && this.active && this.isCollision(bullets[i].x, bullets[i].y, Bullet.size)) {
					this.active = false;
					bullets[i].active = false;
				}
			}
			if (this.active && this.isCollision(player.x, player.y, player.size)){
				running = false;
			}

			this.calculateVelocity();
			this.x += this.xvel;
			this.y += this.yvel;
		}
	}

	this.draw = function() {
		if (this.active) {
			ctx.save();
			ctx.fillStyle = "#ff0000";
			ctx.fillRect(this.x, this.y, Enemy.size, Enemy.size);
			ctx.restore();
		}
	}
}

function main() {
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

	init();
}

function init() {
	player.x = (WIDTH - player.size) / 2;
	player.y = (HEIGHT - player.size) / 2;
	player.xvel = 0;
	player.yvel = 0;

	playerGhost.x = (WIDTH - player.size) / 2;
	playerGhost.y = (HEIGHT - player.size) / 2;
	playerGhost.xvel = 0;
	playerGhost.yvel = 0;

	bullets = [];
	Bullet.size = 5;
	Bullet.speed = 6;

	enemies = [];
	Enemy.size = 20;
	Enemy.speed = 1;

	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.save();
	ctx.fillStyle = "#ffffff";
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
		ctx.font = "30px Verdana, sans-serif";
		ctx.fillText("You died at", WIDTH/2, 45);
		ctx.font = "50px Verdana, sans-serif";
		ctx.fillText(minutes+":"+seconds+"."+centiseconds, WIDTH/2, 100);
		ctx.fillStyle = "#ffffff";
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
	survivalTime += (new Date().getTime() - lastTime);
	lastTime = new Date().getTime();
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
		var loc = Math.random() * 2 * (WIDTH + HEIGHT);
		if (loc < WIDTH) enemies.push(new Enemy(loc, -Enemy.size));
		else if (loc < WIDTH + HEIGHT) enemies.push(new Enemy(WIDTH, loc - WIDTH));
		else if (loc < 2 * WIDTH + HEIGHT) enemies.push(new Enemy(loc - (WIDTH + HEIGHT), HEIGHT));
		else enemies.push(new Enemy(-Enemy.size, loc - (2 * WIDTH + HEIGHT)));
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
	player.update();
	playerGhost.update();
}

function render() {
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.save();

	ctx.fillStyle = "#ffffff";
	/*ctx.font = "10px Verdana, sans-serif";
	ctx.textAlign = "end";
	ctx.fillText(fps + " fps ", WIDTH, 12);*/

	for (var i = 0; i < bullets.length; i++) {
		bullets[i].draw();
	}
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].draw();
	}
	//playerGhost.draw();
	player.draw();

	minutes = (Math.floor(survivalTime/60000));
	seconds = ("0" + Math.floor((survivalTime % 60000) / 1000)).slice(-2);
	centiseconds = ("0" + Math.floor(((survivalTime % 60000) % 1000) / 10)).slice(-2);
	ctx.font = "50px Verdana, sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(minutes+":"+seconds+"."+centiseconds, WIDTH/2, 100);

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

main();