;(function() {
	var particleCount = 350,
		particleMax   = 500,
		particleSize  = 1,
		particleSpeed = 1,
		shadow 		  = true,
		shadowColor   = 'rgba(33, 33, 33, 0.25)',
		color         = '#fff',
		sky           = document.querySelector('body'),
		canvas        = document.createElement('canvas'),
		ctx           = canvas.getContext('2d'),
		width         = sky.clientWidth,
		height        = sky.clientHeight,
		i             = 0,
		active        = false,
		snowflakes    = [],
		snowflake;

	canvas.style.position = 'absolute';
	canvas.style.pointerEvents = 'none';
	canvas.style.zIndex = 101;
	canvas.style.left = canvas.style.right = canvas.style.bottom = canvas.style.top = '0';

	var Snowflake = function () {
		this.x = 0;
		this.y = 0;
		this.vy = 0;
		this.vx = 0;
		this.r = 0;

		this.reset();
	};

	Snowflake.prototype.reset = function() {
		this.x = Math.random() * width;
		this.y = Math.random() * -height;
		this.vy = ((1 + Math.random()) / 2) * particleSpeed;
		this.vx = 0.5 - Math.random();
		this.r = 1 + Math.random() * particleSize;
		this.o = 0.5 + Math.random() * 0.5;
	};

	function generateSnowFlakes() {
		snowflakes = [];
		for (i = 0; i < particleMax; i++) {
			snowflake = new Snowflake();
			snowflake.reset();
			snowflakes.push(snowflake);
		}
	}

	generateSnowFlakes();

	function update() {
		ctx.clearRect(0, 0, width, height);

		if (!active) {
			return;
		}

		for (i = 0; i < particleCount; i++) {
			snowflake = snowflakes[i];
			snowflake.y += snowflake.vy;
			snowflake.x += snowflake.vx;

			ctx.globalAlpha = snowflake.o;
			ctx.beginPath();
			ctx.arc(snowflake.x, snowflake.y, snowflake.r, 0, Math.PI * 2, false);
			ctx.closePath();
			ctx.fill();

			if (snowflake.y > height) {
				snowflake.reset();
			}
		}

		requestAnimFrame(update);
	}

	function onResize() {
		width = sky.clientWidth;
		height = sky.clientHeight;
		canvas.width = width;
		canvas.height = height;
		ctx.fillStyle = color;

		if(shadow === true) {
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 5;
			ctx.shadowColor = shadowColor;
		}

		var wasActive = active;
		active = width > 600;

		if (!wasActive && active) {
			requestAnimFrame(update);
		}
	}

	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function() {
		return  window.requestAnimationFrame       ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
	})();

	// setTimeout(function() {
	// 	onResize();
	// }, 0)

	window.addEventListener('DOMContentLoaded', onResize);
	window.addEventListener('resize', onResize);

	sky.appendChild(canvas);
})();
