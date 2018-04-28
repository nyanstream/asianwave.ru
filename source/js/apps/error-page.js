'use strict'

;(() => {
	let undefinedBlock = document.querySelector('main[data-error="undefined"]')

	if (window.self != window.top) {
		undefinedBlock.style.display = 'initial'; return
	}

	fetch(document.URL)
		.then(response => {
			let status = response.status

			document.title = document.title + ' ' + status

			switch (status) {
				case 403:
				case 404:
					document.querySelector(`main[data-error='${status}']`).style.display = 'initial'; break
				case 200:
				default:
					undefinedBlock.style.display = 'initial'; break
			}
		})
})()
