'use strict'

/*
 * Здесь размещаются всякие штуки для тестирования
 */

;(() => {
	let
		key = 'aw_lang',
		reason = 'Тестирование английской локализации'

	$make.qs('.brand').ondblclick = () => {
		if ($ls.test()) {
			if ($ls.get(key) != 'en') {
				$ls.set(key, 'en')
				alert(`${reason} включено`)
			} else {
				$ls.rm(key, 'en')
				alert(`${reason} отключено`)
			}
			location.reload(true)
		} else {
			alert(`Невозможно включить ${reason.toLowerCase()}, так как в браузере отключено сохранение данных`)
		}
	}
})()
