<?php
	header('Content-type: application/xml');
	date_default_timezone_set("Europe/Moscow");

	$url = 'https://' . $_SERVER['SERVER_NAME'];
	$content = ['index', 'radio', 'anime'];

	$sm = '<urlset xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xmlns:image="https://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="https://www.sitemaps.org/schemas/sitemap/0.9 https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">';

	for ($e = 0; $e <= (count($content) - 1); $e++) {
		$sm .= '<url>';
		if ($content[$e] === 'index') {
			$sm .= '<loc>' . $url . '</loc>';
		} else {
			$sm .= '<loc>' . $url . '/'. $content[$e] .'</loc>';
		}
		$sm .= '<lastmod>'. date('c', filemtime($content[$e] . '.html')) .'</lastmod>';
		$sm .= '</url>';
	}

	$sm .= "</urlset>\n"; // двойные кавычки нужны, чтобы отображался перевод строки

	echo $sm;
?>