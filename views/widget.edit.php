<?php

declare(strict_types = 1);

/** @var array $data */

$form = new CWidgetFormView($data);

$form->addField(new CWidgetFieldMultiSelectHostView($data['fields']['hostids']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['item_key_search']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['item_name_search']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['lookback_hours']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['max_rows']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['history_points']));
$form->addField(new CWidgetFieldSelectView($data['fields']['merge_equal_states']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['merge_shorter_than']));
$form->addField(new CWidgetFieldSelectView($data['fields']['null_gap_mode']));
$form->addField(new CWidgetFieldSelectView($data['fields']['row_sort']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['state_map']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['state_0_color']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['state_1_color']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['state_unknown_color']));

$widget_edit_js = file_get_contents(__DIR__.'/../assets/js/widget.edit.js');
if ($widget_edit_js !== false) {
	$form->addJavaScript($widget_edit_js);
}
$form->addJavaScript('window.timestate_widget_form.init();');

$form->show();
