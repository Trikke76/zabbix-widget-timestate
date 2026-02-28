<?php

declare(strict_types = 1);

namespace Modules\TimeStateWidget\Actions;

use API;
use CControllerDashboardWidgetView;
use CControllerResponseData;

class WidgetView extends CControllerDashboardWidgetView {
	private const DEFAULT_LOOKBACK_HOURS = 24;
	private const DEFAULT_MAX_ROWS = 20;
	private const DEFAULT_HISTORY_POINTS = 500;

	protected function doAction(): void {
		$hostids = $this->extractHostIds($this->fields_values['hostids'] ?? null);
		$item_key_search = trim((string) ($this->fields_values['item_key_search'] ?? ''));
		$item_name_search = trim((string) ($this->fields_values['item_name_search'] ?? ''));
		$lookback_hours = $this->clampInt((int) ($this->fields_values['lookback_hours'] ?? self::DEFAULT_LOOKBACK_HOURS), 1, 24 * 31);
		$max_rows = $this->clampInt((int) ($this->fields_values['max_rows'] ?? self::DEFAULT_MAX_ROWS), 1, 200);
		$history_points = $this->clampInt((int) ($this->fields_values['history_points'] ?? self::DEFAULT_HISTORY_POINTS), 10, 5000);
		$merge_equal = ((int) ($this->fields_values['merge_equal_states'] ?? 1)) === 1;
		$state_map = $this->parseStateMap((string) ($this->fields_values['state_map'] ?? ''));
		$base_colors = $this->buildBaseColorMap();
		$time_to = time();
		$time_from = $time_to - ($lookback_hours * 3600);

		if ($hostids === []) {
			$this->setResponse(new CControllerResponseData([
				'name' => $this->widget->getDefaultName(),
				'rows' => [],
				'time_from' => $time_from,
				'time_to' => $time_to,
				'error' => _('Select at least one host.'),
				'user' => ['debug_mode' => $this->getDebugMode()]
			]));
			return;
		}

		$items = $this->loadCandidateItems($hostids, $item_key_search, $item_name_search, $max_rows);
		$rows = [];

		foreach ($items as $item) {
			$value_type = (int) $item['value_type'];
			if (!in_array($value_type, [0, 1, 2, 3, 4], true)) {
				continue;
			}

			$history = API::History()->get([
				'output' => ['clock', 'value'],
				'itemids' => [(string) $item['itemid']],
				'history' => $value_type,
				'time_from' => $time_from,
				'time_till' => $time_to,
				'sortfield' => 'clock',
				'sortorder' => 'ASC',
				'limit' => $history_points
			]);

			$segments = $this->buildSegments($history ?: [], $time_from, $time_to, $state_map, $base_colors, $merge_equal);
			if ($segments === []) {
				continue;
			}

			$rows[] = [
				'row_label' => sprintf('%s :: %s', (string) $item['host_name'], (string) $item['name']),
				'itemid' => (string) $item['itemid'],
				'key_' => (string) $item['key_'],
				'segments' => $segments
			];
		}

		$this->setResponse(new CControllerResponseData([
			'name' => $this->widget->getDefaultName(),
			'rows' => $rows,
			'time_from' => $time_from,
			'time_to' => $time_to,
			'error' => null,
			'user' => ['debug_mode' => $this->getDebugMode()]
		]));
	}

	private function extractHostIds($raw): array {
		if (!is_array($raw)) {
			return [];
		}

		$ids = [];
		foreach ($raw as $value) {
			if (is_scalar($value) && ctype_digit((string) $value)) {
				$ids[] = (string) $value;
			}
		}

		return array_values(array_unique($ids));
	}

	private function loadCandidateItems(array $hostids, string $item_key_search, string $item_name_search, int $max_rows): array {
		$params = [
			'output' => ['itemid', 'name', 'key_', 'value_type', 'hostid'],
			'selectHosts' => ['name'],
			'hostids' => $hostids,
			'monitored' => true,
			'sortfield' => ['hostid', 'name'],
			'sortorder' => 'ASC',
			'limit' => $max_rows * 5
		];

		$search = [];
		if ($item_key_search !== '') {
			$search['key_'] = $item_key_search;
		}
		if ($item_name_search !== '') {
			$search['name'] = $item_name_search;
		}
		if ($search !== []) {
			$params['search'] = $search;
			$params['searchByAny'] = true;
			$params['searchWildcardsEnabled'] = true;
		}

		$items = API::Item()->get($params) ?: [];
		$result = [];

		foreach ($items as $item) {
			$host_name = isset($item['hosts'][0]['name']) ? (string) $item['hosts'][0]['name'] : _('Host');
			$item['host_name'] = $host_name;
			$result[] = $item;
			if (count($result) >= $max_rows) {
				break;
			}
		}

		return $result;
	}

	private function buildSegments(array $history, int $time_from, int $time_to, array $state_map, array $base_colors, bool $merge_equal): array {
		if ($history === []) {
			return [[
				't_from' => $time_from,
				't_to' => $time_to,
				'state' => 'unknown',
				'label' => _('No data'),
				'color' => $base_colors['unknown']
			]];
		}

		$segments = [];
		$last_clock = $time_from;
		$last_state = null;

		foreach ($history as $idx => $point) {
			$clock = (int) ($point['clock'] ?? 0);
			if ($clock < $time_from) {
				continue;
			}
			if ($clock > $time_to) {
				break;
			}

			$value = (string) ($point['value'] ?? '');
			$state = $this->normalizeStateValue($value);
			$next_clock = $idx + 1 < count($history)
				? (int) ($history[$idx + 1]['clock'] ?? $time_to)
				: $time_to;
			$next_clock = max($clock + 1, min($next_clock, $time_to));

			if ($clock > $last_clock) {
				$segments[] = [
					't_from' => $last_clock,
					't_to' => $clock,
					'state' => 'unknown',
					'label' => _('No data'),
					'color' => $base_colors['unknown']
				];
			}

			$segment = [
				't_from' => $clock,
				't_to' => $next_clock,
				'state' => $state,
				'label' => $state_map[$state] ?? $state,
				'color' => $this->resolveStateColor($state, $base_colors)
			];

			if ($merge_equal && $last_state !== null && $this->canMerge($last_state, $segment)) {
				$segments[count($segments) - 1]['t_to'] = $segment['t_to'];
				$last_state = $segments[count($segments) - 1];
			} else {
				$segments[] = $segment;
				$last_state = $segment;
			}

			$last_clock = $next_clock;
		}

		if ($last_clock < $time_to) {
			$segments[] = [
				't_from' => $last_clock,
				't_to' => $time_to,
				'state' => 'unknown',
				'label' => _('No data'),
				'color' => $base_colors['unknown']
			];
		}

		return array_values(array_filter($segments, static function(array $segment): bool {
			return ($segment['t_to'] ?? 0) > ($segment['t_from'] ?? 0);
		}));
	}

	private function normalizeStateValue(string $value): string {
		$trimmed = trim($value);
		if ($trimmed === '') {
			return 'unknown';
		}

		if (is_numeric($trimmed)) {
			$number = (float) $trimmed;
			if (abs($number - round($number)) < 0.00001) {
				return (string) ((int) round($number));
			}
		}

		return $trimmed;
	}

	private function canMerge(array $a, array $b): bool {
		return (string) ($a['state'] ?? '') === (string) ($b['state'] ?? '')
			&& (string) ($a['color'] ?? '') === (string) ($b['color'] ?? '')
			&& (int) ($a['t_to'] ?? 0) === (int) ($b['t_from'] ?? 0);
	}

	private function parseStateMap(string $raw): array {
		$map = [];
		$normalized = str_replace(',', "\n", $raw);
		$lines = preg_split('/\r?\n/', $normalized) ?: [];

		foreach ($lines as $line) {
			$line = trim($line);
			if ($line === '' || strpos($line, '=') === false) {
				continue;
			}
			[$key, $label] = array_map('trim', explode('=', $line, 2));
			if ($key === '' || $label === '') {
				continue;
			}
			$map[$key] = $label;
		}

		return $map;
	}

	private function resolveStateColor(string $state, array $base_colors): string {
		if ($state === '0') {
			return $base_colors['0'];
		}
		if ($state === '1') {
			return $base_colors['1'];
		}
		if ($state === 'unknown') {
			return $base_colors['unknown'];
		}

		$hash = hexdec(substr(md5($state), 0, 2));
		$h = (int) round(($hash / 255) * 360);
		return sprintf('hsl(%d 55%% 47%%)', $h);
	}

	private function buildBaseColorMap(): array {
		$c0 = $this->safeColor((string) ($this->fields_values['state_0_color'] ?? '#2E7D32'), '#2E7D32');
		$c1 = $this->safeColor((string) ($this->fields_values['state_1_color'] ?? '#C62828'), '#C62828');
		$cu = $this->safeColor((string) ($this->fields_values['state_unknown_color'] ?? '#607D8B'), '#607D8B');

		return [
			'0' => $c0,
			'1' => $c1,
			'unknown' => $cu
		];
	}

	private function safeColor(string $value, string $fallback): string {
		$value = trim($value);
		if (preg_match('/^#[0-9A-Fa-f]{6}$/', $value) === 1) {
			return strtoupper($value);
		}
		return strtoupper($fallback);
	}

	private function clampInt(int $value, int $min, int $max): int {
		if ($value < $min) {
			return $min;
		}
		if ($value > $max) {
			return $max;
		}
		return $value;
	}
}
