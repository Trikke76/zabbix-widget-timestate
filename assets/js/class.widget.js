window.CWidgetTimeState = class extends CWidget {
	onStart() {
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
		const ticks = this._buildTicks(timeFrom, timeTo, 8);
		const legendMode = Math.max(0, Math.min(2, Number(model.legend_mode ?? 0)));
		const legendShowCount = Number(model.legend_show_count ?? 1) === 1;
		const legendShowDuration = Number(model.legend_show_duration ?? 1) === 1;
		const segmentLabelMode = Math.max(0, Math.min(2, Number(model.segment_label_mode ?? 0)));

		const legend = new Map();
		const table = document.createElement('div');
		table.className = 'timestate__table';
		const tooltip = this._createTooltip(root);

		for (const row of rows) {
			const rowEl = document.createElement('div');
			rowEl.className = 'timestate__row';

			const labelEl = document.createElement('div');
			labelEl.className = 'timestate__label';
			const fullLabel = String(row.row_label || row.key_ || row.itemid || 'Row');
			labelEl.textContent = this._shortRowLabel(fullLabel);
			labelEl.title = fullLabel;

			const lane = document.createElement('div');
			lane.className = 'timestate__lane';
			this._addLaneGrid(lane, ticks, timeFrom, range);

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
				const legendLabel = this._isNumericLabel(rawLabel) ? 'Value' : rawLabel;
				const duration = Math.max(0, tTo - tFrom);

				const block = document.createElement('span');
				block.className = 'timestate__segment';
				block.style.left = `${Math.max(0, left)}%`;
				block.style.width = `${Math.max(0.3, width)}%`;
				block.style.background = color;
				const tooltipText = `Value: ${valueText}\nFrom: ${this._fmt(tFrom)}\nTo: ${this._fmt(tTo)}`;
				this._bindTooltip(block, tooltip, tooltipText);
				this._renderSegmentLabel(block, rawLabel, width, segmentLabelMode);

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
			table.appendChild(rowEl);
		}

		const axisRow = document.createElement('div');
		axisRow.className = 'timestate__row timestate__axis-row';
		const axisLabel = document.createElement('div');
		axisLabel.className = 'timestate__label timestate__label--axis';
		axisLabel.textContent = this._fmtDateOnly(timeFrom);
		axisLabel.title = this._fmt(timeFrom);
		const axis = this._buildAxisTicks(ticks, timeFrom, range);
		axisRow.appendChild(axisLabel);
		axisRow.appendChild(axis);
		root.appendChild(axisRow);
		root.appendChild(table);

		if (legendMode !== 2 && legend.size > 0) {
			const legendEntries = Array.from(legend.values());
			if (legendMode === 1) {
				root.appendChild(this._renderLegendTable(legendEntries, legendShowCount, legendShowDuration));
			}
			else if (legendEntries.length <= 40) {
				root.appendChild(this._renderLegendList(legendEntries, legendShowCount, legendShowDuration));
			}
		}
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

	_buildTicks(timeFrom, timeTo, targetCount) {
		const range = Math.max(1, timeTo - timeFrom);
		const desired = range / Math.max(2, targetCount);
		const steps = [
			60, 120, 300, 600, 900, 1800,
			3600, 7200, 14400, 21600, 43200,
			86400, 172800, 604800
		];

		let step = steps[steps.length - 1];
		for (const candidate of steps) {
			if (candidate >= desired) {
				step = candidate;
				break;
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

	_buildAxisTicks(ticks, timeFrom, range) {
		const axis = document.createElement('div');
		axis.className = 'timestate__axis-detailed';
		let prevLeft = -100;

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

			if (node.left < 6 || node.left > 94) {
				continue;
			}
			if (node.left - prevLeft < 8) {
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
			const approxWidthPct = Math.max(4, label.length * 0.9);
			if (lastLeft > -100) {
				const minGap = (lastLabelLen / 2) + (approxWidthPct / 2) + 0.8;
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

	_addLaneGrid(lane, ticks, timeFrom, range) {
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

	_bindTooltip(block, tooltip, text) {
		const show = (event) => {
			tooltip.textContent = text;
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
