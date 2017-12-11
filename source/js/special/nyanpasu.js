'use strict'

/*
 * Nyanpasu~
 */

;(() => {
	let
		nyanpasu = new Audio('/files/other/nyanpasu.opus'),
		nyanpasuBtn = $create.elem('button', '', 'nyanpasu')

	nyanpasu.preload = 'auto'
	nyanpasu.volume = '.4'

	nyanpasu.onerror = e => {
		nyanpasuBtn.style.display = 'none'
	}

	nyanpasuBtn.onclick = e => {
		let _btn = e.target

		if (nyanpasu.paused) {
			nyanpasu.load()
			nyanpasu.oncanplay = e => {
				nyanpasu.play()
				_btn.classList.add('active')
			}
			nyanpasu.onended = e => {
				_btn.classList.remove('active')
			}
		} else { return }
	}

	document.body.appendChild(nyanpasuBtn)
})()
