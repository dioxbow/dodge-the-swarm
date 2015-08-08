function Player(x, y, speed) {
	this.x = x;
	this.y = y;
	this.xvel = 0;
	this.yvel = 0;
	this.speed = speed;

	this.calculateVelocity = function() {
		var theta = Math.atan2((player.y - this.y), (player.x - this.x))
		this.xvel = this.speed * Math.cos(theta);
		this.yvel = this.speed * Math.sin(theta);
	}

	this.realUpdate = function() {
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
		if (this.x + Player.size > WIDTH) this.x = WIDTH - Player.size;
		if (this.y < 0) this.y = 0;
		if (this.y + Player.size > HEIGHT) this.y = HEIGHT - Player.size;

		if (mouseClicked) {
			mouseClicked = false;
			bullets.push(new Bullet(this.xvel, this.yvel, this.x+(Player.size-Bullet.size)/2, this.y+(Player.size-Bullet.size)/2, mouseX, mouseY));
		}
	}

	this.ghostUpdate = function() {
		this.calculateVelocity();
		this.x += this.xvel;
		this.y += this.yvel;
	}

	this.draw = function() {
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(this.x, this.y, Player.size, Player.size);
		ctx.restore();
	}

}