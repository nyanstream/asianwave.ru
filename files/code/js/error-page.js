'use strict'

;(() => {
	let siteName = document.currentScript.dataset.site

	/*
	 * @TODO разобраться с выводом ошибок
	 */

	if (window.self != window.top) {
		document.querySelector('.undefined').style.display = 'initial'; return
	}

	fetch(document.URL)
		.then(response => {
			document.title = document.title + ' ' + response.status
			switch (response.status) {
				case 404:
					document.querySelector('.err-404').style.display = 'initial'; break
				case 403:
					document.querySelector('.err-403').style.display = 'initial'; break
				case 200:
				default:
					document.querySelector('.undefined').style.display = 'initial'; break
			}
		})
})()
