/*
 * Оригинальный скрипт:
 * https://github.com/nicholas-c/canvas-snow
 */

;(() => {
	'use strict';

	let
		particleCount  = 350,
		particleMax    = 500,
		particleSize   = 1,
		particleSpeed  = 1,
		shadow         = true,
		shadowColor    = 'rgba(33, 33, 33, .25)',
		color          = '#fff',
		sky            = document.body,
		canvas         = document.createElement('canvas'),
		ctx            = canvas.getContext('2d'),
		width          = sky.clientWidth,
		height         = sky.clientHeight,
		active         = false,
		snowflakes     = [],
		snowflake

	canvas.style.position = 'absolute'
	canvas.style.pointerEvents = 'none'
	canvas.style.zIndex = 101
	canvas.style.left = canvas.style.right = canvas.style.bottom = canvas.style.top = '0'

	let snowflakeF = function() {
		this.x = this.y = this.vy = this.vx = this.r = 0

		this.reset = function() {
			this.x = Math.random() * width
			this.y = Math.random() * -height
			this.vy = ((1 + Math.random()) / 2) * particleSpeed
			this.vx = 0.5 - Math.random()
			this.r = 1 + Math.random() * particleSize
			this.o = 0.5 + Math.random() * 0.5
		}
	}

	for (let i = 0; i < particleMax; i++) {
		snowflake = new snowflakeF()
		snowflake.reset()
		snowflakes.push(snowflake)
	}

	let update = () => {
		ctx.clearRect(0, 0, width, height)

		if (!active) { return }

		for (let i = 0; i < particleCount; i++) {
			snowflake = snowflakes[i]
			snowflake.y += snowflake.vy
			snowflake.x += snowflake.vx

			ctx.globalAlpha = snowflake.o
			ctx.beginPath()
			ctx.arc(snowflake.x, snowflake.y, snowflake.r, 0, Math.PI * 2, false)
			ctx.closePath()
			ctx.fill()

			if (snowflake.y > height) { snowflake.reset() }
		}

		requestAnimationFrame(update)
	}

	let onResize = () => {
		width = sky.clientWidth
		height = sky.clientHeight
		canvas.width = width
		canvas.height = height
		ctx.fillStyle = color

		if (shadow === true) {
			ctx.shadowOffsetX = ctx.shadowOffsetY = 0
			ctx.shadowBlur = 5
			ctx.shadowColor = shadowColor
		}

		let wasActive = active
		active = true

		if (!wasActive && active) { requestAnimationFrame(update) }
	}

	window.addEventListener('DOMContentLoaded', onResize)
	window.addEventListener('resize', onResize)

	sky.appendChild(canvas)
})()
