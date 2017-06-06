'use strict'

let trStrings = {
	'site_description': {
		'ru': 'Мультимедийный портал для поклонников азиатской культуры всех жанров и типов',
		'en': 'Russian multimedia portal for Asian culture fans of all genres and types'
	},
	'support': {
		'ru': 'Поддержать проект'
	},
	'ext_chrome': {
		'ru': 'Расширение для Chrome'
	},
	'ext_opera': {
		'ru': 'Расширение для Opera'
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
		'ru': 'Реквест музыки'
	},
	'request_anime': {
		'ru': 'Реквест аниме'
	},
	'err_ls': {
		'ru': 'В вашем браузере отключено сохранение данных для нашего сайта, и из-за этого он не может нормально функционировать.'
	},
	'err_ls_pls': {
		'ru': 'Пожалуйста, включите его.'
	},
	'err_end': {
		'ru': 'У нас круто, и это определённо будет стоить затрачанных усилий.'
	},
	'err_api': {
		'ru': 'API сайта недоступно'
	},
	'err_api_radio': {
		'ru': 'Ошибка сервера радио'
	},
	'tnx': {
		'ru': 'Спасибо',
		'en': 'Thank you'
	},
	'song_search': {
		'ru': 'Поиск трека'
	},
	'song_current': {
		'ru': 'Трек в эфире'
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
	'past_songs': {
		'ru': 'Ранее в эфире'
	},
	'player_autostart': {
		'ru': 'Запускать плеер при загрузке страницы'
	},
	'airs_schedule': {
		'ru': 'Расписание прямых эфиров'
	},
	'rj_current': {
		'ru': 'Ведущий в эфире'
	},
	'listeners_current': {
		'ru': 'Количество слушателей'
	},
	'latest_update': {
		'ru': 'Последнее обновление'
	},
	'vk_com': {
		'ru': 'Сообщество Asian Wave в VK'
	},
	'vk_repost': {
		'ru': 'Репост'
	},
	'noti': {
		'ru': 'Оповещение'
	},
	'noti_close': {
		'ru': 'Скрыть оповещение'
	},
	'close': {
		'ru': 'Скрыть'
	},
	'noti_ls_err': {
		'ru': 'Внимание! У вас отключено хранение данных, поэтому скрытие оповещения запомиинаться не будет.'
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
	'close_tabs': {
		'ru': 'Скрыть боковую панель'
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

	if (elems) elems.forEach((elem) => { if (elem.dataset.langNo != '') elem.textContent = getString(elem.dataset.lang) })

	if (elemsTitle) elemsTitle.forEach((elem) => { if (elem.dataset.langNo != '') elem.setAttribute('title', getString(elem.dataset.langTitle)) })
})()
