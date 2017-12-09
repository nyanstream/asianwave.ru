'use strict'

/*
 * Nyanpasu~
 */

;(() => {
	let nyanpasu = new Audio('/files/other/nyanpasu.opus')
	nyanpasu.preload = 'auto'
	nyanpasu.volume = '.4'

	let nyanpasuBtn = $create.elem('button', '', 'nyanpasu')
	nyanpasuBtn.onclick = e => {
		let _btn = e.target

		if (nyanpasu.paused) {
			nyanpasu.load()
			nyanpasu.oncanplay = e => {
				e.target.play()
				_btn.classList.add('active')
			}
			nyanpasu.onended = e => {
				e.currentTime = 0
				_btn.classList.remove('active')
			}
		} else { return }
	}

	document.body.appendChild(nyanpasuBtn)
})()
