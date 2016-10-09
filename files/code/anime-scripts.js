'use strict';

function _elem(querySelector) {return document.querySelector(querySelector)}
function _elemAll(querySelector) {return document.querySelectorAll(querySelector)}
function _ls(ls_item) {return localStorage.getItem(ls_item)}
function _ls_rm(ls_item) {return localStorage.removeItem(ls_item)}
function _ls_set(ls_item, ls_item_var) {return localStorage.setItem(ls_item, ls_item_var)}

/*
 * Детект поддержки флеша
*/

var hasFlash = navigator.mimeTypes["application/x-shockwave-flash"], playerElem = _elem('.player');

if (hasFlash == undefined) {
	playerElem.classList.add('noflash');
	//clearInterval(aw_timer);
}

/*
 * Тест включения локального хранилища
*/

function lsTest() {
	var ls_test = 'test';
	try {
		_ls_set(ls_test, ls_test);
		_ls_rm(ls_test);
		return true;
	} catch(e) {
		return false;
	}
}

/*
 * Скрипт создания табов (модифицированный, теперь без cсылок)
 * СпиЖЖено отсюда http://www.vikaskbh.com/flat-ui-simple-html-tabs-without-jquery-or-any-other-library/
*/

function makeTabs(selector) {
	tab_lists_anchors = document.querySelectorAll(selector + " li");
	divs = _elem(selector).querySelectorAll("div[id*='tab_']");
	for (var i = 0; i < tab_lists_anchors.length; i++) {
		if (tab_lists_anchors[i].classList.contains('active')) {
			divs[i].style.display = "block";
		}
	}

	for (i = 0; i < tab_lists_anchors.length; i++) {
			tab_lists_anchors[i].addEventListener('click', function(e) {

			for (i = 0; i < divs.length; i++) {
				divs[i].style.display = "none";
			}
			for (i = 0; i < tab_lists_anchors.length; i++) {
				tab_lists_anchors[i].classList.remove("active");
			}

			clicked_tab = e.target || e.srcElement;

			clicked_tab.classList.add('active');
			div_to_show = '#tab_' + clicked_tab.dataset.tab;

			_elem(div_to_show).style.display = "block";
		});
	}
}

/*
 * Инициация табов
*/

window.addEventListener("load", function() {
	makeTabs(".tabs");
});

/*
 * Виджет ВК
*/

var VK, tabsLi = document.querySelectorAll('.tabs ul li[data-tab]'), wheight = document.querySelector('.tabs').clientHeight - 25;
if (wheight > 1200) {
	wheight = 1200;
}

if (VK) {
	VK.Widgets.Group("vk_group", {mode: 2, width: "400", height: wheight}, 120842574);
} else {
	for (var f = 0; f < tabsLi.length; f++) {
		tabsLi[f].style.width = '50%';
	}
	tabsLi[2].style.display = 'none';
}

/*
 * Скрытие табов
*/

var closeTabsCtr = _elem('.closeTabs'), mainCont = _elem('.anime'), ctc_text = 'боковую панель';

function closeTabs() {
	if (!mainCont.classList.contains('notabs')) {
		mainCont.classList.add('notabs');
		this.textContent = '\u003C';
		this.setAttribute('title', 'Открыть ' + ctc_text)
	} else {
		mainCont.classList.remove('notabs');
		this.textContent = '\u00D7';
		this.setAttribute('title', 'Скрыть ' + ctc_text)
	}
}

closeTabsCtr.addEventListener('click', closeTabs);

/*
 * Расписание
*/

var aw_api = '/api/streams-shed.json', streamShed = _elem('.shedule');

if (location.hostname === '127.0.0.1') {
	aw_api = 'https://asianwave.ru' + aw_api;
}

function loadInfo(){
	if(self.fetch) {
		window.fetch(aw_api+'?ts='+Date.now()).then(function(response){
			if (response.status !== 200) {
				streamShed.style.display = 'none';
				return;
			}
			response.json().then(function(data) {
				var i, tableBody = '', tableBodyT = '', shedData = data, nowTime = Math.round(new Date().getTime()/1000), sdata = '', sdataT = '';

				for (i = 1; i < shedData.length - 1; i++) {
					var newShedData = moment.unix(shedData[i][0]).format('D MMMM') + '<br>' + moment.unix(shedData[i][0]).format('HH:mm') + ' &ndash; ' + moment.unix(shedData[i][1]).format('HH:mm') + '</td>', nazvaniue;

					if (shedData[i][3]) {
						nazvaniue = '<a href="'+shedData[i][3]+'" target="_blank" rel="nofollow noopener">'+shedData[i][2]+'</a>';
					} else {
						nazvaniue = shedData[i][2];
					}

					if (shedData[i][0] < nowTime && shedData[i][1] > nowTime) {
						sdata = '<tr class="air--current"><td>' + newShedData + '<td><b>Сейчас:</b><br>' + nazvaniue + '</td></tr>';
					} else if (shedData[i][1] > nowTime + (shedData[i-1][1] - shedData[i-1][0]) && shedData[i][1] < nowTime + (shedData[i][1] - shedData[i-1][0])) {
						sdata = '<tr class="air--next"><td>' + newShedData + '<td><b>Далее:</b><br>' + nazvaniue + '</td></tr>';
					} else if ((moment.unix(shedData[i][0]).dayOfYear() - moment.unix(nowTime).dayOfYear()) < -1) {
						sdata = '<tr class="air--finished air--tooOld"><td>' + newShedData + '<td>' + nazvaniue + '</td></tr>';
					} else if (shedData[i][0] < nowTime) {
						sdata = '<tr class="air--finished"><td>' + newShedData + '<td>' + nazvaniue + '</td></tr>';
					} else if (moment.unix(shedData[i][0]).dayOfYear() > moment.unix(nowTime).dayOfYear()) {
						sdata = '<tr class="air--notToday"><td>' + newShedData + '<td>' + nazvaniue + '</td></tr>';
					} else {
						sdata = '<tr><td>' + newShedData + '<td>' + nazvaniue + '</td></tr>';
					}

					tableBody += sdata;
				}

				streamShed.innerHTML = '<tbody><tr><td colspan="2"><em>Время местное.</em></td></tr>' + tableBody + '</tbody>';
			});
		});
	} else {
		streamShed.style.display = 'none';
		clearInterval(aw_timer);
	}
}

loadInfo();

var aw_timer = setInterval(function(){
	loadInfo();
}, 60000);
