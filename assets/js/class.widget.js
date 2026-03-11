window.CWidgetTimeState = class extends CWidget {
	onStart() {
		this._page = 1;
		this._render();
	}

	onResize() {
		this._render();
	}

	processUpdateResponse(response) {
		super.processUpdateResponse(response);
		this._render();
	}

	_render() {
		if (!this._body) {
			return;
		}

		const root = this._body.querySelector('.js-timestate-root');
		if (!root) {
			return;
		}

		let model = {};
		try {
			model = JSON.parse(root.dataset.model || '{}');
		}
		catch (_error) {
			model = {error: 'Unable to parse widget data.'};
		}

		root.innerHTML = '';

		if (model.error) {
			const err = document.createElement('div');
			err.className = 'timestate__error';
			err.textContent = model.error;
			root.appendChild(err);
			return;
		}

		const rows = Array.isArray(model.rows) ? model.rows : [];
		if (rows.length === 0) {
			const empty = document.createElement('div');
			empty.className = 'timestate__empty';
			empty.textContent = 'No timeline data for selected filters.';
			root.appendChild(empty);
			return;
		}

		const timeFrom = Number(model.time_from || 0);
		const timeTo = Number(model.time_to || 0);
		const range = Math.max(1, timeTo - timeFrom);
		const pageSize = Math.max(0, Number(model.page_size ?? 0));
		const rowHeight = Math.max(16, Math.min(120, Number(model.row_height ?? 40)));
		const lineWidth = Math.max(0, Math.min(3, Number(model.line_width ?? 0)));
		const fillOpacity = Math.max(0, Math.min(100, Number(model.fill_opacity ?? 100))) / 100;
		const panelTransparent = Number(model.panel_transparent ?? 0) === 1;
		root.style.setProperty('--ts-row-height', `${rowHeight}px`);
		root.style.setProperty('--ts-segment-line-width', `${lineWidth}px`);
		root.classList.toggle('is-panel-transparent', panelTransparent);

		const totalRows = rows.length;
		const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1;
		if (!Number.isFinite(this._page) || this._page < 1) {
			this._page = 1;
		}
		if (this._page > totalPages) {
			this._page = totalPages;
		}
		const pageStart = pageSize > 0 ? (this._page - 1) * pageSize : 0;
		const pageRows = pageSize > 0 ? rows.slice(pageStart, pageStart + pageSize) : rows;

		const axisTickStep = Math.max(0, Number(model.axis_tick_step ?? 0));
		const axisLabelDensity = Math.max(0, Math.min(2, Number(model.axis_label_density ?? 1)));
		const ticks = this._buildTicks(timeFrom, timeTo, this._targetTickCount(axisLabelDensity), axisTickStep);
		const axisGridMode = Math.max(0, Math.min(2, Number(model.axis_grid_mode ?? 0)));
		const showLaneGrid = this._resolveGridVisibility(axisGridMode, ticks.items.length, pageRows.length);
		const legendMode = Math.max(0, Math.min(2, Number(model.legend_mode ?? 0)));
		const legendShowCount = Number(model.legend_show_count ?? 1) === 1;
		const legendShowDuration = Number(model.legend_show_duration ?? 1) === 1;
		const legendPlacement = Math.max(0, Math.min(1, Number(model.legend_placement ?? 0)));
		const legendWidth = Math.max(140, Math.min(600, Number(model.legend_width ?? 260)));
		const segmentLabelMode = Math.max(0, Math.min(2, Number(model.segment_label_mode ?? 0)));
		const segmentValueAlign = Math.max(0, Math.min(2, Number(model.segment_value_align ?? 1)));
		const tooltipMode = Math.max(0, Math.min(2, Number(model.tooltip_mode ?? 0)));
		const tooltipSortOrder = Math.max(0, Math.min(2, Number(model.tooltip_sort_order ?? 0)));
		const rowGroupMode = Math.max(0, Math.min(2, Number(model.row_group_mode ?? 0)));
		const rowGroupCollapsed = Number(model.row_group_collapsed ?? 0) === 1;

		const legend = new Map();
		const table = document.createElement('div');
		table.className = 'timestate__table';
		const tooltip = this._createTooltip(root);

		const renderedRows = [];
		for (const row of pageRows) {
			const rowEl = document.createElement('div');
			rowEl.className = 'timestate__row';

			const labelEl = document.createElement('div');
			labelEl.className = 'timestate__label';
			const fullLabel = String(row.row_label || row.key_ || row.itemid || 'Row');
			labelEl.textContent = this._shortRowLabel(fullLabel);
			labelEl.title = fullLabel;

			const lane = document.createElement('div');
			lane.className = 'timestate__lane';
			this._addLaneGrid(lane, ticks, timeFrom, range, showLaneGrid);

			const segments = Array.isArray(row.segments) ? row.segments : [];
			for (const seg of segments) {
				const tFrom = Number(seg.t_from || 0);
				const tTo = Number(seg.t_to || 0);
				if (tTo <= tFrom) {
					continue;
				}

				const left = ((tFrom - timeFrom) / range) * 100;
				const width = ((tTo - tFrom) / range) * 100;
				const color = String(seg.color || '#607D8B');
				const rawLabel = String(seg.label || seg.state || 'State');
				const rawValue = String(seg.raw_value ?? '').trim();
				const valueText = rawValue !== '' ? rawValue : rawLabel;
				const displayText = rawLabel !== '' ? rawLabel : valueText;
				const legendLabel = this._isNumericLabel(rawLabel) ? 'Value' : rawLabel;
				const duration = Math.max(0, tTo - tFrom);

				const block = document.createElement('span');
				block.className = 'timestate__segment';
				block.classList.add(this._segmentAlignClass(segmentValueAlign));
				block.style.left = `${Math.max(0, left)}%`;
				block.style.width = `${Math.max(0.3, width)}%`;
				block.style.backgroundColor = this._mixColorOpaque(color, fillOpacity, '#1f2b38');
				this._renderSegmentLabel(block, displayText, width, segmentLabelMode);
				if (tooltipMode !== 2) {
					this._bindTooltip(block, tooltip, {
						mode: tooltipMode,
						sortOrder: tooltipSortOrder,
						ts: Math.floor((tFrom + tTo) / 2),
						rowLabel: this._shortRowLabel(fullLabel),
						displayText,
						valueText,
						tFrom,
						tTo,
						color,
						rows: pageRows
					});
				}

				lane.appendChild(block);

				const entry = legend.get(legendLabel) || {label: legendLabel, color, count: 0, duration: 0};
				entry.count += 1;
				entry.duration += duration;
				if (!entry.color && color) {
					entry.color = color;
				}
				legend.set(legendLabel, entry);
			}

			rowEl.appendChild(labelEl);
			rowEl.appendChild(lane);
			renderedRows.push({
				row,
				rowEl
			});
		}

		if (rowGroupMode === 0) {
			for (const entry of renderedRows) {
				table.appendChild(entry.rowEl);
			}
		}
		else {
			const groups = new Map();
			for (const entry of renderedRows) {
				const groupName = this._resolveGroupName(entry.row, rowGroupMode);
				if (!groups.has(groupName)) {
					groups.set(groupName, []);
				}
				groups.get(groupName).push(entry.rowEl);
			}

			for (const [groupName, rowEls] of groups.entries()) {
				const groupEl = document.createElement('section');
				groupEl.className = 'timestate__group';
				if (rowGroupCollapsed) {
					groupEl.classList.add('is-collapsed');
				}

				const headBtn = document.createElement('button');
				headBtn.type = 'button';
				headBtn.className = 'timestate__group-head';
				headBtn.innerHTML = `<span class="timestate__group-title">${this._escape(groupName)}</span><span class="timestate__group-meta">${rowEls.length} row(s)</span>`;

				const body = document.createElement('div');
				body.className = 'timestate__group-body';
				for (const rowEl of rowEls) {
					body.appendChild(rowEl);
				}
				if (rowGroupCollapsed) {
					body.style.display = 'none';
				}

				headBtn.addEventListener('click', () => {
					const collapsed = groupEl.classList.toggle('is-collapsed');
					body.style.display = collapsed ? 'none' : '';
				});

				groupEl.appendChild(headBtn);
				groupEl.appendChild(body);
				table.appendChild(groupEl);
			}
		}

		const axisRow = document.createElement('div');
		axisRow.className = 'timestate__row timestate__axis-row';
		const axisLabel = document.createElement('div');
		axisLabel.className = 'timestate__label timestate__label--axis';
		axisLabel.textContent = this._fmtDateOnly(timeFrom);
		axisLabel.title = this._fmt(timeFrom);
		const axis = this._buildAxisTicks(ticks, timeFrom, range, axisLabelDensity);
		axisRow.appendChild(axisLabel);
		axisRow.appendChild(axis);
		const contentWrap = document.createElement('div');
		contentWrap.className = 'timestate__content';
		contentWrap.appendChild(axisRow);
		contentWrap.appendChild(table);

		let legendEl = null;
		if (legendMode !== 2 && legend.size > 0) {
			const legendEntries = Array.from(legend.values());
			if (legendMode === 1) {
				legendEl = this._renderLegendTable(legendEntries, legendShowCount, legendShowDuration);
			}
			else if (legendEntries.length <= 40) {
				legendEl = this._renderLegendList(legendEntries, legendShowCount, legendShowDuration);
			}
		}

		if (legendEl && legendPlacement === 1) {
			const mainWrap = document.createElement('div');
			mainWrap.className = 'timestate__main timestate__main--legend-right';
			mainWrap.style.setProperty('--ts-legend-width', `${legendWidth}px`);
			legendEl.classList.add('is-right');
			mainWrap.appendChild(contentWrap);
			mainWrap.appendChild(legendEl);
			root.appendChild(mainWrap);
		}
		else {
			root.appendChild(contentWrap);
			if (legendEl) {
				root.appendChild(legendEl);
			}
		}
		if (totalPages > 1) {
			root.appendChild(this._renderPager(this._page, totalPages, totalRows, pageSize));
		}
	}

	_renderPager(page, totalPages, totalRows, pageSize) {
		const pager = document.createElement('div');
		pager.className = 'timestate__pager';

		const prev = document.createElement('button');
		prev.type = 'button';
		prev.className = 'timestate__pager-btn';
		prev.textContent = 'Previous';
		prev.disabled = page <= 1;
		prev.addEventListener('click', () => {
			if (this._page <= 1) {
				return;
			}
			this._page -= 1;
			this._render();
		});

		const meta = document.createElement('span');
		meta.className = 'timestate__pager-meta';
		meta.textContent = `Page ${page}/${totalPages} • ${totalRows} rows • ${pageSize} per page`;

		const next = document.createElement('button');
		next.type = 'button';
		next.className = 'timestate__pager-btn';
		next.textContent = 'Next';
		next.disabled = page >= totalPages;
		next.addEventListener('click', () => {
			if (this._page >= totalPages) {
				return;
			}
			this._page += 1;
			this._render();
		});

		pager.appendChild(prev);
		pager.appendChild(meta);
		pager.appendChild(next);
		return pager;
	}

	_renderLegendList(entries, showCount, showDuration) {
		const legendEl = document.createElement('div');
		legendEl.className = 'timestate__legend';
		for (const entry of entries) {
			const item = document.createElement('span');
			item.className = 'timestate__legend-item';
			const parts = [];
			if (showCount) {
				parts.push(`count ${entry.count}`);
			}
			if (showDuration) {
				parts.push(this._fmtDuration(entry.duration));
			}
			const meta = parts.length > 0 ? `<small>${this._escape(parts.join(' • '))}</small>` : '';
			item.innerHTML = `<i style="background:${entry.color}"></i><span>${this._escape(entry.label)}${meta}</span>`;
			legendEl.appendChild(item);
		}
		return legendEl;
	}

	_renderLegendTable(entries, showCount, showDuration) {
		const wrap = document.createElement('div');
		wrap.className = 'timestate__legend-table-wrap';

		const table = document.createElement('table');
		table.className = 'timestate__legend-table';
		const thead = document.createElement('thead');
		const tbody = document.createElement('tbody');

		const headCols = ['State'];
		if (showCount) {
			headCols.push('Count');
		}
		if (showDuration) {
			headCols.push('Total duration');
		}
		thead.innerHTML = `<tr>${headCols.map((col) => `<th>${this._escape(col)}</th>`).join('')}</tr>`;

		for (const entry of entries) {
			const cols = [
				`<td><span class="timestate__legend-state"><i style="background:${entry.color}"></i>${this._escape(entry.label)}</span></td>`
			];
			if (showCount) {
				cols.push(`<td class="is-num">${entry.count}</td>`);
			}
			if (showDuration) {
				cols.push(`<td class="is-num">${this._escape(this._fmtDuration(entry.duration))}</td>`);
			}
			const tr = document.createElement('tr');
			tr.innerHTML = cols.join('');
			tbody.appendChild(tr);
		}

		table.appendChild(thead);
		table.appendChild(tbody);
		wrap.appendChild(table);
		return wrap;
	}

	_buildTicks(timeFrom, timeTo, targetCount, forcedStep = 0) {
		const range = Math.max(1, timeTo - timeFrom);
		const desired = range / Math.max(2, targetCount);
		const steps = [
			60, 120, 300, 600, 900, 1800,
			3600, 7200, 14400, 21600, 43200,
			86400, 172800, 604800
		];

		let step = steps[steps.length - 1];
		if (forcedStep > 0) {
			step = forcedStep;
		}
		else {
			for (const candidate of steps) {
				if (candidate >= desired) {
					step = candidate;
					break;
				}
			}
		}

		const ticks = [{ts: timeFrom, edge: true}];
		let t = Math.ceil(timeFrom / step) * step;
		while (t < timeTo) {
			if (t > timeFrom) {
				ticks.push({ts: t, edge: false});
			}
			t += step;
		}
		ticks.push({ts: timeTo, edge: true});

		return {items: ticks, step};
	}

	_buildAxisTicks(ticks, timeFrom, range, density = 1) {
		const axis = document.createElement('div');
		axis.className = 'timestate__axis-detailed';
		let prevLeft = -100;
		const settings = this._axisDensitySettings(density);

		const nodes = [];
		for (const tick of ticks.items) {
			nodes.push({
				ts: tick.ts,
				edge: !!tick.edge,
				left: ((tick.ts - timeFrom) / range) * 100
			});
		}

		// First pass: keep start/end and a sparse set of middle ticks.
		const kept = [];
		for (const node of nodes) {
			if (node.edge) {
				kept.push(node);
				continue;
			}

			if (node.left < settings.edgeInset || node.left > (100 - settings.edgeInset)) {
				continue;
			}
			if (node.left - prevLeft < settings.minDelta) {
				continue;
			}
			kept.push(node);
			prevLeft = node.left;
		}

		// Second pass: remove overlaps between adjacent kept labels.
		const finalNodes = [];
		let lastLabelLen = 0;
		let lastLeft = -100;
		for (const node of kept) {
			const label = this._fmtTick(node.ts, ticks.step);
			const approxWidthPct = Math.max(4, label.length * settings.widthFactor);
			if (lastLeft > -100) {
				const minGap = (lastLabelLen / 2) + (approxWidthPct / 2) + settings.overlapPad;
				if (node.left - lastLeft < minGap) {
					// Prefer keeping edge labels over middle labels.
					if (node.edge) {
						finalNodes.pop();
					}
					else {
						continue;
					}
				}
			}

			finalNodes.push({...node, label});
			lastLeft = node.left;
			lastLabelLen = approxWidthPct;
		}

		for (const tickNode of finalNodes) {
			const el = document.createElement('span');
			el.className = `timestate__axis-tick${tickNode.edge ? ' is-edge' : ''}`;
			el.style.left = `${Math.max(0, Math.min(100, tickNode.left))}%`;
			el.textContent = tickNode.label;
			el.title = this._fmt(tickNode.ts);
			axis.appendChild(el);
		}

		return axis;
	}

	_targetTickCount(density) {
		if (density === 0) {
			return 6;
		}
		if (density === 2) {
			return 12;
		}
		return 8;
	}

	_axisDensitySettings(density) {
		if (density === 0) {
			return {edgeInset: 9, minDelta: 12, widthFactor: 1.0, overlapPad: 1.6};
		}
		if (density === 2) {
			return {edgeInset: 3, minDelta: 5, widthFactor: 0.72, overlapPad: 0.2};
		}
		return {edgeInset: 6, minDelta: 8, widthFactor: 0.9, overlapPad: 0.8};
	}

	_addLaneGrid(lane, ticks, timeFrom, range, showGrid = true) {
		if (!showGrid) {
			return;
		}

		for (const tick of ticks.items) {
			if (tick.edge) {
				continue;
			}
			const left = ((tick.ts - timeFrom) / range) * 100;
			const line = document.createElement('span');
			line.className = 'timestate__lane-grid';
			line.style.left = `${Math.max(0, Math.min(100, left))}%`;
			lane.appendChild(line);
		}
	}

	_resolveGridVisibility(mode, tickCount, rowCount) {
		if (mode === 1) {
			return true;
		}
		if (mode === 2) {
			return false;
		}

		// Auto: avoid visual overload on very dense timelines or very large row sets.
		if (tickCount > 16 || rowCount > 40) {
			return false;
		}
		return true;
	}

	_fmt(ts) {
		if (!Number.isFinite(ts) || ts <= 0) {
			return '-';
		}
		return new Date(ts * 1000).toLocaleString();
	}

	_fmtTick(ts, step) {
		const date = new Date(ts * 1000);
		const hh = String(date.getHours()).padStart(2, '0');
		const mm = String(date.getMinutes()).padStart(2, '0');
		if (step < 86400) {
			return `${hh}:${mm}`;
		}
		const dd = String(date.getDate()).padStart(2, '0');
		const mo = String(date.getMonth() + 1).padStart(2, '0');
		return `${dd}/${mo}`;
	}

	_fmtDateOnly(ts) {
		if (!Number.isFinite(ts) || ts <= 0) {
			return '-';
		}
		const date = new Date(ts * 1000);
		const dd = String(date.getDate()).padStart(2, '0');
		const mo = String(date.getMonth() + 1).padStart(2, '0');
		const yyyy = date.getFullYear();
		return `${dd}/${mo}/${yyyy}`;
	}

	_createTooltip(root) {
		const tip = document.createElement('div');
		tip.className = 'timestate__tooltip';
		root.appendChild(tip);
		return tip;
	}

	_bindTooltip(block, tooltip, context) {
		const show = (event) => {
			const html = this._buildTooltipHtml(context);
			if (html === '') {
				return;
			}
			tooltip.innerHTML = html;
			tooltip.style.display = 'block';
			this._positionTooltip(tooltip, event);
		};
		const move = (event) => {
			if (tooltip.style.display !== 'block') {
				return;
			}
			this._positionTooltip(tooltip, event);
		};
		const hide = () => {
			tooltip.style.display = 'none';
		};

		block.addEventListener('mouseenter', show);
		block.addEventListener('mousemove', move);
		block.addEventListener('mouseleave', hide);
	}

	_buildTooltipHtml(context) {
		const mode = Math.max(0, Math.min(2, Number(context?.mode ?? 0)));
		if (mode === 2) {
			return '';
		}

		if (mode === 1) {
			const entries = this._collectTooltipEntries(context?.rows, Number(context?.ts || 0), Number(context?.sortOrder || 0));
			if (entries.length > 0) {
				const rowsHtml = entries.map((entry) => (
					`<div class="timestate__tooltip-row">`
					+ `<i style="background:${entry.color}"></i>`
					+ `<span class="timestate__tooltip-row-name">${this._escape(entry.rowLabel)}</span>`
					+ `<span class="timestate__tooltip-row-value">${this._escape(entry.valueText)}</span>`
					+ `</div>`
				)).join('');

				return (
					`<div class="timestate__tooltip-title">${this._escape(this._fmt(Number(context?.ts || 0)))}</div>`
					+ `<div class="timestate__tooltip-list">${rowsHtml}</div>`
				);
			}
		}

		const displayText = String(context?.displayText || context?.valueText || '-');
		const valueText = String(context?.valueText || '-');
		const tFrom = Number(context?.tFrom || 0);
		const tTo = Number(context?.tTo || 0);
		let html = `<div><strong>Display:</strong> ${this._escape(displayText)}</div>`;
		if (valueText !== '' && valueText !== displayText) {
			html += `<div><strong>Value:</strong> ${this._escape(valueText)}</div>`;
		}
		html += `<div><strong>From:</strong> ${this._escape(this._fmt(tFrom))}</div>`;
		html += `<div><strong>To:</strong> ${this._escape(this._fmt(tTo))}</div>`;
		return html;
	}

	_collectTooltipEntries(rows, ts, sortOrder) {
		if (!Array.isArray(rows) || !Number.isFinite(ts) || ts <= 0) {
			return [];
		}

		const out = [];
		for (const row of rows) {
			const rowLabel = this._shortRowLabel(String(row?.row_label || row?.key_ || row?.itemid || 'Row'));
			const segments = Array.isArray(row?.segments) ? row.segments : [];
			for (const seg of segments) {
				const tFrom = Number(seg?.t_from || 0);
				const tTo = Number(seg?.t_to || 0);
				if (tTo <= tFrom || ts < tFrom || ts > tTo) {
					continue;
				}

				const rawLabel = String(seg?.label || seg?.state || 'State');
				const rawValue = String(seg?.raw_value ?? '').trim();
				const displayText = rawLabel !== '' ? rawLabel : rawValue;
				out.push({
					rowLabel,
					valueText: displayText,
					color: String(seg?.color || '#607D8B')
				});
				break;
			}
		}

		if (sortOrder === 1) {
			out.sort((a, b) => a.valueText.localeCompare(b.valueText, undefined, {numeric: true, sensitivity: 'base'}));
		}
		else if (sortOrder === 2) {
			out.sort((a, b) => b.valueText.localeCompare(a.valueText, undefined, {numeric: true, sensitivity: 'base'}));
		}

		return out;
	}

	_positionTooltip(tooltip, event) {
		const pad = 12;
		const vw = window.innerWidth || 0;
		const vh = window.innerHeight || 0;
		const rect = tooltip.getBoundingClientRect();
		let x = event.clientX + 14;
		let y = event.clientY + 14;
		if (x + rect.width + pad > vw) {
			x = Math.max(pad, event.clientX - rect.width - 14);
		}
		if (y + rect.height + pad > vh) {
			y = Math.max(pad, event.clientY - rect.height - 14);
		}
		tooltip.style.left = `${x}px`;
		tooltip.style.top = `${y}px`;
	}

	_shortRowLabel(label) {
		const text = String(label || '');
		const idx = text.indexOf('::');
		if (idx === -1) {
			return text;
		}
		return text.slice(idx + 2).trim();
	}

	_segmentAlignClass(mode) {
		if (mode === 0) {
			return 'is-align-left';
		}
		if (mode === 2) {
			return 'is-align-right';
		}
		return 'is-align-center';
	}

	_parseColorRgb(color) {
		const text = String(color || '').trim();
		const hexMatch = text.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
		if (hexMatch) {
			let hex = hexMatch[1];
			if (hex.length === 3) {
				hex = hex.split('').map((ch) => ch + ch).join('');
			}
			return {
				r: parseInt(hex.slice(0, 2), 16),
				g: parseInt(hex.slice(2, 4), 16),
				b: parseInt(hex.slice(4, 6), 16)
			};
		}

		const rgbMatch = text.match(/^rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)$/i);
		if (rgbMatch) {
			return {
				r: Math.max(0, Math.min(255, Number(rgbMatch[1]))),
				g: Math.max(0, Math.min(255, Number(rgbMatch[2]))),
				b: Math.max(0, Math.min(255, Number(rgbMatch[3])))
			};
		}

		return null;
	}

	_mixColorOpaque(color, opacity, backgroundColor) {
		const alpha = Math.max(0, Math.min(1, Number(opacity) || 0));
		const fg = this._parseColorRgb(color);
		const bg = this._parseColorRgb(backgroundColor);
		if (!fg || !bg) {
			return String(color || '#607D8B');
		}

		const mix = (f, b) => Math.round((f * alpha) + (b * (1 - alpha)));
		return `rgb(${mix(fg.r, bg.r)}, ${mix(fg.g, bg.g)}, ${mix(fg.b, bg.b)})`;
	}

	_resolveGroupName(row, mode) {
		if (mode === 1) {
			const host = String(row?.host_name || '').trim();
			if (host !== '') {
				return host;
			}
			const full = String(row?.row_label || '');
			const idx = full.indexOf('::');
			return idx > -1 ? full.slice(0, idx).trim() : 'Host';
		}
		if (mode === 2) {
			const dataset = String(row?.dataset_name || '').trim();
			return dataset !== '' ? dataset : 'Data set';
		}
		return '';
	}

	_escape(text) {
		return String(text)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	_isNumericLabel(text) {
		return /^-?\d+(?:\.\d+)?$/.test(String(text || '').trim());
	}

	_fmtDuration(seconds) {
		let left = Math.max(0, Math.round(Number(seconds) || 0));
		if (left <= 0) {
			return '0s';
		}

		const days = Math.floor(left / 86400);
		left -= days * 86400;
		const hours = Math.floor(left / 3600);
		left -= hours * 3600;
		const minutes = Math.floor(left / 60);
		left -= minutes * 60;

		const parts = [];
		if (days > 0) {
			parts.push(`${days}d`);
		}
		if (hours > 0) {
			parts.push(`${hours}h`);
		}
		if (minutes > 0) {
			parts.push(`${minutes}m`);
		}
		if (left > 0 && parts.length < 2) {
			parts.push(`${left}s`);
		}

		return parts.join(' ');
	}

	_renderSegmentLabel(block, label, widthPercent, mode) {
		if (mode === 2) {
			return;
		}
		const text = String(label || '').trim();
		if (text === '') {
			return;
		}
		const shouldShow = mode === 1 || widthPercent >= 9;
		if (!shouldShow) {
			return;
		}

		const span = document.createElement('span');
		span.className = 'timestate__segment-label';
		span.textContent = text;
		block.appendChild(span);
	}
};
