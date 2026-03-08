<?php

declare(strict_types = 1);

namespace Modules\TimeStateWidget;

use Zabbix\Core\CWidget;

class Widget extends CWidget {
	public function getDefaultName(): string {
		return _('Time State');
	}
}
