<?php

declare(strict_types = 1);

/** @var array $data */

$payload = [
	'rows' => $data['rows'] ?? [],
	'selected_items' => $data['selected_items'] ?? [],
	'time_from' => (int) ($data['time_from'] ?? time() - 3600),
	'time_to' => (int) ($data['time_to'] ?? time()),
	'row_group_mode' => (int) ($data['row_group_mode'] ?? 0),
	'row_group_collapsed' => (int) ($data['row_group_collapsed'] ?? 0),
	'axis_tick_step' => (int) ($data['axis_tick_step'] ?? 0),
	'axis_label_density' => (int) ($data['axis_label_density'] ?? 1),
	'axis_grid_mode' => (int) ($data['axis_grid_mode'] ?? 0),
	'legend_mode' => (int) ($data['legend_mode'] ?? 0),
	'legend_show_count' => (int) ($data['legend_show_count'] ?? 1),
	'legend_show_duration' => (int) ($data['legend_show_duration'] ?? 1),
	'segment_label_mode' => (int) ($data['segment_label_mode'] ?? 0),
	'error' => $data['error'] ?? null
];

$root = (new CDiv())
	->addClass('timestate js-timestate-root')
	->setAttribute('data-model', json_encode($payload, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT));

$view = new CWidgetView($data);
$view->addItem($root);
$view->show();
