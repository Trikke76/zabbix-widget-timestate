<?php

declare(strict_types = 1);

/** @var array $data */

$form = new CWidgetFormView($data);

$form->addField(new CWidgetFieldMultiSelectHostView($data['fields']['hostids']));
$form->addField(new CWidgetFieldSelectView($data['fields']['row_sort']));
$form->addField(new CWidgetFieldSelectView($data['fields']['page_size']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['row_height']));
$form->addField(new CWidgetFieldSelectView($data['fields']['line_width']));
$form->addField(new CWidgetFieldSelectView($data['fields']['fill_opacity']));
$form->addField(new CWidgetFieldSelectView($data['fields']['panel_transparent']));
$form->addField(new CWidgetFieldSelectView($data['fields']['row_group_mode']));
$form->addField(new CWidgetFieldSelectView($data['fields']['row_group_collapsed']));
$form->addField(new CWidgetFieldSelectView($data['fields']['axis_tick_step']));
$form->addField(new CWidgetFieldSelectView($data['fields']['axis_label_density']));
$form->addField(new CWidgetFieldSelectView($data['fields']['axis_grid_mode']));
$form->addField(new CWidgetFieldSelectView($data['fields']['legend_mode']));
$form->addField(new CWidgetFieldSelectView($data['fields']['legend_show_count']));
$form->addField(new CWidgetFieldSelectView($data['fields']['legend_show_duration']));
$form->addField(new CWidgetFieldSelectView($data['fields']['legend_placement']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['legend_width']));
$form->addField(new CWidgetFieldSelectView($data['fields']['segment_label_mode']));
$form->addField(new CWidgetFieldSelectView($data['fields']['segment_value_align']));
$form->addField(new CWidgetFieldSelectView($data['fields']['tooltip_mode']));
$form->addField(new CWidgetFieldSelectView($data['fields']['tooltip_sort_order']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['tooltip_max_width']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['tooltip_max_height']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['display_decimals']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['display_no_value']));
$form->addField(new CWidgetFieldTextBoxView($data['fields']['datasets_json']));

$widget_edit_js = file_get_contents(__DIR__.'/../assets/js/widget.edit.js');
if ($widget_edit_js !== false) {
	$form->addJavaScript($widget_edit_js);
}
$form->addJavaScript('window.timestate_widget_form.init();');

$form->show();
