'use strict'

/*
 * kamina.js
 * syntactic sugar for your soul
 * cojam.ru, 2017
 */

/*
 * Объекты-функции (хз как обозвать, пускай так будет пока) для создания/преобразования
 * .qs() - короткая замена квериселекторам
 * .xss() - небольшая защита строки от XSS
 * .link() - создание ссылки
 * .elem() - создание элемента
 */

var $make = {
	qs: function(qS, options) {
		if (!options) options = []
		if (options.indexOf('a') > -1)
			return document.querySelectorAll(qS)
			else return document.querySelector(qS)
	},
	xss: function(value) {
		return value.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&#34;')
	},
	elem: function(what, content, cls, options) {
		var elem = document.createElement(what)

		if (!options) options = []
		if (!content) content = ''

		if (content && options.indexOf('s') > -1)
			elem.innerHTML = this.xss(content)
			else elem.innerHTML = content

		if (cls) elem.setAttribute('class', cls)

		if (options.indexOf('html') > -1)
			return elem.outerHTML
			else return elem
	},
	link: function(link, content, options) {
		var a = this.elem('a')

		if (link)
			a.setAttribute('href', this.xss(link))
			else a.setAttribute('href', 'javascript:void(0);')

		if (link.indexOf('http') > -1) a.setAttribute('target', '_blank')

		if (!options) options = []
		if (options.indexOf('e') > -1) a.setAttribute('rel', 'nofollow noopener')
		if (options.indexOf('s') > -1)
			a.innerHTML = this.xss(content)
			else a.innerHTML = content

		if (options.indexOf('html') > -1)
			return a.outerHTML
			else return a
	}
}

/*
 * Объекты-функции для разного рода проверок
 * .debug() - проверка на место работы
 * .get() - проверка URL-параметров (отсюда https://stackoverflow.com/a/979996)
 */

var $check = {
	debug: function() {
		switch (location.hostname) {
			case '127.0.0.1':
			case 'localhost':
				return true
		}
		return false
	},
	get: function(value) {
		var
			loc = location.search,
			parts = '', nv = '', params = []

		if (loc) {
			parts = loc.substring(1).split('&')
			parts.forEach(function(part) {
				nv = part.split('=')
				if (!nv[0]) return
				params[nv[0]] = nv[1] || true
			})
		}

		if (params[value])
			return params[value]
			else return false
	}
}

/*
 * Объекты-функции для локального хранилища
 * .test() - тестирование на включенность-выключенность
 */

var $ls = {
	get: function(item) {
		return localStorage.getItem(item)
	},
	set: function(item, value) {
		localStorage.setItem(item, value); return
	},
	rm: function(item) {
		localStorage.removeItem(item); return
	},
	test: function() {
		var test = 'ls_test'
		try {
			this.set(test, test)
			this.rm(test)
			return true
		} catch(e) {
			return false
		}
	}
}
