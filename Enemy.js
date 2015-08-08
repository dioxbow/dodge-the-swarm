function Enemy() {
	var loc = Math.random() * 2 * (WIDTH + HEIGHT);
	if (loc < WIDTH) {
		this.x = loc;
		this.y = -Enemy.size;
	} else if (loc < WIDTH + HEIGHT) {
		this.x = WIDTH;
		this.y = loc - WIDTH;
	} else if (loc < 2 * WIDTH + HEIGHT) {
		this.x = loc - (WIDTH + HEIGHT);
		this.y = HEIGHT;
	} else {
		this.x = -Enemy.size;
		this.y = loc - (2 * WIDTH + HEIGHT);
	}

	this.xvel = 0;
	this.yvel = 0;
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
			if (this.active && this.isCollision(player.x, player.y, Player.size)) {
				running = false;
				this.active = false;
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