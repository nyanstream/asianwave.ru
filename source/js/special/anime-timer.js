'use strict'

var scriptData = document.currentScript.dataset

document.addEventListener('DOMContentLoaded', () => {
	let time = Number(scriptData.time)

	let timeElem = document.querySelector('.time')

	let wordEndElem = document.querySelector('.end')

	let timer = setInterval(() => {
		timeElem.textContent = time

		switch (time) {
			case 3:
				wordEndElem.textContent = 'ы'; break
			case 1:
				wordEndElem.textContent = 'у'; break
			case 0:
				wordEndElem.textContent = ''
				location.replace(`https://${scriptData.domain}/?from=asianwave`)
				clearInterval(timer)
		}

		--time
	}, 1000)
})
