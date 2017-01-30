'use strict';

function _elem(querySelector) {return document.querySelector(querySelector)}
function _elems(querySelector) {return document.querySelectorAll(querySelector)}
// function _ls(ls_item) {return localStorage.getItem(ls_item)}
// function _ls_rm(ls_item) {return localStorage.removeItem(ls_item)}
// function _ls_set(ls_item, ls_item_var) {return localStorage.setItem(ls_item, ls_item_var)}
// function _extLink(link, text) {return '<a href="' + link.toString() + '" target="_blank" rel="nofollow noopener">' + text.toString() + '</a>'}

function makeTabs(selector) {
	var tab_lists_anchors = _elems(selector + ' li'), divs = _elem(selector + '_tabs').querySelectorAll('div[id*="tab_"]');
	for (var i = 0; i < tab_lists_anchors.length; i++) {
		if (tab_lists_anchors[i].classList.contains('active')) {
			divs[i].style.display = 'block';
		}
	}

	for (i = 0; i < tab_lists_anchors.length; i++) {
			_elems(selector + ' li')[i].addEventListener('click', function(e) {

			for (i = 0; i < divs.length; i++) {
				divs[i].style.display = 'none';
			}
			for (i = 0; i < tab_lists_anchors.length; i++) {
				tab_lists_anchors[i].classList.remove('active');
			}

			var clicked_tab = e.target || e.srcElement;

			clicked_tab.classList.add('active');
			var div_to_show = '#tab_' + clicked_tab.dataset.tab;

			_elem(div_to_show).style.display = 'block';
		});
	}
}

makeTabs('.tabs');

var songsBox = _elem('.songs'), stream_port = 7934,
		mr24url = 'myradio24.com', mr24api = 'https://'+mr24url+'/users/'+stream_port+'/status.json';

function loadInfo() {
	if (self.fetch) {
		window.fetch(mr24api+'?ts='+Date.now()).then(function(response) {
			if (response.status !== 200) {
				//songsBox.innerHTML = '<tbody><tr><td>Сервер радио временно недоступен.</tr></td></tbody>';
				return;
			}
			response.json().then(function(data) {
				var rEl = '.r-info ', fullsong = data['song'].split(' - '), rRJ = '';

				switch (data['djname']) {
					case 'Auto-DJ':
						break;
					default:
					rRJ = data['djname'];
				}

				_elem(rEl + '.rj').textContent = rRJ;
				_elem(rEl + '.artist').textContent = fullsong[0];
				_elem(rEl + '.track').textContent = fullsong[1];
			});
		});
	} else {
		//songsBox.innerHTML = '<tbody><tr><td>Вы используете устаревший браузер!</tr></td></tbody>';
		clearInterval(aw_timer);
	}
}

loadInfo();

var aw_timer = setInterval(function(){
	loadInfo();
}, 15000);
