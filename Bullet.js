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