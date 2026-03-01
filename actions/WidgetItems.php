<?php

declare(strict_types = 1);

namespace Modules\TimeStateWidget\Actions;

use API;
use CController;
use CControllerResponseData;

class WidgetItems extends CController {
	private const MAX_ROWS_SCAN = 5000;
	private const MAX_SUGGESTIONS = 200;

	protected function init(): void {
		$this->disableCsrfValidation();
	}

	protected function checkInput(): bool {
		return $this->validateInput([
			'hostids_csv' => 'string',
			'item_key_search' => 'string',
			'item_name_search' => 'string',
			'max_rows' => 'int32'
		]);
	}

	protected function checkPermissions(): bool {
		return $this->getUserType() >= USER_TYPE_ZABBIX_USER;
	}

	protected function doAction(): void {
		$hostids = $this->parseHostIds((string) $this->getInput('hostids_csv', ''));
		$item_key_search = trim((string) $this->getInput('item_key_search', ''));
		$item_name_search = trim((string) $this->getInput('item_name_search', ''));
		$max_rows = (int) $this->getInput('max_rows', 20);
		$max_rows = max(1, min($max_rows, self::MAX_SUGGESTIONS));

		if ($hostids === []) {
			$this->respond([]);
			return;
		}

		$params = [
			'output' => ['itemid', 'name', 'key_'],
			'selectHosts' => ['name'],
			'hostids' => $hostids,
			'monitored' => true,
			'limit' => min(self::MAX_ROWS_SCAN, $max_rows * 10)
		];

		$search = [];
		if ($item_key_search !== '') {
			$search['key_'] = $this->normalizeSearchPattern($item_key_search);
		}
		if ($item_name_search !== '') {
			$search['name'] = $this->normalizeSearchPattern($item_name_search);
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
			$result[] = [
				'itemid' => (string) ($item['itemid'] ?? ''),
				'name' => (string) ($item['name'] ?? ''),
				'key_' => (string) ($item['key_'] ?? ''),
				'host' => $host_name,
				'label' => sprintf('%s :: %s [%s]', $host_name, (string) ($item['name'] ?? ''), (string) ($item['key_'] ?? ''))
			];
			if (count($result) >= $max_rows) {
				break;
			}
		}

		$this->respond($result);
	}

	private function parseHostIds(string $raw): array {
		$tokens = preg_split('/[\s,]+/', trim($raw)) ?: [];
		$ids = [];

		foreach ($tokens as $token) {
			if ($token !== '' && ctype_digit($token)) {
				$ids[] = $token;
			}
		}

		return array_values(array_unique($ids));
	}

	private function normalizeSearchPattern(string $value): string {
		$value = trim($value);
		if ($value === '') {
			return $value;
		}

		// Keep explicit wildcard patterns untouched.
		if (str_contains($value, '*') || str_contains($value, '?')) {
			return $value;
		}

		// Default behavior: substring match while typing.
		return '*' . $value . '*';
	}

	private function respond(array $items): void {
		$this->setResponse(new CControllerResponseData([
			'main_block' => json_encode([
				'items' => $items
			])
		]));
	}
}
