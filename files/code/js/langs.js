'use strict'

let trStrings = {
	'site_description': {
		'ru': 'Мультимедийный портал для поклонников азиатской культуры всех жанров и типов',
		'en': 'Russian multimedia portal for Asian culture fans of all genres and types'
	},
	'support': {
		'ru': 'Поддержать проект',
		'en': 'Support us'
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
		'en': 'Site API unavailable'
	},
	'err_api_radio': {
		'ru': 'Ошибка сервера радио',
		'en': 'Radio server error'
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
		'ru': 'Слушать во внешнем плеере'
	},
	'prev_songs': {
		'ru': 'Ранее в эфире',
		'en': 'Previously on air'
	},
	'player_autostart': {
		'ru': 'Запускать плеер при загрузке страницы',
		'en': 'Automatically turn on player after page loaded'
	},
	'airs_schedule': {
		'ru': 'Расписание прямых эфиров',
		'en': 'Scheldue of LIVE airs'
	},
	'rj_current': {
		'ru': 'Ведущий в эфире',
		'en': 'RJ is on air'
	},
	'listeners_current': {
		'ru': 'Количество слушателей',
		'en': 'Listeners currently'
	},
	'latest_update': {
		'ru': 'Последнее обновление',
		'en': 'Latest update'
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
	'noti_close': {
		'ru': 'Скрыть оповещение'
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
	}
}

function getString(string) {
	let userLang = 'ru'
	if ($ls.test()) userLang = $ls.get('aw_lang') || 'ru'

	let	tr = trStrings[string][userLang]

	if (!tr) return trStrings[string]['ru']

	return tr
}

;(() => {
	let
		elems = $make.qs('[data-lang]', ['a']),
		elemsTitle = $make.qs('[data-lang-title]', ['a'])

	if (elems) Array.from(elems).forEach((elem) => { if (elem.dataset.langNo != '') elem.textContent = getString(elem.dataset.lang) })

	if (elemsTitle) Array.from(elemsTitle).forEach((elem) => { if (elem.dataset.langNo != '') elem.setAttribute('title', getString(elem.dataset.langTitle)) })
})()
