<?php

declare(strict_types = 1);

namespace Modules\TimeStateWidget\Includes;

use Zabbix\Widgets\CWidgetForm;
use Zabbix\Widgets\Fields\CWidgetFieldMultiSelectHost;
use Zabbix\Widgets\Fields\CWidgetFieldSelect;
use Zabbix\Widgets\Fields\CWidgetFieldTextBox;

class WidgetForm extends CWidgetForm {
	public function addFields(): self {
		return $this
			->addField(
				(new CWidgetFieldMultiSelectHost('hostids', _('Hosts')))
					->setMultiple(true)
			)
			->addField(
				(new CWidgetFieldTextBox('item_key_search', _('Item key filter (substring)')))
					->setDefault('')
			)
			->addField(
				(new CWidgetFieldTextBox('item_name_search', _('Item name filter (substring)')))
					->setDefault('')
			)
			->addField(
				(new CWidgetFieldTextBox('lookback_hours', _('Lookback (hours)')))
					->setDefault('24')
			)
			->addField(
				(new CWidgetFieldTextBox('max_rows', _('Max rows')))
					->setDefault('20')
			)
			->addField(
				(new CWidgetFieldTextBox('history_points', _('History points per item')))
					->setDefault('500')
			)
			->addField(
				(new CWidgetFieldSelect('merge_equal_states', _('Merge equal consecutive states'), [
					1 => _('Yes'),
					0 => _('No')
				]))->setDefault(1)
			)
			->addField(
				(new CWidgetFieldSelect('null_gap_mode', _('Null-gap mode'), [
					0 => _('Disconnected'),
					1 => _('Connected')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldSelect('row_sort', _('Row sorting'), [
					0 => _('Name (A-Z)'),
					1 => _('Current status (Problem first)'),
					2 => _('Last change (most recent first)')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldTextBox('state_map', _('State mapping (value=Label, comma separated)')))
					->setDefault('0=OK,1=Problem')
			)
			->addField(
				(new CWidgetFieldTextBox('state_0_color', _('State "0" color')))
					->setDefault('#2E7D32')
			)
			->addField(
				(new CWidgetFieldTextBox('state_1_color', _('State "1" color')))
					->setDefault('#C62828')
			)
			->addField(
				(new CWidgetFieldTextBox('state_unknown_color', _('Unknown state color')))
					->setDefault('#607D8B')
			);
	}
}
