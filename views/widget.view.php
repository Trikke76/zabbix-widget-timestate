<?php

declare(strict_types = 1);

/** @var array $data */

$payload = [
	'rows' => $data['rows'] ?? [],
	'time_from' => (int) ($data['time_from'] ?? time() - 3600),
	'time_to' => (int) ($data['time_to'] ?? time()),
	'error' => $data['error'] ?? null
];

$root = (new CDiv())
	->addClass('timestate js-timestate-root')
	->setAttribute('data-model', json_encode($payload, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT));

$view = new CWidgetView($data);
$view->addItem($root);
$view->show();
