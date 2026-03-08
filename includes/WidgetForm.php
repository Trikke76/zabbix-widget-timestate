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
				(new CWidgetFieldTextBox('merge_shorter_than', _('Merge short segments (< seconds, 0 = off)')))
					->setDefault('0')
			)
			->addField(
				(new CWidgetFieldSelect('null_gap_mode', _('Null-gap mode'), [
					0 => _('Disconnected'),
					1 => _('Connected')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldSelect('null_gap_backfill_first', _('Backfill from first value'), [
					0 => _('No'),
					1 => _('Yes')
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
				(new CWidgetFieldSelect('row_group_mode', _('Row grouping'), [
					0 => _('None'),
					1 => _('Host'),
					2 => _('Data set')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldSelect('row_group_collapsed', _('Groups collapsed by default'), [
					0 => _('No'),
					1 => _('Yes')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldSelect('axis_tick_step', _('Time axis: tick interval'), [
					0 => _('Auto'),
					60 => _('1 minute'),
					300 => _('5 minutes'),
					900 => _('15 minutes'),
					1800 => _('30 minutes'),
					3600 => _('1 hour'),
					7200 => _('2 hours'),
					14400 => _('4 hours'),
					21600 => _('6 hours'),
					43200 => _('12 hours'),
					86400 => _('1 day')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldSelect('axis_label_density', _('Time axis: label density'), [
					0 => _('Sparse'),
					1 => _('Normal'),
					2 => _('Dense')
				]))->setDefault(1)
			)
			->addField(
				(new CWidgetFieldSelect('axis_grid_mode', _('Show grid lines'), [
					0 => _('Auto'),
					1 => _('On'),
					2 => _('Off')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldSelect('legend_mode', _('Legend mode'), [
					0 => _('List'),
					1 => _('Table'),
					2 => _('Hidden')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldSelect('legend_show_count', _('Legend: show count'), [
					1 => _('Yes'),
					0 => _('No')
				]))->setDefault(1)
			)
			->addField(
				(new CWidgetFieldSelect('legend_show_duration', _('Legend: show total duration'), [
					1 => _('Yes'),
					0 => _('No')
				]))->setDefault(1)
			)
			->addField(
				(new CWidgetFieldSelect('segment_label_mode', _('Segment labels'), [
					0 => _('Auto'),
					1 => _('Always'),
					2 => _('Never')
				]))->setDefault(0)
			)
			->addField(
				(new CWidgetFieldTextBox('state_map', _('Value mappings (comma separated)')))
					->setDefault('value:0=OK|#2E7D32,value:1=Problem|#C62828')
			)
			->addField(
				(new CWidgetFieldTextBox('datasets_json', _('Data sets')))
					->setDefault('')
			);
	}
}
