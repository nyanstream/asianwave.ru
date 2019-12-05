'use strict'

/*
 * Локализация
 * Файл зависим от core.js
 */

/*
 * Функция, возвращающая значение запрашиваемой строки из переменной trStrings
 * * *
 * У некоторых объектов, являющихся своеобразными "шаблонами" (например now), возвращается функция. В этом случае следует делать вызов следующим образом:
 * getString('now')('час') -> "Сейчас (ещё час)"
 */

let getString = s => {
	let trStrings = {
		site_description: {
			ru: 'Мультимедийный портал для поклонников азиатской культуры всех жанров и типов',
			en: 'Russian multimedia portal for Asian culture fans of all genres and types'
		},
		support: {
			ru: 'Поддержать проект',
			en: 'Support us'
		},
		about: {
			ru: 'О проекте',
			en: 'About us'
		},
		ext_chrome: {
			ru: 'Расширение для Chrome',
			en: 'Extension for Chrome'
		},
		ext_opera: {
			ru: 'Расширение для Opera',
			en: 'Extension for Opera'
		},
		radio: {
			ru: 'Радио',
			en: 'Radio'
		},
		anime: {
			ru: 'Аниме',
			en: 'Anime'
		},
		msk_time_note: {
			ru: 'Время московское',
			en: 'Moscow time'
		},
		local_time_note: {
			ru: 'Местное время',
			en: 'Local time'
		},
		request_music: {
			ru: 'Реквест музыки',
			en: 'Music request'
		},
		request_anime: {
			ru: 'Реквест аниме',
			en: 'Anime request'
		},
		err_ls: {
			ru: 'В вашем браузере отключено сохранение данных для нашего сайта, и из-за этого он не может нормально функционировать.'
		},
		err_ls_pls: {
			ru: 'Пожалуйста, включите его.',
			en: 'Please, enable it.'
		},
		err_end: {
			ru: 'У нас круто, и это определённо будет стоить затрачанных усилий.',
			en: 'It\'s cool here, and it\'ll be tottaly worth it.'
		},
		err_api: {
			ru: 'API сайта недоступно',
			en: 'Site API is unavailable'
		},
		err_api_radio: {
			ru: 'Сервер радио недоступен',
			en: 'Radio server is unavailable'
		},
		tnx: {
			ru: 'Спасибо',
			en: 'Thank you'
		},
		song_search: {
			ru: 'Поиск трека',
			en: 'Search for a song'
		},
		song_current: {
			ru: 'Трек в эфире',
			en: 'Song on air'
		},
		song_current_track: {
			ru: 'Трек',
			en: 'Song'
		},
		song_current_artist: {
			ru: 'Исполнитель',
			en: 'Artist'
		},
		playlist_dl: {
			ru: 'Слушать во внешнем плеере',
			en: 'Listen in external player'
		},
		prev_songs: {
			ru: 'Ранее в эфире',
			en: 'Previously on air'
		},
		player_autostart: {
			ru: 'Запускать плеер при загрузке страницы',
			en: 'Automatically turn on player after page loaded'
		},
		radio_station: {
			ru: 'Станция',
			en: 'Station'
		},
		airs_schedule: {
			ru: 'Расписание прямых эфиров',
			en: 'Scheldue of LIVE airs'
		},
		empty_schedule: {
			ru: 'Расписание пустое',
			en: 'Scheldue is empty'
		},
		rj_current: {
			ru: 'Ведущий в эфире',
			en: 'RJ is on air'
		},
		listeners_current: {
			ru: 'Количество слушателей',
			en: 'Listeners currently'
		},
		latest_check: {
			ru: 'Последняя проверка',
			en: 'Latest check'
		},
		vk_com: {
			ru: 'Сообщество Asian Wave в VK',
			en: 'Asian Wave community on VK'
		},
		vk_repost: {
			ru: 'Репост',
			en: 'Repost'
		},
		noti: {
			ru: 'Оповещение',
			en: 'Notification'
		},
		hide: {
			ru: 'Скрыть',
			en: 'Hide'
		},
		show: {
			ru: 'Показать',
			en: 'Show'
		},
		tab_sched: {
			ru: 'Расписание',
			en: 'Schedule'
		},
		tab_news: {
			ru: 'Новости',
			en: 'News'
		},
		sidebar_trigger: {
			ru: 'Скрыть/показать боковую панель',
			en: 'Hide or show sidebar'
		},
		within: {
			ru: 'Далее',
			en: 'Starts'
		},
		now: {
			ru: s => `Сейчас (ещё ${s})`,
			en: s => `Now (${s} left)`
		},
		play: {
			ru: 'Играть',
			en: 'Play'
		},
		change_volume: {
			ru: 'Смена громкости',
			en: 'Change volume'
		},
		player: {
			ru: 'Плеер',
			en: 'Player'
		},
		chat: {
			ru: 'Чат',
			en: 'Chat'
		},
		song_order: {
			ru: 'Заказать песню',
			en: 'Request a song'
		},
	}

	let string = ''

	if ($storage.test()) {
		switch ($storage.get(STRINGS.l10n)) {
			case 'ru':
			case 'en':
			case 'ja':
				break
			default:
				$storage.set(STRINGS.l10n, 'ru')
		}
	}

	let userLang = $storage.test()
		? $storage.get(STRINGS.l10n)
		: 'ru'

	try {
		if (!(userLang in trStrings[s]) || trStrings[s][userLang] == '') { throw 42 }

		if (trStrings[s][userLang]) {
			string = trStrings[s][userLang]
		}
	} catch (e) {
		if (trStrings[s] && trStrings[s]['ru']) {
			string = trStrings[s]['ru']
		}
	}

	return string
}

let l10n = () => {
	/*
	 * Первая буква в строке становится заглавной
	 * Отсюда: https://stackoverflow.com/a/1026087
	 */

	let capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

	let l10nErr = s => console.warn(`Ошибка: cтрока "${s}" не переведена или неправильно используется`)

	/*
	 * Поиск HTML-элементов для локализации
	 * Элементы должны иметь аттрибут "data-lang" с нужным значением из переменной trStrings
	 * TODO: сделать поддержку шаблонов (например, с помощью дополнительного аттрибута "data-lang-template")
	 */

	void (() => {
		let elems = $make.qs('[data-lang]', ['a'])

		elems.forEach(elem => {
			let string = getString(elem.dataset.lang)

			if (string && string != '' && typeof string != 'function') {
				if (elem.dataset.lang.startsWith('l10n_')) {
					let _flag = ''

					switch (elem.dataset.lang.replace('l10n_', '')) {
						case 'ru':
							_flag = '🇷🇺'; break
						case 'en':
							_flag = '🇬🇧'; break;
						case 'ja':
							_flag = '🇯🇵'; break;
					}

					string = `${_flag} ${string}`
				}

				elem.textContent = string
			} else { l10nErr(elem.dataset.lang) }
		})
	})()

	/*
	 * Функция-локализатор аттрибутов у HTML-элементов
	 * Первое значение - датасет ("data-lang-SOME", напр. "data-lang-title"), второе - локализуемый аттрибут
	 * Элементы должны иметь аттрибут "data-lang-SOME" с нужным значением из переменной trStrings
	 */

	let l10nForAttrs = (arr = []) => {
		arr.forEach(arrItem => {
			let dataAttr = arrItem[0]

			let attr = arrItem[1]

			let elems = $make.qs(`[data-lang-${dataAttr}]`, ['a'])

			elems.forEach(elem => {
				let
					elemData = `lang${capitalize(dataAttr)}`,
					string = getString(elem.dataset[elemData])

				if (string && string != '' && typeof string != 'function') {
					elem.setAttribute(attr, string)
				} else { l10nErr(elem.dataset[elemData]) }
			})
		})
	}

	l10nForAttrs([
		['title', 'title'],
		['image', 'alt'],
		['label', 'aria-label'],
	])

	/* Локализация Moment.js */

	void (() => {
		if (
			'moment' in window &&
			moment() instanceof moment &&
			'locales' in moment &&
			$storage.test()
		) {
			let momentLocales = moment.locales()

			if (momentLocales.includes('ru') && momentLocales.includes('en')) {
				moment.locale($storage.get(STRINGS.l10n))
			}
		}
	})()
}

document.addEventListener('DOMContentLoaded', () => l10n())
