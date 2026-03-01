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

		const legend = new Map();
		const table = document.createElement('div');
		table.className = 'timestate__table';

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
				const valueText = this._isNumericLabel(rawLabel) ? rawLabel : rawLabel;
				const legendLabel = this._isNumericLabel(rawLabel) ? 'Value' : rawLabel;

				const block = document.createElement('span');
				block.className = 'timestate__segment';
				block.style.left = `${Math.max(0, left)}%`;
				block.style.width = `${Math.max(0.3, width)}%`;
				block.style.background = color;
				block.title = `Value: ${valueText}\nFrom: ${this._fmt(tFrom)}\nTo: ${this._fmt(tTo)}`;

				lane.appendChild(block);

				if (!legend.has(legendLabel)) {
					legend.set(legendLabel, color);
				}
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

		if (legend.size <= 20) {
			const legendEl = document.createElement('div');
			legendEl.className = 'timestate__legend';
			for (const [label, color] of legend.entries()) {
				const item = document.createElement('span');
				item.className = 'timestate__legend-item';
				item.innerHTML = `<i style="background:${color}"></i>${this._escape(label)}`;
				legendEl.appendChild(item);
			}
			root.appendChild(legendEl);
		}
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

		for (const tick of ticks.items) {
			const left = ((tick.ts - timeFrom) / range) * 100;
			if (!tick.edge) {
				if (left < 8 || left > 92) {
					continue;
				}
				if (left - prevLeft < 6) {
					continue;
				}
			}

			const node = document.createElement('span');
			node.className = `timestate__axis-tick${tick.edge ? ' is-edge' : ''}`;
			node.style.left = `${Math.max(0, Math.min(100, left))}%`;
			node.textContent = this._fmtTick(tick.ts, ticks.step);
			node.title = this._fmt(tick.ts);
			axis.appendChild(node);
			prevLeft = left;
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
};
