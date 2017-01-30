'use strict';

console.info('Используйте эту консоль с осторожностью!');

function _elem(querySelector) {return document.querySelector(querySelector)}
function _xss(value) {return value.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&#34;")}
function _extLink(link, text) {return '<a href="' + _xss(link) + '" target="_blank" rel="nofollow noopener">' + _xss(text) + '</a>'}

/*
	* функция для склонения слов от числительных.
	* Взято здесь: https://gist.github.com/ivan1911/5327202#gistcomment-1669858.
*/

function declOfNum(number, titles) {
	var titles, number = Math.abs(number), cases = [2, 0, 1, 1, 1, 2];
	return number + ' ' + titles[(number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5]];
}

/*
 * Детект хрома
*/

var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
		isOpera = /OPR\//.test(navigator.userAgent),
		chrExtBtn = _elem('.right-panel [href*="--chrome"]');

if (!isChrome) { chrExtBtn.style.display = 'none'; }
if (isOpera) {
	chrExtBtn.querySelector('.icon').classList.remove('icon-chrome');
	chrExtBtn.querySelector('.icon').classList.add('icon-opera');
	chrExtBtn.setAttribute('href', '/app--opera');
	chrExtBtn.setAttribute('title', 'Раширение для Opera');
}

/*
	* Смена бекграундов
*/

;(function changeBckg(){
	var awlogo = _elem('.brand img[alt="logo"]'),	e = 9, bckgsFolder = '/files/img/radio-bckgs/';

	document.body.style.backgroundImage = 'url(' + bckgsFolder +  Math.floor(Math.random()*e + 1) + '.jpg)';

	awlogo.addEventListener('click', changeBckg);
})();

/*
	* Инициация виджета ВК
*/

var VK, vkElem = _elem('#vk_group');

if (VK) {
	VK.Widgets.Group("vk_group", {mode: 2, width: 350, height: 420, color3: '628CC5'}, 120842574);
} else {
	vkElem.classList.add('text-place');
	vkElem.style.textAlign = 'center';
	vkElem.innerHTML = '<p>Подписывайтесь на ' + _extLink('https://vk.com/awaveradio', 'наше сообщество ВК') + ', чтобы быть в курсе всех новостей!</p>';
}
//VK.Widgets.Group("vk_group", {mode: 2, width: "250", height: "550"}, 120842574);

/*
	* Блок последних песен и виджет заказа треков
*/

var mr24url_1 = 'myra', mr24url_2 = 'dio24.c', mr24url_3 = 'om',
		mr24url = mr24url_1 + mr24url_2 + mr24url_3;

var songsBox = _elem('.songs'), stream_port = 7934,
		mr24api = 'https://' + mr24url + '/users/' + stream_port + '/status.json';

function loadInfo() {
	if (self.fetch) {
		window.fetch(mr24api + '?ts=' + Date.now()).then(function(response) {
			if (response.status !== 200) {
				songsBox.innerHTML = '<tbody><tr><td>Сервер радио временно недоступен.</tr></td></tbody>';
				return;
			}
			response.json().then(function(data) {
				var songsData = data['songs'].reverse(),	tableBody = '';
				for (var i = 0; i < (songsData.length - 1) / 2; i++) {
					var sdata = '<tr><td class="awd--time">' + _xss(songsData[i][0]) + '</td><td class="awd--fullsong">' + _xss(songsData[i][1]) + '</td></tr>';
					tableBody += sdata;
				}
				//console.log(songsData.length);
				//songsBox.innerHTML = '<tbody><caption>Последние песни:</caption><tr><th>Время</th><th>Трек</th></tr>' + tableBody + '</tbody>';
				songsBox.innerHTML = '<caption>Последние песни:</caption><tbody>' + tableBody + '</tbody>';

				var qenable = data['enabletable'], awrj = data['djname'], songsqueue = data['turntable'], orderBox = document.querySelector('.order-box'), orderQueue = document.querySelector('.order-box .queue'), zkzd = '</span> зака';

				//var qenable = 1, songsqueue = 20, awrj = '1'; //debuh

				if (qenable = '1' && awrj != 'Auto-DJ') {
					orderBox.style.display = 'block';
					orderBox.setAttribute('href', 'https://' + mr24url + '/?to=table&port=' + stream_port);
					switch (songsqueue) {
						case 0:
							orderQueue.textContent = 'заказов нет';
							break;
						default:
							orderQueue.innerHTML = '<span class="awd--queue">' + _xss(declOfNum(songsqueue, [zkzd+'з', zkzd+'за', zkzd+'зов']));
					}
				} else {
					orderBox.style.display = 'none';
					orderBox.setAttribute('href', 'javascript:void(0);');
				}
			});
		});
	} else {
		songsBox.innerHTML = '<tbody><tr><td>Вы используете устаревший браузер!</tr></td></tbody>';
		clearInterval(aw_timer);
	}
}

document.addEventListener('DOMContentLoaded', loadInfo);
var aw_timer = setInterval(loadInfo, 30000);
