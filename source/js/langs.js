'use strict'

/*
 * Локализуемые строки
 */

var trStrings = {
	'site_description': {
		'ru': 'Мультимедийный портал для поклонников азиатской культуры всех жанров и типов',
		'en': 'Russian multimedia portal for Asian culture fans of all genres and types'
	},
	'support': {
		'ru': 'Поддержать проект',
		'en': 'Support us'
	},
	'about': {
		'ru': 'О проекте',
		'en': 'About us'
	},
	'ext_chrome': {
		'ru': 'Расширение для Chrome',
		'en': 'Extension for Chrome'
	},
	'ext_opera': {
		'ru': 'Расширение для Opera',
		'en': 'Extension for Opera'
	},
	'radio': {
		'ru': 'Радио',
		'en': 'Radio'
	},
	'anime': {
		'ru': 'Аниме',
		'en': 'Anime'
	},
	'msk_time_note': {
		'ru': 'Время московское',
		'en': 'Moscow time'
	},
	'local_time_note': {
		'ru': 'Местное время',
		'en': 'Local time'
	},
	'request_music': {
		'ru': 'Реквест музыки',
		'en': 'Music request'
	},
	'request_anime': {
		'ru': 'Реквест аниме',
		'en': 'Anime request'
	},
	'err_ls': {
		'ru': 'В вашем браузере отключено сохранение данных для нашего сайта, и из-за этого он не может нормально функционировать.'
	},
	'err_ls_pls': {
		'ru': 'Пожалуйста, включите его.',
		'en': 'Please, enable it.'
	},
	'err_end': {
		'ru': 'У нас круто, и это определённо будет стоить затрачанных усилий.',
		'en': 'It\'s cool here, and it\'ll be tottaly worth it.'
	},
	'err_api': {
		'ru': 'API сайта недоступно',
		'en': 'Site API is unavailable'
	},
	'err_api_radio': {
		'ru': 'Сервер радио недоступен',
		'en': 'Radio server is unavailable'
	},
	'tnx': {
		'ru': 'Спасибо',
		'en': 'Thank you'
	},
	'song_search': {
		'ru': 'Поиск трека',
		'en': 'Search for a song'
	},
	'song_current': {
		'ru': 'Трек в эфире',
		'en': 'Song on air'
	},
	'song_current_track': {
		'ru': 'Трек',
		'en': 'Song'
	},
	'song_current_artist': {
		'ru': 'Исполнитель',
		'en': 'Artist'
	},
	'playlist_dl': {
		'ru': 'Слушать во внешнем плеере',
		'en': 'Download playlist'
	},
	'prev_songs': {
		'ru': 'Ранее в эфире',
		'en': 'Previously on air'
	},
	'player_autostart': {
		'ru': 'Запускать плеер при загрузке страницы',
		'en': 'Automatically turn on player after page loaded'
	},
	'radio_station': {
		'ru': 'Станция',
		'en': 'Station'
	},
	'airs_schedule': {
		'ru': 'Расписание прямых эфиров',
		'en': 'Scheldue of LIVE airs'
	},
	'empty_schedule': {
		'ru': 'Расписание пустое',
		'en': 'Scheldue is empty'
	},
	'rj_current': {
		'ru': 'Ведущий в эфире',
		'en': 'RJ is on air'
	},
	'listeners_current': {
		'ru': 'Количество слушателей',
		'en': 'Listeners currently'
	},
	'latest_check': {
		'ru': 'Последняя проверка',
		'en': 'Latest check'
	},
	'vk_com': {
		'ru': 'Сообщество Asian Wave в VK',
		'en': 'Asian Wave community on VK'
	},
	'vk_repost': {
		'ru': 'Репост',
		'en': 'Repost'
	},
	'noti': {
		'ru': 'Оповещение',
		'en': 'Notification'
	},
	'noti_hide': {
		'ru': 'Скрыть оповещение',
		'en': 'Hide notification'
	},
	'hide': {
		'ru': 'Скрыть',
		'en': 'Hide'
	},
	'noti_ls_err': {
		'ru': 'Внимание! У Вас отключено хранение данных, поэтому скрытие оповещения запомиинаться не будет.',
		'en': 'Attention! You don\'t have data saving enables, so you\'ll see notification even if you close it before.'
	},
	'tab_chat': {
		'ru': 'Чат',
		'en': 'Chat'
	},
	'tab_sched': {
		'ru': 'Расписание',
		'en': 'Schedule'
	},
	'tab_news': {
		'ru': 'Новости',
		'en': 'News'
	},
	'tabs_hide': {
		'ru': 'Скрыть боковую панель',
		'en': 'Hide sidebar'
	},
	'tabs_show': {
		'ru': 'Показать боковую панель',
		'en': 'Show sidebar'
	},
	'within': {
		'ru': 'Далее',
		'en': 'Starts'
	},
	'now': {
		'ru': s => `Сейчас (ещё ${s})`,
		'en': s => `Now (${s} left)`
	},
	'play': {
		'ru': 'Играть',
		'en': 'Play'
	},
	'change_volume': {
		'ru': 'Смена громкости',
		'en': 'Change volume'
	}
}

/*
 * Функция, возвращающая значение запрашиваемой строки из переменной trStrings
 * У некоторых объектов, являющихся своеобразными "шаблонами" (например now), возвращается функция. В этом случае следует делать вызов следующим образом:
 * getString('now')('час') -> "Сейчас (ещё час)"`
 */

var getString = s => {
	let userLang = 'ru', tr = ''
	if ($ls.test()) userLang = $ls.get('aw_l10n') || 'ru'

	try {
		if (!Object.keys(trStrings[s]).includes(userLang)) { throw 42 }
		if (trStrings[s][userLang]) { tr = trStrings[s][userLang] }
	} catch (e) {
		if (trStrings[s] && trStrings[s]['ru']) { tr = trStrings[s]['ru'] }
	}

	return tr
}

;(() => {
	/*
	 * @TODO сделать поддержку шаблонов (например, с помощью дополнительного аттрибута "data-lang-var")
	 */

	let l10nErr = s => console.warn(`Ошибка: cтрока "${s}" не переведена или неправильно используется`)

	/*
	 * Поиск HTML-элементов для локализации
	 * Элементы должны иметь аттрибут "data-lang" со нужным значением из переменной trStrings
	 */

	try {
		let elems = $make.qs('[data-lang]', ['a'])

		elems = Array.from(elems)
		elems.forEach(elem => {
			let string = getString(elem.dataset.lang)
			if (string && string != '' && typeof string != 'function') {
				elem.textContent = string
			} else { l10nErr(elem.dataset.lang) }
		})
	} catch (e) {}

	/*
	 * Поиск HTML-элементов для локализации их аттрибутов "title"
	 * Элементы должны иметь аттрибут "data-lang-title" со нужным значением из переменной trStrings
	 */

	try {
		let elemsTitle = $make.qs('[data-lang-title]', ['a'])

		elemsTitle = Array.from(elemsTitle)
		elemsTitle.forEach(elem => {
			let string = getString(elem.dataset.langTitle)
			if (string && string != '' && typeof string != 'function') {
				elem.setAttribute('title', string)
			} else { l10nErr(elem.dataset.langTitle) }
		})
	} catch (e) {}

	/*
	 * Поиск HTML-элементов для локализации их аттрибутов "aria-label"
	 * Элементы должны иметь аттрибут "data-lang-label" со нужным значением из переменной trStrings
	 */

	try {
		let elemsTitle = $make.qs('[data-lang-label]', ['a'])

		elemsTitle = Array.from(elemsTitle)
		elemsTitle.forEach(elem => {
			let string = getString(elem.dataset.langLabel)
			if (string && string != '' && typeof string != 'function') {
				elem.setAttribute('aria-label', string)
			} else { l10nErr(elem.dataset.langLabel) }
		})
	} catch (e) {}
})()
