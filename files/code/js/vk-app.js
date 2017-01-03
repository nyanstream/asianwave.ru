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

// document.addEventListener('contextmenu', function(e){
// 	e.preventDefault();
// }, false);
