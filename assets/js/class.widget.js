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
		const axisTickStep = Math.max(0, Number(model.axis_tick_step ?? 0));
		const axisLabelDensity = Math.max(0, Math.min(2, Number(model.axis_label_density ?? 1)));
		const ticks = this._buildTicks(timeFrom, timeTo, this._targetTickCount(axisLabelDensity), axisTickStep);
		const axisGridMode = Math.max(0, Math.min(2, Number(model.axis_grid_mode ?? 0)));
		const showLaneGrid = this._resolveGridVisibility(axisGridMode, ticks.items.length, rows.length);
		const legendMode = Math.max(0, Math.min(2, Number(model.legend_mode ?? 0)));
		const legendShowCount = Number(model.legend_show_count ?? 1) === 1;
		const legendShowDuration = Number(model.legend_show_duration ?? 1) === 1;
		const segmentLabelMode = Math.max(0, Math.min(2, Number(model.segment_label_mode ?? 0)));
		const segmentAlign = Math.max(0, Math.min(2, Number(model.segment_align ?? 1)));
		const rowGroupMode = Math.max(0, Math.min(2, Number(model.row_group_mode ?? 0)));
		const rowGroupCollapsed = Number(model.row_group_collapsed ?? 0) === 1;

		// New feature values
		const rowHeight = Math.max(16, Number(model.row_height ?? 40));
		const fillOpacity = Math.max(0, Math.min(100, Number(model.fill_opacity ?? 95))) / 100;
		const lineWidth = Math.max(0, Math.min(10, Number(model.line_width ?? 0)));
		const pageSize = Math.max(0, Number(model.page_size ?? 0));
		const tooltipMode = Math.max(0, Math.min(2, Number(model.tooltip_mode ?? 0)));

		const legend = new Map();
		const table = document.createElement('div');
		table.className = 'timestate__table';

		// Tooltip: create one shared tooltip element
		const tooltip = tooltipMode !== 2 ? this._createTooltip(root) : null;

		// For "All" tooltip mode we need a reference to all rendered rows for cross-row lookup
		const allSegmentsByRow = [];

		const renderedRows = [];
		for (const row of rows) {
			const rowEl = document.createElement('div');
			rowEl.className = 'timestate__row';
			rowEl.style.setProperty('--ts-row-height', `${rowHeight}px`);

			const labelEl = document.createElement('div');
			labelEl.className = 'timestate__label';
			const fullLabel = String(row.row_label || row.key_ || row.itemid || 'Row');
			labelEl.textContent = this._shortRowLabel(fullLabel);
			labelEl.title = fullLabel;

			const lane = document.createElement('div');
			lane.className = 'timestate__lane';
			this._addLaneGrid(lane, ticks, timeFrom, range, showLaneGrid);

			const segments = Array.isArray(row.segments) ? row.segments : [];
			const rowSegmentData = [];

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
				block.style.opacity = String(fillOpacity);
				if (lineWidth > 0) {
					block.style.outline = `${lineWidth}px solid rgba(0,0,0,0.25)`;
					block.style.outlineOffset = '-1px';
				}

				if (tooltip && tooltipMode === 0) {
					// Single mode: tooltip only shows hovered segment
					const tooltipText = `Value: ${valueText}\nFrom: ${this._fmt(tFrom)}\nTo: ${this._fmt(tTo)}`;
					this._bindTooltip(block, tooltip, tooltipText);
				}

				this._renderSegmentLabel(block, rawLabel, width, segmentLabelMode, segmentAlign);
				lane.appendChild(block);

				rowSegmentData.push({block, tFrom, tTo, color, valueText, rowLabel: fullLabel});

				const entry = legend.get(legendLabel) || {label: legendLabel, color, count: 0, duration: 0};
				entry.count += 1;
				entry.duration += duration;
				if (!entry.color && color) {
					entry.color = color;
				}
				legend.set(legendLabel, entry);
			}

			allSegmentsByRow.push({row, rowEl, segmentData: rowSegmentData});

			rowEl.appendChild(labelEl);
			rowEl.appendChild(lane);
			renderedRows.push({
				row,
				rowEl
			});
		}

		// "All" tooltip mode: bind cross-row tooltip to each segment
		if (tooltip && tooltipMode === 1) {
			this._bindAllTooltips(allSegmentsByRow, tooltip, timeFrom, timeTo, range);
		}

		// Build the visible rows set (pagination or all)
		let currentPage = 0;
		const totalRows = renderedRows.length;
		const effectivePageSize = pageSize > 0 ? pageSize : totalRows;
		const totalPages = Math.max(1, Math.ceil(totalRows / effectivePageSize));

		const renderPage = (page) => {
			currentPage = Math.max(0, Math.min(page, totalPages - 1));
			table.innerHTML = '';

			const start = currentPage * effectivePageSize;
			const end = Math.min(start + effectivePageSize, totalRows);
			const pageRows = renderedRows.slice(start, end);

			if (rowGroupMode === 0) {
				for (const entry of pageRows) {
					table.appendChild(entry.rowEl);
				}
			}
			else {
				const groups = new Map();
				for (const entry of pageRows) {
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
		};

		const axisRow = document.createElement('div');
		axisRow.className = 'timestate__row timestate__axis-row';
		const axisLabel = document.createElement('div');
		axisLabel.className = 'timestate__label timestate__label--axis';
		axisLabel.textContent = this._fmtDateOnly(timeFrom);
		axisLabel.title = this._fmt(timeFrom);
		const axis = this._buildAxisTicks(ticks, timeFrom, range, axisLabelDensity);
		axisRow.appendChild(axisLabel);
		axisRow.appendChild(axis);
		root.appendChild(axisRow);
		root.appendChild(table);

		renderPage(0);

		// Pagination controls
		if (pageSize > 0 && totalPages > 1) {
			const pager = this._buildPager(currentPage, totalPages, (page) => {
				renderPage(page);
				// Update pager state
				pager.querySelectorAll('.timestate__page-btn').forEach((btn) => {
					btn.classList.toggle('is-active', Number(btn.dataset.page) === currentPage);
					btn.disabled = Number(btn.dataset.page) === currentPage;
				});
				pager.querySelector('.timestate__page-prev').disabled = currentPage === 0;
				pager.querySelector('.timestate__page-next').disabled = currentPage === totalPages - 1;
				pager.querySelector('.timestate__page-info').textContent =
					`Page ${currentPage + 1} of ${totalPages} (${start + 1}–${Math.min(start + effectivePageSize, totalRows)} of ${totalRows} rows)`;
			});
			root.appendChild(pager);
		}

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

	_buildPager(initialPage, totalPages, onNavigate) {
		const pager = document.createElement('div');
		pager.className = 'timestate__pager';

		const prevBtn = document.createElement('button');
		prevBtn.type = 'button';
		prevBtn.className = 'timestate__page-prev';
		prevBtn.textContent = '‹ Prev';
		prevBtn.disabled = initialPage === 0;
		prevBtn.addEventListener('click', () => onNavigate(
			Number(pager.querySelector('.timestate__page-btn.is-active')?.dataset.page ?? 0) - 1
		));

		const pageInfo = document.createElement('span');
		pageInfo.className = 'timestate__page-info';

		const nextBtn = document.createElement('button');
		nextBtn.type = 'button';
		nextBtn.className = 'timestate__page-next';
		nextBtn.textContent = 'Next ›';
		nextBtn.disabled = initialPage === totalPages - 1;
		nextBtn.addEventListener('click', () => onNavigate(
			Number(pager.querySelector('.timestate__page-btn.is-active')?.dataset.page ?? 0) + 1
		));

		// Page number buttons (max 7 visible with ellipsis)
		const btnGroup = document.createElement('div');
		btnGroup.className = 'timestate__page-btns';

		const maxVisible = 7;
		const buildPageBtns = (activePage) => {
			btnGroup.innerHTML = '';
			const pages = this._pagerPages(activePage, totalPages, maxVisible);
			for (const p of pages) {
				if (p === null) {
					const sep = document.createElement('span');
					sep.className = 'timestate__page-sep';
					sep.textContent = '…';
					btnGroup.appendChild(sep);
				}
				else {
					const btn = document.createElement('button');
					btn.type = 'button';
					btn.className = `timestate__page-btn${p === activePage ? ' is-active' : ''}`;
					btn.dataset.page = String(p);
					btn.textContent = String(p + 1);
					btn.disabled = p === activePage;
					btn.addEventListener('click', () => onNavigate(p));
					btnGroup.appendChild(btn);
				}
			}
		};

		buildPageBtns(initialPage);

		// Wrap the original onNavigate to also rebuild page buttons
		const originalNavigate = onNavigate;
		const wrappedNavigate = (page) => {
			originalNavigate(page);
			buildPageBtns(page);
		};
		prevBtn.replaceWith(prevBtn.cloneNode(true));
		nextBtn.replaceWith(nextBtn.cloneNode(true));

		// Re-add listeners with wrapped navigate
		const prev2 = document.createElement('button');
		prev2.type = 'button';
		prev2.className = 'timestate__page-prev';
		prev2.textContent = '‹ Prev';
		prev2.disabled = initialPage === 0;
		prev2.addEventListener('click', () => {
			const active = Number(pager.querySelector('.timestate__page-btn.is-active')?.dataset.page ?? 0);
			if (active > 0) {
				wrappedNavigate(active - 1);
				prev2.disabled = active - 1 === 0;
				next2.disabled = false;
			}
		});

		const next2 = document.createElement('button');
		next2.type = 'button';
		next2.className = 'timestate__page-next';
		next2.textContent = 'Next ›';
		next2.disabled = initialPage === totalPages - 1;
		next2.addEventListener('click', () => {
			const active = Number(pager.querySelector('.timestate__page-btn.is-active')?.dataset.page ?? 0);
			if (active < totalPages - 1) {
				wrappedNavigate(active + 1);
				next2.disabled = active + 1 === totalPages - 1;
				prev2.disabled = false;
			}
		});

		// Rebuild buildPageBtns to also control prev/next disabled state
		const buildPageBtns2 = (activePage) => {
			btnGroup.innerHTML = '';
			const pages = this._pagerPages(activePage, totalPages, maxVisible);
			for (const p of pages) {
				if (p === null) {
					const sep = document.createElement('span');
					sep.className = 'timestate__page-sep';
					sep.textContent = '…';
					btnGroup.appendChild(sep);
				}
				else {
					const btn = document.createElement('button');
					btn.type = 'button';
					btn.className = `timestate__page-btn${p === activePage ? ' is-active' : ''}`;
					btn.dataset.page = String(p);
					btn.textContent = String(p + 1);
					btn.disabled = p === activePage;
					btn.addEventListener('click', () => {
						onNavigate(p);
						buildPageBtns2(p);
						prev2.disabled = p === 0;
						next2.disabled = p === totalPages - 1;
						pageInfo.textContent = this._pagerInfoText(p, totalPages);
					});
					btnGroup.appendChild(btn);
				}
			}
			pageInfo.textContent = this._pagerInfoText(activePage, totalPages);
		};

		buildPageBtns2(initialPage);

		pager.appendChild(prev2);
		pager.appendChild(btnGroup);
		pager.appendChild(next2);
		pager.appendChild(pageInfo);
		return pager;
	}

	_pagerInfoText(page, totalPages) {
		return `Page ${page + 1} / ${totalPages}`;
	}

	_pagerPages(activePage, totalPages, maxVisible) {
		if (totalPages <= maxVisible) {
			return Array.from({length: totalPages}, (_, i) => i);
		}
		const pages = [];
		const half = Math.floor(maxVisible / 2);
		let start = Math.max(0, activePage - half);
		let end = start + maxVisible - 1;
		if (end >= totalPages) {
			end = totalPages - 1;
			start = Math.max(0, end - maxVisible + 1);
		}
		if (start > 0) {
			pages.push(0);
			if (start > 1) {
				pages.push(null);
			}
		}
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		if (end < totalPages - 1) {
			if (end < totalPages - 2) {
				pages.push(null);
			}
			pages.push(totalPages - 1);
		}
		return pages;
	}

	_bindAllTooltips(allSegmentsByRow, tooltip, timeFrom, timeTo, range) {
		// For each segment block, show all rows' state at the hovered timestamp
		for (const {segmentData, row} of allSegmentsByRow) {
			for (const {block, tFrom, tTo} of segmentData) {
				const show = (event) => {
					// Determine approximate time position of mouse within the lane
					const lane = block.closest('.timestate__lane');
					const laneRect = lane ? lane.getBoundingClientRect() : null;
					let hoverTs = (tFrom + tTo) / 2;
					if (laneRect) {
						const relX = Math.max(0, Math.min(1, (event.clientX - laneRect.left) / laneRect.width));
						hoverTs = timeFrom + relX * (timeTo - timeFrom);
					}

					const lines = [];
					for (const otherRow of allSegmentsByRow) {
						const matchingSeg = otherRow.segmentData.find(
							(s) => hoverTs >= s.tFrom && hoverTs < s.tTo
						);
						const label = this._shortRowLabel(String(otherRow.row.row_label || ''));
						if (matchingSeg) {
							const marker = otherRow.row === row ? '▶ ' : '  ';
							lines.push(`${marker}${label}: ${matchingSeg.valueText}`);
						}
					}

					tooltip.innerHTML = '';
					tooltip.textContent = lines.join('\n');
					tooltip.style.display = 'block';
					this._positionTooltip(tooltip, event);
				};

				const move = (event) => {
					if (tooltip.style.display !== 'block') {
						return;
					}
					show(event);
					this._positionTooltip(tooltip, event);
				};

				const hide = () => {
					tooltip.style.display = 'none';
				};

				block.addEventListener('mouseenter', show);
				block.addEventListener('mousemove', move);
				block.addEventListener('mouseleave', hide);
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

		const finalNodes = [];
		let lastLabelLen = 0;
		let lastLeft = -100;
		for (const node of kept) {
			const label = this._fmtTick(node.ts, ticks.step);
			const approxWidthPct = Math.max(4, label.length * settings.widthFactor);
			if (lastLeft > -100) {
				const minGap = (lastLabelLen / 2) + (approxWidthPct / 2) + settings.overlapPad;
				if (node.left - lastLeft < minGap) {
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

	_renderSegmentLabel(block, label, widthPercent, mode, align = 1) {
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

		// 0 = left, 1 = center, 2 = right
		if (align === 0) {
			block.style.justifyContent = 'flex-start';
		}
		else if (align === 2) {
			block.style.justifyContent = 'flex-end';
		}
		else {
			block.style.justifyContent = 'center';
		}

		block.appendChild(span);
	}
};
