'use strict'

document.addEventListener('DOMContentLoaded', () => {
	/*
	 * Добавление к локальным ссылкам расширения '.html' в режиме разработчика
	 */

	void (() => {
		if (IS_DEBUG_MODE) {
			let siteLinks = $make.qs('a[href^="/"]:not([href="/"]):not([href^="/app--"]):not([href^="/rdr--"])', ['a'])

			siteLinks.forEach(link => {
				link.setAttribute('href', `${link.getAttribute('href')}.html`)
			})
		}
	})()

	/*
	 * Установка Service Worker
	 */

	void (() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register(
				`/service-worker.min.js?v=${getInfoFromMeta('version')}`,
				{ scope: '/' }
			).then(reg => {
				if (reg.installing) {
					console.info('Service Worker увлановлен.')
				} else if(reg.waiting) {
					console.info('Service Worker устанавливается...')
				} else if(reg.active) {
					console.info('Service Worker активен.')
				}
			}).catch(e => console.warn('Установка Service Worker закончилась с ошибкой: ' + e))
		}
	})()
})
