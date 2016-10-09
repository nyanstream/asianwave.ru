'use strict';

/*
	* Запрет просмотра не во фрейме
*/

if (window.self == window.top) {
	document.body.innerHTML = '<p class="noframe"><a href="https://vk.com/app4426688">\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af</a></p>';
}

/*
	* Запрет ПКМ
*/

function ctrlu() {return false;}
document.ondragstart = ctrlu;
document.onselectstart = ctrlu;
document.oncontextmenu = ctrlu;

/*
	* Бокс заказа
*/

// var mr24url_1 = 'myra', mr24url_2 = 'dio24.c', mr24url_3 = 'om',
// 		mr24url = mr24url_1 + mr24url_2 + mr24url_3;
//
// var songsBox = document.querySelector('.songs'), stream_port = 7934,
// 		mr24api = 'https://'+mr24url+'/users/'+stream_port+'/status.json';
//
// function loadInfo(){
// 	if(self.fetch) {
// 		window.fetch(mr24api+'?ts='+Date.now()).then(function(response){
// 			if (response.status !== 200) {
// 				//songsBox.innerHTML = '<tbody><tr><td>Сервер радио временно недоступен.</tr></td></tbody>';
// 				return;
// 			}
// 			response.json().then(function(data) {
// 				var qenable = data['enabletable'], awrj = data['djname'], orderBox = document.querySelector('.order-box'), orderBoxLink = document.querySelector('.order-box a'), orderQueue = document.querySelector('.order-box .queue');
//
// 				if (qenable = '1' && awrj != 'Auto-DJ') {
// 					orderBox.style.display = 'inline-block';
// 					orderBoxLink.setAttribute('href', 'https://'+mr24url+'/?to=table&port='+stream_port);
// 				} else {
// 					orderBox.style.display = 'none';
// 					orderBoxLink.setAttribute('href', 'javascript:void(0);');
// 				}
// 			});
// 		});
// 	} else {
// 		clearInterval(aw_timer);
// 	}
// }
//
// loadInfo();
//
// var aw_timer = setInterval(function(){
// 	loadInfo();
// }, 15000);
