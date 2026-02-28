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

		const legend = new Map();
		const table = document.createElement('div');
		table.className = 'timestate__table';

		for (const row of rows) {
			const rowEl = document.createElement('div');
			rowEl.className = 'timestate__row';

			const labelEl = document.createElement('div');
			labelEl.className = 'timestate__label';
			labelEl.textContent = String(row.row_label || row.key_ || row.itemid || 'Row');
			labelEl.title = labelEl.textContent;

			const lane = document.createElement('div');
			lane.className = 'timestate__lane';

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
				const label = String(seg.label || seg.state || 'State');

				const block = document.createElement('span');
				block.className = 'timestate__segment';
				block.style.left = `${Math.max(0, left)}%`;
				block.style.width = `${Math.max(0.3, width)}%`;
				block.style.background = color;
				block.title = `${label} (${this._fmt(tFrom)} - ${this._fmt(tTo)})`;

				lane.appendChild(block);

				if (!legend.has(label)) {
					legend.set(label, color);
				}
			}

			rowEl.appendChild(labelEl);
			rowEl.appendChild(lane);
			table.appendChild(rowEl);
		}

		const axis = document.createElement('div');
		axis.className = 'timestate__axis';
		axis.innerHTML = `<span>${this._fmt(timeFrom)}</span><span>${this._fmt(timeTo)}</span>`;
		root.appendChild(axis);
		root.appendChild(table);

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

	_fmt(ts) {
		if (!Number.isFinite(ts) || ts <= 0) {
			return '-';
		}
		return new Date(ts * 1000).toLocaleString();
	}

	_escape(text) {
		return String(text)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}
};
