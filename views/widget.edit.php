<?php

declare(strict_types = 1);

/** @var array $data */

$form = new CWidgetFormView($data);

$form->addField(new CWidgetFieldMultiSelectHostView($data['fields']['hostids']));
$form->addField(new CWidgetFieldSelectView($data['fields']['row_sort']));
$form->addField(new CWidgetFieldSelectView($data['fields']['legend_mode']));
$form->addField(new CWidgetFieldSelectView($data['fields']['legend_show_count']));
$form->addField(new CWidgetFieldSelectView($data['fields']['legend_show_duration']));
$form->addField(new CWidgetFieldSelectView($data['fields']['segment_label_mode']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['datasets_json']));

$widget_edit_js = file_get_contents(__DIR__.'/../assets/js/widget.edit.js');
if ($widget_edit_js !== false) {
	$form->addJavaScript($widget_edit_js);
}
$form->addJavaScript('window.timestate_widget_form.init();');

$form->show();
