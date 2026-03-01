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
	private const DEFAULT_ROW_SORT = 0;

	protected function doAction(): void {
		$hostids = $this->extractHostIds($this->fields_values['hostids'] ?? null);
		$default_lookback_hours = $this->clampInt((int) ($this->fields_values['lookback_hours'] ?? self::DEFAULT_LOOKBACK_HOURS), 1, 24 * 31);
		$default_row_sort = $this->clampInt((int) ($this->fields_values['row_sort'] ?? self::DEFAULT_ROW_SORT), 0, 2);
		$data_sets = $this->parseDataSets(
			(string) ($this->fields_values['datasets_json'] ?? ''),
			[
				'item_key_search' => trim((string) ($this->fields_values['item_key_search'] ?? '')),
				'item_name_search' => trim((string) ($this->fields_values['item_name_search'] ?? '')),
				'lookback_hours' => $default_lookback_hours,
				'max_rows' => (int) ($this->fields_values['max_rows'] ?? self::DEFAULT_MAX_ROWS),
				'history_points' => (int) ($this->fields_values['history_points'] ?? self::DEFAULT_HISTORY_POINTS),
				'merge_equal_states' => (int) ($this->fields_values['merge_equal_states'] ?? 1),
				'merge_shorter_than' => (int) ($this->fields_values['merge_shorter_than'] ?? 0),
				'null_gap_mode' => (int) ($this->fields_values['null_gap_mode'] ?? 0),
				'null_gap_backfill_first' => (int) ($this->fields_values['null_gap_backfill_first'] ?? 0),
				'state_map' => (string) ($this->fields_values['state_map'] ?? 'value:0=OK|#2E7D32,value:1=Problem|#C62828')
			]
		);
		$base_colors = $this->buildBaseColorMap();
		$time_to = time();
		$time_from = $time_to - ($default_lookback_hours * 3600);

		if ($hostids === []) {
			$this->setResponse(new CControllerResponseData([
				'name' => $this->widget->getDefaultName(),
				'rows' => [],
				'time_from' => $time_from,
				'time_to' => $time_to,
				'selected_items' => [],
				'error' => _('Select at least one host.'),
				'user' => ['debug_mode' => $this->getDebugMode()]
			]));
			return;
		}

		$rows = [];
		$seen_itemids = [];
		$selected_items = [];
		$global_time_from = $time_from;

		foreach ($data_sets as $data_set) {
			$filter_type = (string) ($data_set['filter_type'] ?? 'key');
			$filter_value = (string) ($data_set['filter_value'] ?? '');
			$item_key_search = $filter_type === 'name' ? '' : $filter_value;
			$item_name_search = $filter_type === 'name' ? $filter_value : '';
			$lookback_hours = (int) ($data_set['lookback_hours'] ?? self::DEFAULT_LOOKBACK_HOURS);
			$dataset_time_from = $time_to - ($lookback_hours * 3600);
			$global_time_from = min($global_time_from, $dataset_time_from);

			$items = $this->loadCandidateItems(
				$hostids,
				$item_key_search,
				$item_name_search,
				(int) $data_set['max_rows']
			);
			$value_mappings = is_array($data_set['rules']) ? $data_set['rules'] : [];
			$history_points = (int) $data_set['history_points'];
			$merge_equal = ((int) $data_set['merge_equal_states']) === 1;
			$merge_shorter_than = (int) $data_set['merge_shorter_than'];
			$connect_null_gaps = ((int) $data_set['null_gap_mode']) === 1;
			$backfill_first = ((int) $data_set['null_gap_backfill_first']) === 1;

			foreach ($items as $item) {
				$itemid = (string) ($item['itemid'] ?? '');
				if ($itemid === '' || isset($seen_itemids[$itemid])) {
					continue;
				}

				$value_type = (int) $item['value_type'];
				if (!in_array($value_type, [0, 1, 2, 3, 4], true)) {
					continue;
				}

				$history = API::History()->get([
					'output' => ['clock', 'value'],
					'itemids' => [$itemid],
					'history' => $value_type,
					'time_from' => $dataset_time_from,
					'time_till' => $time_to,
					'sortfield' => 'clock',
					'sortorder' => 'ASC',
					'limit' => $history_points
				]);

				$segments = $this->buildSegments(
					$history ?: [],
					$dataset_time_from,
					$time_to,
					$value_mappings,
					$base_colors,
					$merge_equal,
					$connect_null_gaps,
					$merge_shorter_than,
					$backfill_first
				);
				if ($segments === []) {
					continue;
				}

				$rows[] = [
					'row_label' => sprintf('%s :: %s', (string) $item['host_name'], (string) $item['name']),
					'itemid' => $itemid,
					'key_' => (string) $item['key_'],
					'segments' => $segments,
					'_sort_state' => $this->getCurrentState($segments),
					'_sort_last_change' => $this->getLastChangeTs($segments)
				];
				$selected_items[] = [
					'host_name' => (string) ($item['host_name'] ?? ''),
					'name' => (string) ($item['name'] ?? ''),
					'key_' => (string) ($item['key_'] ?? '')
				];
				$seen_itemids[$itemid] = true;
			}
		}
		$this->sortRows($rows, $default_row_sort);
		foreach ($rows as &$row) {
			unset($row['_sort_state'], $row['_sort_last_change']);
		}
		unset($row);

		$this->setResponse(new CControllerResponseData([
			'name' => $this->widget->getDefaultName(),
			'rows' => $rows,
			'selected_items' => $this->buildSelectedItemPreview($selected_items),
			'time_from' => $global_time_from,
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
		usort($items, static function(array $a, array $b): int {
			$host_a = isset($a['hosts'][0]['name']) ? (string) $a['hosts'][0]['name'] : '';
			$host_b = isset($b['hosts'][0]['name']) ? (string) $b['hosts'][0]['name'] : '';
			$host_cmp = strcasecmp($host_a, $host_b);
			if ($host_cmp !== 0) {
				return $host_cmp;
			}

			$name_a = (string) ($a['name'] ?? '');
			$name_b = (string) ($b['name'] ?? '');
			return strcasecmp($name_a, $name_b);
		});

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

	private function buildSelectedItemPreview(array $items): array {
		$preview = [];
		foreach ($items as $item) {
			$host_name = (string) ($item['host_name'] ?? (isset($item['hosts'][0]['name']) ? $item['hosts'][0]['name'] : _('Host')));
			$name = (string) ($item['name'] ?? '');
			$key = (string) ($item['key_'] ?? '');
			$preview[] = sprintf('%s :: %s [%s]', $host_name, $name, $key);
		}
		return $preview;
	}

	private function sortRows(array &$rows, int $row_sort): void {
		usort($rows, function(array $a, array $b) use ($row_sort): int {
			if ($row_sort === 1) {
				$pa = $this->stateSortPriority((string) ($a['_sort_state'] ?? 'unknown'));
				$pb = $this->stateSortPriority((string) ($b['_sort_state'] ?? 'unknown'));
				if ($pa !== $pb) {
					return $pa <=> $pb;
				}
			}
			elseif ($row_sort === 2) {
				$la = (int) ($a['_sort_last_change'] ?? 0);
				$lb = (int) ($b['_sort_last_change'] ?? 0);
				if ($la !== $lb) {
					return $lb <=> $la;
				}
			}

			return strcasecmp((string) ($a['row_label'] ?? ''), (string) ($b['row_label'] ?? ''));
		});
	}

	private function getCurrentState(array $segments): string {
		if ($segments === []) {
			return 'unknown';
		}

		$last = $segments[count($segments) - 1];
		return (string) ($last['state'] ?? 'unknown');
	}

	private function getLastChangeTs(array $segments): int {
		if ($segments === []) {
			return 0;
		}

		$last = $segments[count($segments) - 1];
		return (int) ($last['t_from'] ?? 0);
	}

	private function stateSortPriority(string $state): int {
		if ($state === '1') {
			return 0; // Problem first
		}
		if ($state === 'unknown') {
			return 1; // then unknown
		}
		return 2; // then OK/others
	}

	private function buildSegments(
		array $history,
		int $time_from,
		int $time_to,
		array $value_mappings,
		array $base_colors,
		bool $merge_equal,
		bool $connect_null_gaps,
		int $merge_shorter_than,
		bool $backfill_first
	): array {
		if ($history === []) {
			return [[
				't_from' => $time_from,
				't_to' => $time_to,
				'state' => 'unknown',
				'raw_value' => '',
				'label' => _('No data'),
				'color' => $base_colors['unknown']
			]];
		}

		$segments = [];
		$cursor = $time_from;
		$last_state = null;
		$sample_interval = $this->estimateSampleInterval($history, $time_from, $time_to);
		$max_expected_gap = max(2, (int) floor($sample_interval * 1.5));

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
			$segment_end = $next_clock;

			if (!$connect_null_gaps && $sample_interval > 0 && ($next_clock - $clock) > $max_expected_gap) {
				$segment_end = min($time_to, $clock + max(1, $sample_interval));
			}

			if ($clock > $cursor) {
				if ($connect_null_gaps && $last_state !== null && !empty($segments)) {
					$segments[count($segments) - 1]['t_to'] = $clock;
					$last_state = $segments[count($segments) - 1];
				} else {
					$segments[] = [
						't_from' => $cursor,
						't_to' => $clock,
						'state' => 'unknown',
						'raw_value' => '',
						'label' => _('No data'),
						'color' => $base_colors['unknown']
					];
				}
			}

			$mapped = $this->mapValue($value, $state, $value_mappings, $base_colors);

			$segment = [
				't_from' => $clock,
				't_to' => $segment_end,
				'state' => $mapped['state'],
				'raw_value' => $value,
				'label' => $mapped['label'],
				'color' => $mapped['color']
			];

			if ($merge_equal && $last_state !== null && $this->canMerge($last_state, $segment)) {
				$segments[count($segments) - 1]['t_to'] = $segment['t_to'];
				$last_state = $segments[count($segments) - 1];
			} else {
				$segments[] = $segment;
				$last_state = $segment;
			}

			$cursor = $segment_end;
		}

		if ($cursor < $time_to) {
			if ($connect_null_gaps && $last_state !== null && !empty($segments)) {
				$segments[count($segments) - 1]['t_to'] = $time_to;
			} else {
				$segments[] = [
					't_from' => $cursor,
					't_to' => $time_to,
					'state' => 'unknown',
					'raw_value' => '',
					'label' => _('No data'),
					'color' => $base_colors['unknown']
				];
			}
		}

		$segments = array_values(array_filter($segments, static function(array $segment): bool {
			return ($segment['t_to'] ?? 0) > ($segment['t_from'] ?? 0);
		}));

		if ($merge_shorter_than > 0) {
			$segments = $this->mergeShortSegments($segments, $merge_shorter_than);
		}
		if ($backfill_first) {
			$segments = $this->applyLeadingBackfill($segments);
		}

		return $segments;
	}

	private function applyLeadingBackfill(array $segments): array {
		if (count($segments) < 2) {
			return $segments;
		}

		$first = $segments[0];
		$next = $segments[1];
		$is_leading_unknown = (string) ($first['state'] ?? '') === 'unknown';
		$is_next_known = (string) ($next['state'] ?? '') !== 'unknown';
		$is_contiguous = (int) ($first['t_to'] ?? 0) === (int) ($next['t_from'] ?? 0);

		if ($is_leading_unknown && $is_next_known && $is_contiguous) {
			$segments[1]['t_from'] = $segments[0]['t_from'];
			array_shift($segments);
		}

		return $segments;
	}

	private function mergeShortSegments(array $segments, int $threshold_seconds): array {
		if (count($segments) < 3 || $threshold_seconds <= 0) {
			return $segments;
		}

		$changed = true;
		while ($changed) {
			$changed = false;
			$len = count($segments);
			if ($len < 3) {
				break;
			}

			for ($i = 1; $i < $len - 1; $i++) {
				$curr = $segments[$i];
				$duration = (int) ($curr['t_to'] ?? 0) - (int) ($curr['t_from'] ?? 0);
				if ($duration <= 0 || $duration >= $threshold_seconds) {
					continue;
				}

				$prev = $segments[$i - 1];
				$next = $segments[$i + 1];

				$same_neighbors = (string) ($prev['state'] ?? '') === (string) ($next['state'] ?? '')
					&& (string) ($prev['color'] ?? '') === (string) ($next['color'] ?? '');
				$contiguous = (int) ($prev['t_to'] ?? 0) === (int) ($curr['t_from'] ?? 0)
					&& (int) ($curr['t_to'] ?? 0) === (int) ($next['t_from'] ?? 0);

				if (!$same_neighbors || !$contiguous) {
					continue;
				}

				$segments[$i - 1]['t_to'] = $next['t_to'];
				array_splice($segments, $i, 2);
				$changed = true;
				break;
			}
		}

		return $segments;
	}

	private function estimateSampleInterval(array $history, int $time_from, int $time_to): int {
		$clocks = [];
		foreach ($history as $point) {
			$clock = (int) ($point['clock'] ?? 0);
			if ($clock >= $time_from && $clock <= $time_to) {
				$clocks[] = $clock;
			}
		}

		if (count($clocks) < 2) {
			return 0;
		}

		sort($clocks);
		$deltas = [];
		for ($i = 1; $i < count($clocks); $i++) {
			$delta = $clocks[$i] - $clocks[$i - 1];
			if ($delta > 0) {
				$deltas[] = $delta;
			}
		}

		if ($deltas === []) {
			return 0;
		}

		sort($deltas);
		$mid = (int) floor(count($deltas) / 2);
		return $deltas[$mid];
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

	private function parseValueMappings(string $raw): array {
		$rules = [];
		$normalized = str_replace(',', "\n", $raw);
		$lines = preg_split('/\r?\n/', $normalized) ?: [];

		foreach ($lines as $line) {
			$line = trim($line);
			if ($line === '' || strpos($line, '=') === false) {
				continue;
			}
			[$condition, $display] = array_map('trim', explode('=', $line, 2));
			if ($condition === '' || $display === '') {
				continue;
			}

			[$label, $color] = $this->parseMappingDisplay($display);
			$rule = [
				'type' => 'value',
				'label' => $label,
				'color' => $color
			];

			if (str_starts_with($condition, 'value:')) {
				$rule['type'] = 'value';
				$rule['value'] = trim(substr($condition, 6));
			}
			elseif (str_starts_with($condition, 'range:')) {
				$range = trim(substr($condition, 6));
				[$min, $max] = array_map('trim', explode('..', $range, 2) + [null, null]);
				$rule['type'] = 'range';
				$rule['min'] = ($min === '' || $min === null) ? null : (float) $min;
				$rule['max'] = ($max === '' || $max === null) ? null : (float) $max;
			}
			elseif (str_starts_with($condition, 'regex:')) {
				$rule['type'] = 'regex';
				$rule['pattern'] = trim(substr($condition, 6));
			}
			elseif (str_starts_with($condition, 'special:')) {
				$rule['type'] = 'special';
				$rule['special'] = strtolower(trim(substr($condition, 8)));
			}
			else {
				$rule['type'] = 'value';
				$rule['value'] = $condition;
			}

			$rules[] = $rule;
		}

		return $rules;
	}

	private function parseMappingDisplay(string $display): array {
		$parts = array_map('trim', explode('|', $display, 2));
		$label = $parts[0] !== '' ? $parts[0] : $display;
		$color = null;
		if (isset($parts[1]) && preg_match('/^#[0-9A-Fa-f]{6}$/', $parts[1]) === 1) {
			$color = strtoupper($parts[1]);
		}

		return [$label, $color];
	}

	private function parseDataSets(string $raw, array $fallback): array {
		$raw = trim($raw);
		if ($raw === '') {
			return [$this->normalizeDataSet($fallback)];
		}

		$data = json_decode($raw, true);
		if (!is_array($data)) {
			return [$this->normalizeDataSet($fallback)];
		}

		$sets = [];
		foreach ($data as $entry) {
			if (!is_array($entry)) {
				continue;
			}
			$sets[] = $this->normalizeDataSet($entry);
		}

		return $sets !== [] ? $sets : [$this->normalizeDataSet($fallback)];
	}

	private function normalizeDataSet(array $entry): array {
		$lookback_hours = $this->clampInt((int) ($entry['lookback_hours'] ?? self::DEFAULT_LOOKBACK_HOURS), 1, 24 * 31);
		$max_rows = $this->clampInt((int) ($entry['max_rows'] ?? self::DEFAULT_MAX_ROWS), 1, 200);
		$history_points = $this->clampInt((int) ($entry['history_points'] ?? self::DEFAULT_HISTORY_POINTS), 10, 5000);
		$merge_shorter_than = $this->clampInt((int) ($entry['merge_shorter_than'] ?? 0), 0, 3600);
		$state_map_raw = trim((string) ($entry['state_map'] ?? ''));
		if ($state_map_raw === '') {
			$state_map_raw = 'value:0=OK|#2E7D32,value:1=Problem|#C62828';
		}
		$rules = $this->parseValueMappings($state_map_raw);

		return [
			'name' => trim((string) ($entry['name'] ?? '')),
			'filter_type' => $this->normalizeFilterType(
				(string) ($entry['filter_type'] ?? ''),
				trim((string) ($entry['item_key_search'] ?? '')),
				trim((string) ($entry['item_name_search'] ?? ''))
			),
			'filter_value' => trim((string) (
				$entry['filter_value']
				?? $entry['item_key_search']
				?? $entry['item_name_search']
				?? ''
			)),
			'lookback_hours' => $lookback_hours,
			'max_rows' => $max_rows,
			'history_points' => $history_points,
			'merge_equal_states' => ((int) ($entry['merge_equal_states'] ?? 1)) === 1 ? 1 : 0,
			'merge_shorter_than' => $merge_shorter_than,
			'null_gap_mode' => ((int) ($entry['null_gap_mode'] ?? 0)) === 1 ? 1 : 0,
			'null_gap_backfill_first' => ((int) ($entry['null_gap_backfill_first'] ?? 0)) === 1 ? 1 : 0,
			'rules' => $rules !== [] ? $rules : $this->parseValueMappings('value:0=OK|#2E7D32,value:1=Problem|#C62828')
		];
	}

	private function normalizeFilterType(string $type, string $legacy_key, string $legacy_name): string {
		$type = strtolower(trim($type));
		if ($type === 'key' || $type === 'name') {
			return $type;
		}
		if ($legacy_key !== '') {
			return 'key';
		}
		if ($legacy_name !== '') {
			return 'name';
		}
		return 'key';
	}

	private function mapValue(string $raw_value, string $state, array $rules, array $base_colors): array {
		$trimmed = trim($raw_value);
		$lower = strtolower($trimmed);

		foreach ($rules as $rule) {
			$type = (string) ($rule['type'] ?? 'value');
			$matched = false;

			if ($type === 'value') {
				$v = (string) ($rule['value'] ?? '');
				$matched = ($state === $v || $trimmed === $v);
			}
			elseif ($type === 'range') {
				if (is_numeric($state)) {
					$num = (float) $state;
					$min = $rule['min'] ?? null;
					$max = $rule['max'] ?? null;
					$ok_min = ($min === null) || $num >= (float) $min;
					$ok_max = ($max === null) || $num <= (float) $max;
					$matched = $ok_min && $ok_max;
				}
			}
			elseif ($type === 'regex') {
				$pattern = (string) ($rule['pattern'] ?? '');
				if ($pattern !== '') {
					$regex = $pattern;
					if (@preg_match($regex, '') === false) {
						$regex = '/' . str_replace('/', '\/', $pattern) . '/i';
					}
					$matched = @preg_match($regex, $trimmed) === 1 || @preg_match($regex, $state) === 1;
				}
			}
			elseif ($type === 'special') {
				$special = (string) ($rule['special'] ?? '');
				$matched = match ($special) {
					'null' => $lower === 'null',
					'nan' => $lower === 'nan',
					'true' => $lower === 'true',
					'false' => $lower === 'false',
					'empty' => $trimmed === '',
					'unknown' => $state === 'unknown',
					default => false
				};
			}

			if ($matched) {
				return [
					'state' => $state,
					'label' => (string) ($rule['label'] ?? $state),
					'color' => (string) (($rule['color'] ?? '') !== '' ? $rule['color'] : $this->resolveStateColor($state, $base_colors))
				];
			}
		}

		return [
			'state' => $state,
			'label' => $state,
			'color' => $this->resolveStateColor($state, $base_colors)
		];
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
		return [
			'0' => '#2E7D32',
			'1' => '#C62828',
			'unknown' => '#607D8B'
		];
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
