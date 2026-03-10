(function() {
	function normalizeHexColor(value, fallback) {
		const text = String(value || '').trim();
		if (/^#[0-9a-fA-F]{6}$/.test(text)) {
			return text.toUpperCase();
		}
		if (/^[0-9a-fA-F]{6}$/.test(text)) {
			return `#${text.toUpperCase()}`;
		}
		return fallback;
	}

	function ensureModernBulkPickerStyle() {
		if (document.getElementById('port24-modern-picker-style')) {
			return;
		}

		const style = document.createElement('style');
		style.id = 'port24-modern-picker-style';
		style.textContent = [
			'.port24-modern-picker{position:relative;display:inline-flex;align-items:center;}',
			'.port24-modern-picker .port24-swatch-btn{width:auto;height:auto;border:0;background:transparent;padding:0;cursor:pointer;box-shadow:none;outline:none;}',
			'.port24-modern-picker .port24-swatch-btn span{display:block;width:44px;height:22px;border-radius:6px;}',
			'.port24-pop{position:fixed;z-index:100050;top:0;left:0;min-width:230px;background:#141a22;border:1px solid #2f3947;border-radius:10px;box-shadow:0 12px 28px rgba(0,0,0,.45);padding:10px;color:#d9e2ec;}',
			'.port24-pop.is-hidden{display:none;}',
			'.port24-pop .port24-tabs{display:flex;gap:6px;margin:0 0 10px 0;}',
			'.port24-pop .port24-tab{border:1px solid #344154;background:#1b2430;color:#c9d5e2;border-radius:6px;padding:4px 8px;cursor:pointer;}',
			'.port24-pop .port24-tab.is-active{background:#2e6f47;border-color:#3f8b5f;color:#fff;}',
			'.port24-pop .port24-grid{display:grid;grid-template-columns:repeat(10,18px);gap:8px;margin:0 0 10px 0;}',
			'.port24-pop .port24-dot{appearance:none;-webkit-appearance:none;display:block;width:18px;height:18px;min-width:18px;min-height:18px;box-sizing:border-box;border-radius:9999px;border:1px solid rgba(255,255,255,.22);cursor:pointer;padding:0;margin:0;line-height:0;font-size:0;}',
			'.port24-pop .port24-custom input{width:100%;background:#0f151d;color:#e5edf5;border:1px solid #354255;border-radius:6px;padding:6px 8px;}',
			'.port24-pop .port24-custom-actions{margin-top:8px;display:flex;justify-content:flex-end;}',
			'.port24-pop .port24-custom-apply{border:1px solid #3b82f6;background:#0f172a;color:#e2ecff;border-radius:6px;padding:4px 10px;cursor:pointer;}',
			'.port24-pop .port24-custom-harmony{margin-top:10px;border-top:1px solid #2d3746;padding-top:8px;}',
			'.port24-pop .port24-custom-harmony-title{font-size:11px;color:#9fb2c8;margin:0 0 6px 0;}',
			'.port24-pop .port24-custom-wheel{margin:0 0 10px 0;padding:0 0 10px 0;border-bottom:1px solid #2d3746;}',
			'.port24-pop .port24-custom-wheel-title{font-size:11px;color:#9fb2c8;margin:0 0 6px 0;}',
			'.port24-pop .port24-wheel-wrap{display:grid;grid-template-columns:96px minmax(0,1fr);align-items:center;column-gap:10px;width:100%;}',
			'.port24-pop .port24-wheel{position:relative;width:96px;height:96px;min-width:96px;max-width:96px;min-height:96px;max-height:96px;flex:0 0 96px;aspect-ratio:1 / 1;border-radius:50%;border:1px solid #3a4655;background:conic-gradient(#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000);cursor:crosshair;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25);}',
			'.port24-pop .port24-wheel-thumb{position:absolute;width:10px;height:10px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.55);pointer-events:none;transform:translate(-50%,-50%);}',
			'.port24-pop .port24-wheel-controls{min-width:0;width:100%;display:grid;row-gap:6px;}',
			'.port24-pop .port24-wheel-row{display:grid;grid-template-columns:20px minmax(0,1fr);align-items:center;column-gap:6px;}',
			'.port24-pop .port24-wheel-row label{font-size:11px;color:#9fb2c8;}',
			'.port24-pop .port24-wheel-row input[type="range"]{display:block;width:100%;max-width:100%;min-width:0;margin:0;box-sizing:border-box;}',
			'.port24-pop .port24-harmony-modes{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px 0;}',
			'.port24-pop .port24-harmony-mode{border:1px solid #344154;background:#1b2430;color:#c9d5e2;border-radius:6px;padding:3px 7px;cursor:pointer;font-size:11px;}',
			'.port24-pop .port24-harmony-mode.is-active{background:#2e6f47;border-color:#3f8b5f;color:#fff;}',
			'.port24-pop .port24-harmony-grid{display:grid;grid-template-columns:repeat(6, minmax(0,1fr));gap:6px;}',
			'.port24-pop .port24-harmony-dot{appearance:none;-webkit-appearance:none;display:block;width:100%;height:20px;min-height:20px;box-sizing:border-box;border-radius:6px;border:1px solid rgba(255,255,255,.25);cursor:pointer;padding:0;margin:0;line-height:0;font-size:0;}',
			'.port24-pop .port24-custom.is-hidden,.port24-pop .port24-colors.is-hidden{display:none;}'
		].join('');
		document.head.appendChild(style);
	}

	function createModernBulkPicker(initialColor) {
		ensureModernBulkPickerStyle();

		const palette = [
			'#7F1D1D', '#991B1B', '#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA',
			'#7C2D12', '#9A3412', '#C2410C', '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA',
			'#78350F', '#92400E', '#B45309', '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A',
			'#713F12', '#854D0E', '#A16207', '#CA8A04', '#EAB308', '#FACC15', '#FDE047', '#FEF08A',
			'#365314', '#3F6212', '#4D7C0F', '#65A30D', '#84CC16', '#A3E635', '#BEF264', '#D9F99D',
			'#14532D', '#166534', '#15803D', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0',
			'#134E4A', '#115E59', '#0F766E', '#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4',
			'#164E63', '#155E75', '#0369A1', '#0284C7', '#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD',
			'#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE',
			'#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE',
			'#9F1239', '#BE123C', '#DB2777', '#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8', '#FCE7F3',
			'#111827', '#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'
		];

		const root = document.createElement('div');
		root.className = 'port24-modern-picker';

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'port24-swatch-btn';
		button.title = 'Choose color';

		const swatch = document.createElement('span');
		button.appendChild(swatch);

		const pop = document.createElement('div');
		pop.className = 'port24-pop is-hidden';

		const tabs = document.createElement('div');
		tabs.className = 'port24-tabs';

		const tabColors = document.createElement('button');
		tabColors.type = 'button';
		tabColors.className = 'port24-tab is-active';
		tabColors.textContent = 'Colors';

		const tabCustom = document.createElement('button');
		tabCustom.type = 'button';
		tabCustom.className = 'port24-tab';
		tabCustom.textContent = 'Custom';

		tabs.appendChild(tabColors);
		tabs.appendChild(tabCustom);

		const colorsWrap = document.createElement('div');
		colorsWrap.className = 'port24-colors';
		const grid = document.createElement('div');
		grid.className = 'port24-grid';
		colorsWrap.appendChild(grid);

		const customWrap = document.createElement('div');
		customWrap.className = 'port24-custom is-hidden';
		const customInput = document.createElement('input');
		customInput.type = 'text';
		customInput.maxLength = 7;
		customInput.placeholder = '#D1D5DB';
		customWrap.appendChild(customInput);
		const customActions = document.createElement('div');
		customActions.className = 'port24-custom-actions';
		const customApply = document.createElement('button');
		customApply.type = 'button';
		customApply.className = 'port24-custom-apply';
		customApply.textContent = 'Apply';
		customActions.appendChild(customApply);
		customWrap.appendChild(customActions);

		const wheelWrap = document.createElement('div');
		wheelWrap.className = 'port24-custom-wheel';
		const wheelTitle = document.createElement('div');
		wheelTitle.className = 'port24-custom-wheel-title';
		wheelTitle.textContent = 'Wheel';
		const wheelBody = document.createElement('div');
		wheelBody.className = 'port24-wheel-wrap';
		const wheel = document.createElement('div');
		wheel.className = 'port24-wheel';
		const wheelThumb = document.createElement('span');
		wheelThumb.className = 'port24-wheel-thumb';
		wheel.appendChild(wheelThumb);
		const wheelControls = document.createElement('div');
		wheelControls.className = 'port24-wheel-controls';
		const satRow = document.createElement('div');
		satRow.className = 'port24-wheel-row';
		const satLabel = document.createElement('label');
		satLabel.textContent = 'S';
		const satRange = document.createElement('input');
		satRange.type = 'range';
		satRange.min = '0';
		satRange.max = '100';
		satRange.step = '1';
		satRow.appendChild(satLabel);
		satRow.appendChild(satRange);
		const lightRow = document.createElement('div');
		lightRow.className = 'port24-wheel-row';
		const lightLabel = document.createElement('label');
		lightLabel.textContent = 'L';
		const lightRange = document.createElement('input');
		lightRange.type = 'range';
		lightRange.min = '0';
		lightRange.max = '100';
		lightRange.step = '1';
		lightRow.appendChild(lightLabel);
		lightRow.appendChild(lightRange);
		wheelControls.appendChild(satRow);
		wheelControls.appendChild(lightRow);
		wheelBody.appendChild(wheel);
		wheelBody.appendChild(wheelControls);
		wheelWrap.appendChild(wheelTitle);
		wheelWrap.appendChild(wheelBody);
		customWrap.appendChild(wheelWrap);

		const harmonyWrap = document.createElement('div');
		harmonyWrap.className = 'port24-custom-harmony';
		const harmonyTitle = document.createElement('div');
		harmonyTitle.className = 'port24-custom-harmony-title';
		harmonyTitle.textContent = 'Harmony';
		const harmonyModes = document.createElement('div');
		harmonyModes.className = 'port24-harmony-modes';
		const harmonyGrid = document.createElement('div');
		harmonyGrid.className = 'port24-harmony-grid';
		harmonyWrap.appendChild(harmonyTitle);
		harmonyWrap.appendChild(harmonyModes);
		harmonyWrap.appendChild(harmonyGrid);
		customWrap.appendChild(harmonyWrap);

		pop.appendChild(tabs);
		pop.appendChild(colorsWrap);
		pop.appendChild(customWrap);
		root.appendChild(button);
		document.body.appendChild(pop);
		pop._ownerPicker = root;

		let value = normalizeHexColor(initialColor, '#D1D5DB');
		let selectedHarmonyMode = 'analog';
		let currentHsl = null;

		const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
		const round = (n) => Math.round(n);
		const wrapDeg = (deg) => {
			let v = deg % 360;
			if (v < 0) {
				v += 360;
			}
			return v;
		};
		const hexToRgb = (hex) => {
			const normalized = normalizeHexColor(hex, '#D1D5DB');
			const raw = normalized.slice(1);
			return {
				r: parseInt(raw.slice(0, 2), 16),
				g: parseInt(raw.slice(2, 4), 16),
				b: parseInt(raw.slice(4, 6), 16)
			};
		};
		const rgbToHex = (rgb) => {
			const toHex = (v) => clamp(round(v), 0, 255).toString(16).padStart(2, '0').toUpperCase();
			return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
		};
		const rgbToHsl = (rgb) => {
			const r = rgb.r / 255;
			const g = rgb.g / 255;
			const b = rgb.b / 255;
			const max = Math.max(r, g, b);
			const min = Math.min(r, g, b);
			const delta = max - min;
			let h = 0;
			const l = (max + min) / 2;
			let s = 0;
			if (delta !== 0) {
				s = delta / (1 - Math.abs(2 * l - 1));
				switch (max) {
					case r:
						h = 60 * (((g - b) / delta) % 6);
						break;
					case g:
						h = 60 * (((b - r) / delta) + 2);
						break;
					default:
						h = 60 * (((r - g) / delta) + 4);
						break;
				}
			}
			return {
				h: wrapDeg(h),
				s: clamp(s * 100, 0, 100),
				l: clamp(l * 100, 0, 100)
			};
		};
		const hslToRgb = (hsl) => {
			const h = wrapDeg(hsl.h) / 360;
			const s = clamp(hsl.s, 0, 100) / 100;
			const l = clamp(hsl.l, 0, 100) / 100;
			if (s === 0) {
				const v = round(l * 255);
				return {r: v, g: v, b: v};
			}
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			const hue2rgb = (t) => {
				let tt = t;
				if (tt < 0) {
					tt += 1;
				}
				if (tt > 1) {
					tt -= 1;
				}
				if (tt < 1 / 6) {
					return p + (q - p) * 6 * tt;
				}
				if (tt < 1 / 2) {
					return q;
				}
				if (tt < 2 / 3) {
					return p + (q - p) * (2 / 3 - tt) * 6;
				}
				return p;
			};
			return {
				r: round(hue2rgb(h + 1 / 3) * 255),
				g: round(hue2rgb(h) * 255),
				b: round(hue2rgb(h - 1 / 3) * 255)
			};
		};
		const buildHarmonyColors = (baseHex, mode) => {
			const baseHsl = rgbToHsl(hexToRgb(baseHex));
			const withHsl = (hShift = 0, sShift = 0, lShift = 0) => rgbToHex(hslToRgb({
				h: wrapDeg(baseHsl.h + hShift),
				s: clamp(baseHsl.s + sShift, 12, 95),
				l: clamp(baseHsl.l + lShift, 8, 92)
			}));
			switch (mode) {
				case 'mono':
					return [-22, -12, -4, 8, 16, 24].map((lShift) => withHsl(0, 0, lShift));
				case 'complement':
					return [
						withHsl(0, 8, -10), withHsl(0, 0, 8), withHsl(0, -6, 20),
						withHsl(180, 8, -10), withHsl(180, 0, 8), withHsl(180, -6, 20)
					];
				case 'split':
					return [
						withHsl(0, 8, -8), withHsl(0, -4, 10),
						withHsl(150, 0, 0), withHsl(150, -8, 14),
						withHsl(210, 0, 0), withHsl(210, -8, 14)
					];
				case 'triad':
					return [
						withHsl(0, 6, -8), withHsl(0, -4, 12),
						withHsl(120, 4, -4), withHsl(120, -8, 12),
						withHsl(240, 4, -4), withHsl(240, -8, 12)
					];
				default:
					return [
						withHsl(-28, 4, 0), withHsl(-14, 2, 6), withHsl(0, 0, 0),
						withHsl(14, 2, 6), withHsl(28, 4, 0), withHsl(42, 0, 10)
					];
			}
		};
		const renderHarmonyGrid = () => {
			harmonyGrid.innerHTML = '';
			const colors = buildHarmonyColors(value, selectedHarmonyMode);
			for (const color of colors) {
				const dot = document.createElement('button');
				dot.type = 'button';
				dot.className = 'port24-harmony-dot';
				dot.style.background = color;
				dot.title = color;
				dot.addEventListener('click', () => setValue(color));
				harmonyGrid.appendChild(dot);
			}
		};
		const updateWheelThumb = () => {
			if (!currentHsl) {
				return;
			}
			const radius = 48;
			const angle = (currentHsl.h * Math.PI) / 180;
			const dist = (clamp(currentHsl.s, 0, 100) / 100) * radius;
			const x = 48 + (Math.cos(angle) * dist);
			const y = 48 + (Math.sin(angle) * dist);
			wheelThumb.style.left = `${x}px`;
			wheelThumb.style.top = `${y}px`;
			satRange.value = String(round(clamp(currentHsl.s, 0, 100)));
			lightRange.value = String(round(clamp(currentHsl.l, 0, 100)));
		};
		const setFromHsl = (hsl, emit = true) => {
			currentHsl = {h: wrapDeg(hsl.h), s: clamp(hsl.s, 0, 100), l: clamp(hsl.l, 0, 100)};
			value = rgbToHex(hslToRgb(currentHsl));
			swatch.style.background = value;
			customInput.value = value;
			renderHarmonyGrid();
			updateWheelThumb();
			if (emit) {
				root.dispatchEvent(new CustomEvent('port24-color-change', {detail: {value}}));
			}
		};
		const addHarmonyMode = (key, label) => {
			const modeBtn = document.createElement('button');
			modeBtn.type = 'button';
			modeBtn.className = `port24-harmony-mode${key === selectedHarmonyMode ? ' is-active' : ''}`;
			modeBtn.textContent = label;
			modeBtn.addEventListener('click', () => {
				selectedHarmonyMode = key;
				for (const el of harmonyModes.querySelectorAll('.port24-harmony-mode')) {
					el.classList.toggle('is-active', el === modeBtn);
				}
				renderHarmonyGrid();
			});
			harmonyModes.appendChild(modeBtn);
		};
		addHarmonyMode('analog', 'Analog');
		addHarmonyMode('mono', 'Mono');
		addHarmonyMode('complement', 'Complement');
		addHarmonyMode('split', 'Split');
		addHarmonyMode('triad', 'Triad');

		const setValue = (color, emit = true) => {
			value = normalizeHexColor(color, value);
			currentHsl = rgbToHsl(hexToRgb(value));
			swatch.style.background = value;
			customInput.value = value;
			renderHarmonyGrid();
			updateWheelThumb();
			if (emit) {
				root.dispatchEvent(new CustomEvent('port24-color-change', {detail: {value}}));
			}
		};

		let colorsBuilt = false;
		const positionPop = () => {
			const pad = 8;
			const rect = button.getBoundingClientRect();
			const vw = window.innerWidth || document.documentElement.clientWidth || 0;
			const vh = window.innerHeight || document.documentElement.clientHeight || 0;
			const popRect = pop.getBoundingClientRect();

			let left = Math.round(rect.left);
			let top = Math.round(rect.bottom + 6);

			// Prefer below the button; if not enough space, flip above.
			if (top + popRect.height + pad > vh) {
				top = Math.round(rect.top - popRect.height - 6);
			}
			// Clamp vertically inside viewport.
			top = Math.max(pad, Math.min(top, Math.max(pad, vh - popRect.height - pad)));

			// Keep fully visible horizontally.
			if (left + popRect.width + pad > vw) {
				left = vw - popRect.width - pad;
			}
			left = Math.max(pad, left);

			pop.style.top = `${top}px`;
			pop.style.left = `${left}px`;
		};
		const closePop = () => {
			pop.classList.add('is-hidden');
		};
		const openPop = () => {
			ensureColorDots();
			pop.classList.remove('is-hidden');
			positionPop();
		};
		const ensureColorDots = () => {
			if (colorsBuilt) {
				return;
			}
			for (const color of palette) {
				const dot = document.createElement('button');
				dot.type = 'button';
				dot.className = 'port24-dot';
				dot.style.background = color;
				dot.addEventListener('click', () => {
					setValue(color);
					closePop();
				});
				grid.appendChild(dot);
			}
			colorsBuilt = true;
		};

		const showColors = () => {
			ensureColorDots();
			tabColors.classList.add('is-active');
			tabCustom.classList.remove('is-active');
			colorsWrap.classList.remove('is-hidden');
			customWrap.classList.add('is-hidden');
		};
		const showCustom = () => {
			tabCustom.classList.add('is-active');
			tabColors.classList.remove('is-active');
			customWrap.classList.remove('is-hidden');
			colorsWrap.classList.add('is-hidden');
		};

		tabColors.addEventListener('click', showColors);
		tabCustom.addEventListener('click', showCustom);
		customInput.addEventListener('change', () => setValue(customInput.value));
		customInput.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				setValue(customInput.value);
			}
		});
		customApply.addEventListener('click', () => {
			setValue(customInput.value);
			closePop();
		});
		satRange.addEventListener('input', () => {
			if (!currentHsl) {
				currentHsl = rgbToHsl(hexToRgb(value));
			}
			setFromHsl({h: currentHsl.h, s: Number(satRange.value || 0), l: currentHsl.l});
		});
		lightRange.addEventListener('input', () => {
			if (!currentHsl) {
				currentHsl = rgbToHsl(hexToRgb(value));
			}
			setFromHsl({h: currentHsl.h, s: currentHsl.s, l: Number(lightRange.value || 0)});
		});
		const applyHueFromPointer = (event) => {
			const rect = wheel.getBoundingClientRect();
			const cx = rect.left + (rect.width / 2);
			const cy = rect.top + (rect.height / 2);
			const dx = event.clientX - cx;
			const dy = event.clientY - cy;
			const angleRad = Math.atan2(dy, dx);
			const hue = wrapDeg((angleRad * 180) / Math.PI);
			const radius = rect.width / 2;
			const dist = Math.min(radius, Math.sqrt((dx * dx) + (dy * dy)));
			const satFromWheel = clamp((dist / radius) * 100, 0, 100);
			if (!currentHsl) {
				currentHsl = rgbToHsl(hexToRgb(value));
			}
			setFromHsl({h: hue, s: satFromWheel, l: currentHsl.l});
		};
		let wheelDragging = false;
		wheel.addEventListener('mousedown', (event) => {
			wheelDragging = true;
			applyHueFromPointer(event);
		});
		document.addEventListener('mousemove', (event) => {
			if (!wheelDragging) {
				return;
			}
			applyHueFromPointer(event);
		});
		document.addEventListener('mouseup', () => {
			wheelDragging = false;
		});

		button.addEventListener('click', () => {
			if (pop.classList.contains('is-hidden')) {
				openPop();
			}
			else {
				closePop();
			}
		});
		window.addEventListener('resize', () => {
			if (!pop.classList.contains('is-hidden')) {
				positionPop();
			}
		});
		window.addEventListener('scroll', () => {
			if (!pop.classList.contains('is-hidden')) {
				positionPop();
			}
		}, true);

		setValue(value, false);

		return {
			element: root,
			setValue,
			getValue: () => value
		};
	}

	function ensurePickerOutsideClick() {
		if (window.timestate_widget_form._onPickerOutsideClick) {
			return;
		}

		const onPickerOutsideClick = (event) => {
			const target = event.target instanceof Element ? event.target : null;
			const ownerPicker = target ? target.closest('.port24-modern-picker') : null;
			const ownerPop = target ? target.closest('.port24-pop') : null;
			for (const pop of document.querySelectorAll('.port24-pop')) {
				if (pop.classList.contains('is-hidden')) {
					continue;
				}
				if ((ownerPicker && pop._ownerPicker === ownerPicker) || ownerPop === pop) {
					continue;
				}
				pop.classList.add('is-hidden');
			}
		};

		document.addEventListener('click', onPickerOutsideClick);
		window.timestate_widget_form._onPickerOutsideClick = onPickerOutsideClick;
	}

	function isColorField(field) {
		const token = `${field.name || ''} ${field.id || ''}`;
		return /state_(0|1|unknown)_color/.test(token) || /_color/.test(token);
	}

	function enhanceColorField(field) {
		if (!field || field.dataset.timestatePickerInit === '1' || !isColorField(field)) {
			return;
		}

		const fallback = '#D1D5DB';
		field.value = normalizeHexColor(field.value, fallback);

		const picker = createModernBulkPicker(field.value);
		picker.element.addEventListener('port24-color-change', (event) => {
			field.value = normalizeHexColor(event.detail?.value, fallback);
			field.dispatchEvent(new Event('input', {bubbles: true}));
			field.dispatchEvent(new Event('change', {bubbles: true}));
		});

		field.addEventListener('input', () => {
			picker.setValue(normalizeHexColor(field.value, fallback), false);
		});

		field.parentNode.insertBefore(picker.element, field.nextSibling);
		field.dataset.timestatePickerInit = '1';
	}

	function ensureItemPreviewStyle() {
		if (document.getElementById('timestate-item-preview-style')) {
			return;
		}

		const style = document.createElement('style');
		style.id = 'timestate-item-preview-style';
		style.textContent = [
			'.timestate-item-preview{margin-top:8px;padding:8px;border:1px solid #3a4655;border-radius:6px;background:#141b24;}',
			'.timestate-item-preview-title{font-size:12px;font-weight:600;color:#d7e1ec;margin:0 0 6px 0;}',
			'.timestate-item-preview-meta{font-size:11px;color:#9fb2c8;margin:0 0 6px 0;}',
			'.timestate-item-preview-list{display:flex;flex-wrap:wrap;gap:6px;max-height:140px;overflow:auto;}',
			'.timestate-item-preview-chip{display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(15,23,34,.45);border:1px solid rgba(255,255,255,.1);color:#d4dee8;font-size:11px;max-width:420px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
			'.timestate-item-preview-empty{font-size:11px;color:#9fb2c8;}'
		].join('');
		document.head.appendChild(style);
	}

	function findField(fieldName) {
		return document.querySelector(
			`input[name="fields[${fieldName}]"], input[name="${fieldName}"], select[name="fields[${fieldName}]"], select[name="${fieldName}"]`
		);
	}

	function getHostIds() {
		const ids = [];
		const selectors = [
			'input[name="fields[hostids][]"]',
			'input[name^="fields[hostids]["]',
			'input[name="hostids[]"]',
			'input[name^="hostids["]',
			'input[name*="hostids"]',
			'#hostids input[type="hidden"]',
			'#hostids_ms input[type="hidden"]',
			'[id^="hostids"] input[type="hidden"]',
			'[data-name="hostids"] input[type="hidden"]'
		];

		for (const selector of selectors) {
			for (const input of document.querySelectorAll(selector)) {
				const value = String(input.value || '').trim();
				if (/^\d+$/.test(value)) {
					ids.push(value);
				}
			}
		}

		return Array.from(new Set(ids));
	}

	function ensureItemPreviewBox() {
		const keyField = findField('item_key_search');
		const nameField = findField('item_name_search');
		if (!keyField && !nameField) {
			return null;
		}

		const anchor = nameField || keyField;
		if (!anchor || !anchor.parentNode) {
			return null;
		}

		const existing = document.getElementById('timestate-item-preview');
		if (existing) {
			return existing;
		}

		const box = document.createElement('div');
		box.id = 'timestate-item-preview';
		box.className = 'timestate-item-preview';
		box.innerHTML = [
			'<div class="timestate-item-preview-title">Matched items</div>',
			'<div class="timestate-item-preview-meta">Type wildcard filters (for example: *cpu) to preview what will be selected.</div>',
			'<div class="timestate-item-preview-list"></div>'
		].join('');

		anchor.parentNode.insertBefore(box, anchor.nextSibling);
		return box;
	}

	function renderItemPreview(box, items, meta) {
		if (!box) {
			return;
		}

		const metaEl = box.querySelector('.timestate-item-preview-meta');
		const listEl = box.querySelector('.timestate-item-preview-list');
		if (!metaEl || !listEl) {
			return;
		}

		listEl.innerHTML = '';
		metaEl.textContent = meta;

		if (!Array.isArray(items) || items.length === 0) {
			const empty = document.createElement('div');
			empty.className = 'timestate-item-preview-empty';
			empty.textContent = 'No matching items.';
			listEl.appendChild(empty);
			return;
		}

		for (const item of items) {
			const chip = document.createElement('span');
			chip.className = 'timestate-item-preview-chip';
			chip.textContent = String(item.label || '');
			chip.title = chip.textContent;
			listEl.appendChild(chip);
		}
	}

	function parseItemsPayload(text) {
		const parsePayload = (raw) => {
			const payload = JSON.parse(raw);
			if (Array.isArray(payload.items)) {
				return payload;
			}
			if (payload.main_block) {
				const nested = JSON.parse(payload.main_block);
				if (Array.isArray(nested.items)) {
					return nested;
				}
			}
			return null;
		};

		const extractEmbeddedJson = (raw) => {
			const marker = '{"items":';
			const start = raw.indexOf(marker);
			if (start === -1) {
				return null;
			}

			let inString = false;
			let escaped = false;
			let depth = 0;
			for (let i = start; i < raw.length; i++) {
				const ch = raw[i];
				if (escaped) {
					escaped = false;
					continue;
				}
				if (ch === '\\') {
					escaped = true;
					continue;
				}
				if (ch === '"') {
					inString = !inString;
					continue;
				}
				if (inString) {
					continue;
				}
				if (ch === '{') {
					depth++;
				}
				else if (ch === '}') {
					depth--;
					if (depth === 0) {
						return raw.slice(start, i + 1);
					}
				}
			}
			return null;
		};

		try {
			const parsed = parsePayload(text);
			if (parsed !== null) {
				return parsed;
			}
		}
		catch (_error) {}

		const embedded = extractEmbeddedJson(text);
		if (embedded !== null) {
			try {
				const parsed = parsePayload(embedded);
				if (parsed !== null) {
					return parsed;
				}
			}
			catch (_error) {}
		}

		return {items: []};
	}

	async function fetchItemPreview() {
		const keyField = findField('item_key_search');
		const nameField = findField('item_name_search');
		const maxRowsField = findField('max_rows');
		const box = ensureItemPreviewBox();

		if (!box) {
			return;
		}

		const hostids = getHostIds();
		const keySearch = String(keyField?.value || '').trim();
		const nameSearch = String(nameField?.value || '').trim();
		const maxRows = Math.max(1, Math.min(200, Number(maxRowsField?.value || 20)));

		if (hostids.length === 0) {
			renderItemPreview(box, [], 'Select at least one host to preview items.');
			return;
		}

		const params = new URLSearchParams({
			action: 'widget.timestate.items',
			output: 'ajax',
			hostids_csv: hostids.join(','),
			item_key_search: keySearch,
			item_name_search: nameSearch,
			max_rows: String(maxRows)
		});

		try {
			const response = await fetch(`zabbix.php?${params.toString()}`, {
				method: 'GET',
				credentials: 'same-origin',
				headers: {'X-Requested-With': 'XMLHttpRequest'}
			});
			const text = await response.text();
			const items = parseItemsPayload(text).items || [];
			renderItemPreview(box, items, `Previewing ${items.length} matched item(s).`);
		}
		catch (_error) {
			renderItemPreview(box, [], 'Unable to load preview right now.');
		}
	}

	function ensureItemPreviewBinding() {
		if (window.timestate_widget_form._itemPreviewBound) {
			return;
		}

		ensureItemPreviewStyle();
		ensureItemPreviewBox();

		let timer = null;
		let lastSignature = '';
		const schedule = () => {
			if (timer !== null) {
				window.clearTimeout(timer);
			}
			timer = window.setTimeout(() => {
				fetchItemPreview();
			}, 250);
		};

		for (const fieldName of ['item_key_search', 'item_name_search', 'max_rows']) {
			const field = findField(fieldName);
			if (!field) {
				continue;
			}
			field.addEventListener('input', schedule);
			field.addEventListener('change', schedule);
		}

		const refreshForHostChanges = () => {
			const signature = [
				getHostIds().join(','),
				String(findField('item_key_search')?.value || '').trim(),
				String(findField('item_name_search')?.value || '').trim(),
				String(findField('max_rows')?.value || '').trim()
			].join('|');
			if (signature !== lastSignature) {
				lastSignature = signature;
				schedule();
			}
		};

		window.setInterval(refreshForHostChanges, 1000);
		refreshForHostChanges();
		window.timestate_widget_form._itemPreviewBound = true;
	}

	function ensureValueMappingBuilderStyle() {
		if (document.getElementById('timestate-map-builder-style')) {
			return;
		}

		const style = document.createElement('style');
		style.id = 'timestate-map-builder-style';
		style.textContent = [
			'.overlay-dialogue.timestate-edit-wide,.overlay-dialogue.modal.timestate-edit-wide{width:min(1880px,98vw)!important;max-width:min(1880px,98vw)!important;}',
			'.overlay-dialogue.timestate-edit-wide .overlay-dialogue-body,.overlay-dialogue.modal.timestate-edit-wide .overlay-dialogue-body{max-width:none!important;}',
			'.timestate-datasets{margin-top:8px;border:1px solid #3a3a3a;border-radius:4px;background:#2b2b2b;width:100%;box-sizing:border-box;overflow:hidden;}',
			'.timestate-datasets-row > td{padding-top:0!important;}',
			'.timestate-edit-wide .timestate-datasets{grid-column:1 / -1;}',
			'.timestate-datasets-header{padding:10px 12px 8px;border-bottom:1px solid #3a3a3a;}',
			'.timestate-datasets-title{font-size:14px;font-weight:600;color:#e3e3e3;margin:0 0 6px 0;}',
			'.timestate-datasets-help{font-size:12px;color:#b9c0c7;margin:0;}',
			'.timestate-dataset-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:0;min-height:320px;}',
			'.timestate-dataset-sidebar{border-right:1px solid #3a3a3a;background:#292929;padding:8px;}',
			'.timestate-dataset-selectors{display:flex;flex-direction:column;gap:4px;max-height:460px;overflow:auto;margin:0 0 8px 0;padding-right:2px;}',
			'.timestate-dataset-selector{display:grid;grid-template-columns:16px minmax(0,1fr) 18px;align-items:center;column-gap:8px;width:100%;border:1px solid transparent;background:transparent;color:#c9d3de;border-radius:3px;padding:7px 8px;cursor:pointer;text-align:left;}',
			'.timestate-dataset-selector:hover{background:rgba(89,175,225,.08);color:#e7edf3;}',
			'.timestate-dataset-selector.is-active{background:#323232;border-color:#4a4a4a;color:#ffffff;}',
			'.timestate-dataset-selector-grip{color:#6b7f95;font-size:12px;line-height:1;}',
			'.timestate-dataset-selector-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
			'.timestate-dataset-selector-caret{color:#8aa2b2;font-size:13px;line-height:1;justify-self:end;}',
			'.timestate-dataset-main{padding:10px;}',
			'.timestate-dataset-rows{display:flex;flex-direction:column;gap:8px;}',
			'.timestate-dataset-row{display:none;padding:10px;border:1px solid #3a3a3a;border-radius:4px;background:#232323;}',
			'.timestate-dataset-row.is-active{display:block;}',
			'.timestate-dataset-head{display:flex;justify-content:space-between;align-items:center;margin:0 0 8px 0;padding:0 0 6px 0;border-bottom:1px solid #3a3a3a;}',
			'.timestate-dataset-name{font-size:18px;font-weight:600;color:#e6e6e6;}',
			'.timestate-dataset-section-tabs{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 8px 0;padding:0 0 8px 0;border-bottom:1px solid #3a3a3a;}',
			'.timestate-dataset-section-tab{border:1px solid transparent;background:transparent;color:#59afe1;border-radius:3px;padding:5px 10px;cursor:pointer;line-height:1.2;}',
			'.timestate-dataset-section-tab:hover{background:rgba(89,175,225,.08);color:#8fd1f3;}',
			'.timestate-dataset-section-tab.is-active{background:#323232;border-color:#4b4b4b;color:#e7edf3;font-weight:600;}',
			'.timestate-dataset-sections{position:relative;}',
			'.timestate-dataset-section{display:none;}',
			'.timestate-dataset-section.is-active{display:block;}',
			'.timestate-dataset-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}',
			'.timestate-dataset-filter{display:grid;grid-template-columns:220px minmax(320px,820px);gap:8px;align-items:center;}',
			'.timestate-dataset-filter-input{position:relative;min-width:0;max-width:820px;}',
			'.timestate-dataset-suggest{position:fixed;left:0;top:0;z-index:2147483200;background:#13243a;border:1px solid #355577;border-radius:6px;max-height:260px;overflow:auto;box-shadow:0 10px 24px rgba(0,0,0,.45);min-width:260px;}',
			'.timestate-dataset-suggest.is-hidden{display:none;}',
			'.timestate-dataset-suggest-item{display:grid;grid-template-columns:minmax(0,1fr);row-gap:2px;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08);cursor:pointer;}',
			'.timestate-dataset-suggest-item:last-child{border-bottom:0;}',
			'.timestate-dataset-suggest-item:hover{background:rgba(255,255,255,.08);}',
			'.timestate-dataset-suggest-main{font-size:13px;color:#eaf2fb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
			'.timestate-dataset-suggest-sub{font-size:11px;color:#9fb2c8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
			'.timestate-dataset-suggest-empty{padding:8px 10px;font-size:12px;color:#9fb2c8;}',
			'.timestate-dataset-grid > .is-full{grid-column:1 / -1;}',
			'.timestate-dataset-field{display:flex;flex-direction:column;gap:4px;min-width:0;}',
			'.timestate-dataset-field > span{font-size:12px;color:#d8d8d8;white-space:normal;word-break:break-word;}',
			'.timestate-dataset-field.is-full{grid-column:1 / -1;}',
			'.timestate-dataset-preview{padding:8px;border:1px solid #3a3a3a;border-radius:4px;background:#242424;}',
			'.timestate-dataset-preview-title{font-size:12px;font-weight:600;color:#e3e3e3;margin:0 0 4px 0;}',
			'.timestate-dataset-preview-meta{font-size:11px;color:#b9c0c7;margin:0 0 6px 0;}',
			'.timestate-dataset-preview-list{display:flex;flex-wrap:wrap;gap:6px;max-height:120px;overflow:auto;}',
			'.timestate-dataset-preview-chip{display:inline-block;padding:2px 8px;border-radius:999px;background:#1f1f1f;border:1px solid #4a4a4a;color:#e5e5e5;font-size:11px;max-width:420px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
			'.timestate-dataset-preview-empty{font-size:11px;color:#b9c0c7;}',
			'.timestate-dataset-row input{width:100%;background:#1f1f1f;color:#e5e5e5;border:1px solid #4a4a4a;border-radius:3px;padding:5px 7px;box-sizing:border-box;}',
			'.timestate-dataset-row textarea{width:100%;min-height:58px;resize:vertical;background:#1f1f1f;color:#e5e5e5;border:1px solid #4a4a4a;border-radius:3px;padding:6px 7px;box-sizing:border-box;font:inherit;}',
			'.timestate-dataset-row select{width:100%;background:#1f1f1f;color:#e5e5e5;border:1px solid #4a4a4a;border-radius:3px;padding:5px 7px;box-sizing:border-box;}',
			'.timestate-dataset-add{margin:0;border:1px solid #8aa2b2;background:#7f97a8;color:#ffffff;border-radius:3px;padding:5px 10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;line-height:1;min-height:30px;white-space:nowrap;width:100%;gap:7px;}',
			'.timestate-dataset-add .timestate-dataset-add-plus{font-size:20px;line-height:1;position:relative;top:-1px;}',
			'.timestate-dataset-add .timestate-dataset-add-caret{margin-left:auto;color:#d8e3ec;font-size:12px;}',
			'.timestate-dataset-remove{width:28px;height:28px;border:1px solid #4a4a4a;background:#2b2b2b;color:#d8d8d8;border-radius:3px;cursor:pointer;}',
			'.timestate-map-builder{margin-top:8px;padding:10px;border:1px solid #3a3a3a;border-radius:4px;background:#2b2b2b;}',
			'.timestate-map-builder-title{font-size:14px;font-weight:600;color:#e3e3e3;margin:0 0 8px 0;}',
			'.timestate-map-builder-help{font-size:12px;color:#b9c0c7;margin:0 0 8px 0;}',
			'.timestate-map-rows{display:flex;flex-direction:column;gap:8px;}',
			'.timestate-map-row{display:grid;grid-template-columns:120px minmax(240px,1.35fr) minmax(220px,1fr) 64px 28px;gap:8px;align-items:center;}',
			'.timestate-map-color-wrap{display:flex;align-items:center;gap:0;min-width:0;}',
			'.timestate-map-color-wrap input{display:none;}',
			'.timestate-map-row input,.timestate-map-row select{width:100%;background:#1f1f1f;color:#e5e5e5;border:1px solid #4a4a4a;border-radius:3px;padding:5px 7px;box-sizing:border-box;}',
			'.timestate-map-cond-range{display:grid;grid-template-columns:1fr 1fr;gap:6px;}',
			'.timestate-map-remove{width:28px;height:28px;border:1px solid #4a4a4a;background:#2b2b2b;color:#d8d8d8;border-radius:3px;cursor:pointer;}',
			'.timestate-map-add{margin-top:8px;border:1px solid #8aa2b2;background:#7f97a8;color:#ffffff;border-radius:3px;padding:5px 12px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;line-height:1;min-height:34px;}',
			'.timestate-map-builder--dataset{margin-top:0;padding:8px;}',
			'.timestate-map-builder--dataset .timestate-map-builder-title{margin-bottom:6px;}',
			'.timestate-map-builder--dataset .timestate-map-builder-help{margin-bottom:6px;}',
			'.timestate-edit-wide .port24-pop{position:fixed!important;z-index:2147483000!important;}',
			'@media (max-width: 1360px){.timestate-dataset-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}.timestate-map-row{grid-template-columns:120px minmax(0,1fr) minmax(0,1fr) 64px 28px;}}',
			'@media (max-width: 1180px){.timestate-dataset-layout{grid-template-columns:minmax(0,1fr);}.timestate-dataset-sidebar{border-right:0;border-bottom:1px solid #3a3a3a;}.timestate-dataset-selectors{max-height:180px;}}',
			'@media (max-width: 980px){.timestate-dataset-grid{grid-template-columns:minmax(0,1fr);}.timestate-dataset-filter{grid-template-columns:minmax(0,1fr);}.timestate-map-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}.timestate-map-row .timestate-map-type{grid-column:1 / -1;}.timestate-map-row .timestate-map-cond{grid-column:1 / -1;}.timestate-map-row .timestate-map-label{grid-column:1 / -1;}.timestate-map-row .timestate-map-color-wrap{grid-column:1 / 2;}.timestate-map-row .timestate-map-remove{grid-column:2 / 3;justify-self:end;}}'
		].join('');
		document.head.appendChild(style);
	}

	function hideFieldRow(fieldName) {
		const field = findField(fieldName);
		if (!field) {
			return;
		}

		const row = field.closest(
			'.form-field, .form-grid, .fields-group, .field-row, tr, li, .table-forms-td-right, .table-forms-field'
		);
		if (row) {
			row.style.display = 'none';
		}

		const labelCell = row?.previousElementSibling;
		if (labelCell && (labelCell.matches('td') || labelCell.classList.contains('table-forms-td-left'))) {
			labelCell.style.display = 'none';
		}
	}

	function showFieldRow(fieldName) {
		const field = findField(fieldName);
		if (!field) {
			return;
		}

		const row = field.closest(
			'.form-field, .form-grid, .fields-group, .field-row, tr, li, .table-forms-td-right, .table-forms-field'
		);
		if (row) {
			row.style.display = '';
		}

		const labelCell = row?.previousElementSibling;
		if (labelCell && (labelCell.matches('td') || labelCell.classList.contains('table-forms-td-left'))) {
			labelCell.style.display = '';
		}
	}

	function getFieldRow(fieldName) {
		const field = findField(fieldName);
		if (!field) {
			return null;
		}

		return field.closest('tr, .form-field, .form-grid, .field-row, li');
	}

	function moveFieldRowBefore(fieldName, anchorFieldName) {
		const row = getFieldRow(fieldName);
		const anchor = getFieldRow(anchorFieldName);
		if (!row || !anchor || !anchor.parentNode) {
			return;
		}
		if (row === anchor || row.parentNode !== anchor.parentNode) {
			return;
		}

		anchor.parentNode.insertBefore(row, anchor);
	}

	function hideLabelCellsByText(labels) {
		const wanted = new Set(labels.map((value) => String(value || '').trim().toLowerCase()));
		if (wanted.size === 0) {
			return;
		}

		const cells = document.querySelectorAll('td, .table-forms-td-left, .form-grid-label, .form-field-label, .field-label');
		for (const cell of cells) {
			const text = String(cell.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
			if (!wanted.has(text)) {
				continue;
			}

			cell.style.display = 'none';
			const right = cell.nextElementSibling;
			if (right && (right.matches('td') || right.classList.contains('table-forms-td-right') || right.classList.contains('table-forms-field'))) {
				right.style.display = 'none';
			}

			const row = cell.closest('tr, .form-field, .form-grid, .field-row, li');
			if (row) {
				row.style.display = 'none';
			}
		}
	}

	function ensureWideEditDialog() {
		const field = findField('state_map') || findField('item_key_search') || findField('item_name_search');
		if (!field) {
			return;
		}

		const dialog = field.closest('.overlay-dialogue, .overlay-dialogue.modal, .modal-dialogue, [role="dialog"]');
		if (!dialog) {
			return;
		}

		dialog.classList.add('timestate-edit-wide');
		dialog.style.width = 'min(1680px, 96vw)';
		dialog.style.maxWidth = 'min(1680px, 96vw)';

		const body = dialog.querySelector('.overlay-dialogue-body, .modal-dialogue-body, .overlay-dialogue-content');
		if (body) {
			body.style.maxWidth = 'none';
		}
	}

	function parseMappings(raw) {
		const text = String(raw || '').trim();
		if (text === '') {
			return [];
		}

		const entries = text
			.split(/[\n,]+/)
			.map((part) => String(part || '').trim())
			.filter((part) => part.includes('='));

		const rows = [];
		for (const entry of entries) {
			const [leftRaw, rightRaw] = entry.split(/=(.+)/).filter(Boolean);
			const left = String(leftRaw || '').trim();
			const right = String(rightRaw || '').trim();
			if (!left || !right) {
				continue;
			}

			let type = 'value';
			let condition = left;
			if (left.startsWith('value:')) {
				type = 'value';
				condition = left.slice(6).trim();
			}
			else if (left.startsWith('range:')) {
				type = 'range';
				condition = left.slice(6).trim();
			}
			else if (left.startsWith('regex:')) {
				type = 'regex';
				condition = left.slice(6).trim();
			}
			else if (left.startsWith('special:')) {
				type = 'special';
				condition = left.slice(8).trim();
			}

			const [labelRaw, colorRaw] = right.split('|');
			const label = String(labelRaw || '').trim();
			const color = normalizeHexColor(String(colorRaw || '').trim(), '#607D8B');

			const row = {type, label, color, value: '', regex: '', special: 'unknown', min: '', max: ''};
			if (type === 'range') {
				const [min, max] = condition.split('..');
				row.min = String(min || '').trim();
				row.max = String(max || '').trim();
			}
			else if (type === 'regex') {
				row.regex = condition;
			}
			else if (type === 'special') {
				row.special = condition || 'unknown';
			}
			else {
				row.value = condition;
			}

			rows.push(row);
		}

		return rows;
	}

	function parseDataSets(raw) {
		const text = String(raw || '').trim();
		if (text === '') {
			return [];
		}

		try {
			const parsed = JSON.parse(text);
			if (!Array.isArray(parsed)) {
				return [];
			}
			return parsed
				.filter((entry) => entry && typeof entry === 'object')
				.map((entry) => ({
					name: String(entry.name || ''),
					filter_type: String(entry.filter_type || (String(entry.item_key_search || '').trim() !== '' ? 'key' : 'name')),
					filter_value: String(
						entry.filter_value
						|| entry.item_key_search
						|| entry.item_name_search
						|| ''
					),
					filter_exact: String(entry.filter_exact ?? '0'),
					max_rows: String(entry.max_rows || '20'),
					lookback_hours: String(entry.lookback_hours || '24'),
					history_points: String(entry.history_points || '500'),
					merge_equal_states: String(entry.merge_equal_states ?? '1'),
					merge_shorter_than: String(entry.merge_shorter_than || '0'),
					null_gap_mode: String(entry.null_gap_mode ?? '0'),
					null_gap_backfill_first: String(entry.null_gap_backfill_first ?? '0'),
					state_map: String(entry.state_map || 'value:0=OK|#2E7D32,value:1=Problem|#C62828')
				}));
		}
		catch (_error) {
			return [];
		}
	}

	function serializeDataSets(dataSets) {
		const rows = [];
		for (const set of dataSets) {
			const name = String(set.name || '').trim();
			const filter_type = String(set.filter_type || 'key') === 'name' ? 'name' : 'key';
			const filter_value = String(set.filter_value || '').trim();
			const filter_exact = String(set.filter_exact ?? '0').trim();
			const max_rows = String(set.max_rows || '').trim();
			const lookback_hours = String(set.lookback_hours || '').trim();
			const history_points = String(set.history_points || '').trim();
			const merge_equal_states = String(set.merge_equal_states ?? '1').trim();
			const merge_shorter_than = String(set.merge_shorter_than || '').trim();
			const null_gap_mode = String(set.null_gap_mode ?? '0').trim();
			const null_gap_backfill_first = String(set.null_gap_backfill_first ?? '0').trim();
			const state_map = String(set.state_map || '').trim();
			if (state_map === '') {
				continue;
			}
			rows.push({
				name,
				filter_type,
				filter_value,
				filter_exact,
				max_rows,
				lookback_hours,
				history_points,
				merge_equal_states,
				merge_shorter_than,
				null_gap_mode,
				null_gap_backfill_first,
				state_map
			});
		}
		return JSON.stringify(rows);
	}

	function serializeMappings(rows) {
		const out = [];
		for (const row of rows) {
			const type = String(row.type || 'value');
			const label = String(row.label || '').trim();
			const color = normalizeHexColor(row.color, '#607D8B');
			if (label === '') {
				continue;
			}

			let left = '';
			if (type === 'range') {
				const min = String(row.min || '').trim();
				const max = String(row.max || '').trim();
				left = `range:${min}..${max}`;
			}
			else if (type === 'regex') {
				left = `regex:${String(row.regex || '').trim()}`;
			}
			else if (type === 'special') {
				left = `special:${String(row.special || 'unknown').trim()}`;
			}
			else {
				left = `value:${String(row.value || '').trim()}`;
			}

			if (left.endsWith(':') || left.endsWith('..')) {
				continue;
			}
			out.push(`${left}=${label}|${color}`);
		}

		return out.join(',');
	}

	function getMappingRowsFromDom(rowsWrap) {
		const rows = [];
		for (const rowEl of rowsWrap.querySelectorAll('.timestate-map-row')) {
			const type = String(rowEl.querySelector('.timestate-map-type')?.value || 'value');
			const label = String(rowEl.querySelector('.timestate-map-label')?.value || '');
			const color = String(rowEl.querySelector('.timestate-map-color')?.value || '#607D8B');
			const row = {type, label, color, value: '', regex: '', special: 'unknown', min: '', max: ''};

			if (type === 'range') {
				row.min = String(rowEl.querySelector('.timestate-map-min')?.value || '');
				row.max = String(rowEl.querySelector('.timestate-map-max')?.value || '');
			}
			else if (type === 'regex') {
				row.regex = String(rowEl.querySelector('.timestate-map-regex')?.value || '');
			}
			else if (type === 'special') {
				row.special = String(rowEl.querySelector('.timestate-map-special')?.value || 'unknown');
			}
			else {
				row.value = String(rowEl.querySelector('.timestate-map-value')?.value || '');
			}

			rows.push(row);
		}
		return rows;
	}

	function renderMappingCondition(rowEl, row) {
		const condWrap = rowEl.querySelector('.timestate-map-cond');
		if (!condWrap) {
			return;
		}
		const type = String(rowEl.querySelector('.timestate-map-type')?.value || row.type || 'value');
		condWrap.innerHTML = '';

		if (type === 'range') {
			const wrap = document.createElement('div');
			wrap.className = 'timestate-map-cond-range';
			const min = document.createElement('input');
			min.type = 'text';
			min.className = 'timestate-map-min';
			min.placeholder = 'min';
			min.value = String(row.min || '');
			const max = document.createElement('input');
			max.type = 'text';
			max.className = 'timestate-map-max';
			max.placeholder = 'max';
			max.value = String(row.max || '');
			wrap.appendChild(min);
			wrap.appendChild(max);
			condWrap.appendChild(wrap);
		}
		else if (type === 'regex') {
			const input = document.createElement('input');
			input.type = 'text';
			input.className = 'timestate-map-regex';
			input.placeholder = '/pattern/';
			input.value = String(row.regex || '');
			condWrap.appendChild(input);
		}
		else if (type === 'special') {
			const select = document.createElement('select');
			select.className = 'timestate-map-special';
			for (const v of ['null', 'nan', 'true', 'false', 'empty', 'unknown']) {
				const opt = document.createElement('option');
				opt.value = v;
				opt.textContent = v;
				if (String(row.special || '') === v) {
					opt.selected = true;
				}
				select.appendChild(opt);
			}
			condWrap.appendChild(select);
		}
		else {
			const input = document.createElement('input');
			input.type = 'text';
			input.className = 'timestate-map-value';
			input.placeholder = 'value';
			input.value = String(row.value || '');
			condWrap.appendChild(input);
		}
	}

	function buildMappingRow(rowsWrap, stateMapField, row = null) {
		const data = row || {type: 'value', value: '', label: '', color: '#607D8B'};
		const rowEl = document.createElement('div');
		rowEl.className = 'timestate-map-row';
		rowEl.innerHTML = [
			'<select class="timestate-map-type">',
				'<option value="value">Value</option>',
				'<option value="range">Range</option>',
				'<option value="regex">Regex</option>',
				'<option value="special">Special</option>',
			'</select>',
			'<div class="timestate-map-cond"></div>',
			'<input type="text" class="timestate-map-label" placeholder="Display text">',
			'<div class="timestate-map-color-wrap"><input type="text" class="timestate-map-color"></div>',
			'<button type="button" class="timestate-map-remove">×</button>'
		].join('');

		const typeSel = rowEl.querySelector('.timestate-map-type');
		const labelInput = rowEl.querySelector('.timestate-map-label');
		const colorInput = rowEl.querySelector('.timestate-map-color');
		if (typeSel) {
			typeSel.value = String(data.type || 'value');
		}
		if (labelInput) {
			labelInput.value = String(data.label || '');
		}
		if (colorInput) {
			colorInput.value = normalizeHexColor(String(data.color || '#607D8B'), '#607D8B');
		}

		renderMappingCondition(rowEl, data);
		rowsWrap.appendChild(rowEl);

		const picker = createModernBulkPicker(colorInput ? colorInput.value : '#607D8B');
		picker.element.addEventListener('port24-color-change', (event) => {
			if (colorInput) {
				colorInput.value = normalizeHexColor(event.detail?.value, '#607D8B');
				colorInput.dispatchEvent(new Event('input', {bubbles: true}));
				colorInput.dispatchEvent(new Event('change', {bubbles: true}));
			}
		});
		const colorWrap = rowEl.querySelector('.timestate-map-color-wrap');
		if (colorWrap) {
			colorWrap.appendChild(picker.element);
		}

		const sync = () => {
			const rows = getMappingRowsFromDom(rowsWrap);
			stateMapField.value = serializeMappings(rows);
			stateMapField.dispatchEvent(new Event('input', {bubbles: true}));
			stateMapField.dispatchEvent(new Event('change', {bubbles: true}));
			scheduleDataSetSectionHeightUpdate(rowsWrap.closest('.timestate-dataset-row'));
		};

		rowEl.addEventListener('input', sync);
		rowEl.addEventListener('change', sync);
		rowEl.querySelector('.timestate-map-remove')?.addEventListener('click', () => {
			rowEl.remove();
			sync();
		});
		typeSel?.addEventListener('change', () => {
			renderMappingCondition(rowEl, {type: typeSel.value});
			sync();
		});

		sync();
	}

	function getDataSetsFromDom(rowsWrap) {
		const rows = [];
		for (const rowEl of rowsWrap.querySelectorAll('.timestate-dataset-row')) {
			rows.push({
				name: String(rowEl.querySelector('.timestate-dataset-title')?.value || ''),
				filter_type: String(rowEl.querySelector('.timestate-dataset-filtertype')?.value || 'key'),
				filter_value: String(rowEl.querySelector('.timestate-dataset-filtervalue')?.value || ''),
				filter_exact: String(rowEl.querySelector('.timestate-dataset-filterexact')?.value || '0'),
				max_rows: String(rowEl.querySelector('.timestate-dataset-maxrows')?.value || '20'),
				lookback_hours: String(rowEl.querySelector('.timestate-dataset-lookback')?.value || '24'),
				history_points: String(rowEl.querySelector('.timestate-dataset-history')?.value || '500'),
				merge_equal_states: String(rowEl.querySelector('.timestate-dataset-mergeequal')?.value || '1'),
				merge_shorter_than: String(rowEl.querySelector('.timestate-dataset-mergeshort')?.value || '0'),
				null_gap_mode: String(rowEl.querySelector('.timestate-dataset-nullgap')?.value || '0'),
				null_gap_backfill_first: String(rowEl.querySelector('.timestate-dataset-backfill')?.value || '0'),
				state_map: String(rowEl.querySelector('.timestate-dataset-map')?.value || '')
			});
		}
		return rows;
	}

	function renderDataSetPreview(box, items, meta) {
		if (!box) {
			return;
		}
		const rowEl = box.closest('.timestate-dataset-row');

		const metaEl = box.querySelector('.timestate-dataset-preview-meta');
		const listEl = box.querySelector('.timestate-dataset-preview-list');
		if (!metaEl || !listEl) {
			return;
		}

		metaEl.textContent = meta;
		listEl.innerHTML = '';

		if (!Array.isArray(items) || items.length === 0) {
			const empty = document.createElement('div');
			empty.className = 'timestate-dataset-preview-empty';
			empty.textContent = 'No matching items.';
			listEl.appendChild(empty);
			scheduleDataSetSectionHeightUpdate(rowEl);
			return;
		}

		for (const item of items) {
			const chip = document.createElement('span');
			chip.className = 'timestate-dataset-preview-chip';
			chip.textContent = String(item.label || '');
			chip.title = chip.textContent;
			listEl.appendChild(chip);
		}
		scheduleDataSetSectionHeightUpdate(rowEl);
	}

	function getDataSetTabTitle(rowEl, index) {
		const explicit = String(rowEl.querySelector('.timestate-dataset-title')?.value || '').trim();
		return explicit !== '' ? explicit : `Data set #${index + 1}`;
	}

	function renderDataSetTabs(builder, rowsWrap, requestedIndex = null) {
		if (!builder || !rowsWrap) {
			return;
		}

		const selectorsWrap = builder.querySelector('.timestate-dataset-selectors');
		if (!selectorsWrap) {
			return;
		}

		const rows = Array.from(rowsWrap.querySelectorAll('.timestate-dataset-row'));
		if (rows.length === 0) {
			selectorsWrap.innerHTML = '';
			builder.dataset.activeIndex = '0';
			return;
		}

		const fallback = Number.isFinite(Number(builder.dataset.activeIndex))
			? Number(builder.dataset.activeIndex)
			: 0;
		let activeIndex = requestedIndex !== null
			? Number(requestedIndex)
			: fallback;
		if (!Number.isFinite(activeIndex)) {
			activeIndex = 0;
		}
		activeIndex = Math.max(0, Math.min(rows.length - 1, Math.trunc(activeIndex)));
		builder.dataset.activeIndex = String(activeIndex);

		selectorsWrap.innerHTML = '';
		for (let i = 0; i < rows.length; i++) {
			const rowEl = rows[i];
			const active = i === activeIndex;
			const tabTitle = getDataSetTabTitle(rowEl, i);
			rowEl.classList.toggle('is-active', active);
			rowEl.dataset.datasetIndex = String(i);
			const headName = rowEl.querySelector('.timestate-dataset-name');
			if (headName) {
				headName.textContent = tabTitle;
			}
			if (active) {
				scheduleDataSetSectionHeightUpdate(rowEl);
			}

			const selectorBtn = document.createElement('button');
			selectorBtn.type = 'button';
			selectorBtn.className = `timestate-dataset-selector${active ? ' is-active' : ''}`;
			selectorBtn.title = tabTitle;
			selectorBtn.innerHTML = [
				'<span class="timestate-dataset-selector-grip">⋮</span>',
				'<span class="timestate-dataset-selector-title"></span>',
				'<span class="timestate-dataset-selector-caret"></span>'
			].join('');
			const titleEl = selectorBtn.querySelector('.timestate-dataset-selector-title');
			if (titleEl) {
				titleEl.textContent = tabTitle;
			}
			const caretEl = selectorBtn.querySelector('.timestate-dataset-selector-caret');
			if (caretEl) {
				caretEl.textContent = active ? '▾' : '▸';
			}
			selectorBtn.setAttribute('aria-selected', active ? 'true' : 'false');
			selectorBtn.addEventListener('click', () => {
				renderDataSetTabs(builder, rowsWrap, i);
			});
			selectorsWrap.appendChild(selectorBtn);
		}
	}

	function updateDataSetSectionMinHeight(rowEl) {
		if (!rowEl) {
			return;
		}

		const wrap = rowEl.querySelector('.timestate-dataset-sections');
		if (!wrap) {
			return;
		}

		const sections = Array.from(rowEl.querySelectorAll('.timestate-dataset-section'));
		if (sections.length === 0) {
			return;
		}

		const wrapWidth = Math.max(320, Math.round(wrap.getBoundingClientRect().width || 0));
		let maxHeight = 0;
		for (const section of sections) {
			const wasActive = section.classList.contains('is-active');
			const prevDisplay = section.style.display;
			const prevVisibility = section.style.visibility;
			const prevPosition = section.style.position;
			const prevLeft = section.style.left;
			const prevTop = section.style.top;
			const prevWidth = section.style.width;

			if (!wasActive) {
				section.style.display = 'block';
				section.style.visibility = 'hidden';
				section.style.position = 'absolute';
				section.style.left = '-99999px';
				section.style.top = '0';
				section.style.width = `${wrapWidth}px`;
			}

			maxHeight = Math.max(maxHeight, Math.ceil(section.scrollHeight || 0));

			if (!wasActive) {
				section.style.display = prevDisplay;
				section.style.visibility = prevVisibility;
				section.style.position = prevPosition;
				section.style.left = prevLeft;
				section.style.top = prevTop;
				section.style.width = prevWidth;
			}
		}

		if (maxHeight > 0) {
			wrap.style.minHeight = `${maxHeight}px`;
		}
	}

	function scheduleDataSetSectionHeightUpdate(rowEl) {
		if (!rowEl) {
			return;
		}
		if (rowEl._timestateHeightRaf) {
			return;
		}
		rowEl._timestateHeightRaf = window.requestAnimationFrame(() => {
			rowEl._timestateHeightRaf = 0;
			updateDataSetSectionMinHeight(rowEl);
		});
	}

	function initDataSetSectionTabs(rowEl) {
		if (!rowEl) {
			return;
		}

		const tabs = Array.from(rowEl.querySelectorAll('.timestate-dataset-section-tab'));
		const sections = Array.from(rowEl.querySelectorAll('.timestate-dataset-section'));
		if (tabs.length === 0 || sections.length === 0) {
			return;
		}

		const setActive = (sectionName) => {
			const target = String(sectionName || 'filter');
			rowEl.dataset.activeSection = target;
			for (const tab of tabs) {
				const active = String(tab.dataset.section || '') === target;
				tab.classList.toggle('is-active', active);
				tab.setAttribute('aria-selected', active ? 'true' : 'false');
			}
			for (const panel of sections) {
				const active = String(panel.dataset.section || '') === target;
				panel.classList.toggle('is-active', active);
			}
			scheduleDataSetSectionHeightUpdate(rowEl);
		};

		const initial = String(rowEl.dataset.activeSection || 'filter');
		setActive(initial);
		for (const tab of tabs) {
			tab.addEventListener('click', () => {
				setActive(tab.dataset.section || 'filter');
			});
		}
	}

	function buildDataSetRow(builder, rowsWrap, hiddenField, data = null, requestedActiveIndex = null) {
		const set = data || {
			name: '',
			filter_type: 'key',
			filter_value: '',
			filter_exact: '0',
			max_rows: '20',
			lookback_hours: '24',
			history_points: '500',
			merge_equal_states: '1',
			merge_shorter_than: '0',
			null_gap_mode: '0',
			null_gap_backfill_first: '0',
			state_map: 'value:0=OK|#2E7D32,value:1=Problem|#C62828'
		};
		const rowEl = document.createElement('div');
		rowEl.className = 'timestate-dataset-row';
		rowEl.innerHTML = [
			'<div class="timestate-dataset-head">',
				'<div class="timestate-dataset-name">Data set</div>',
				'<button type="button" class="timestate-dataset-remove">×</button>',
			'</div>',
			'<div class="timestate-dataset-section-tabs">',
				'<button type="button" class="timestate-dataset-section-tab is-active" data-section="filter">Filter</button>',
				'<button type="button" class="timestate-dataset-section-tab" data-section="processing">Processing</button>',
				'<button type="button" class="timestate-dataset-section-tab" data-section="preview">Matched items</button>',
				'<button type="button" class="timestate-dataset-section-tab" data-section="mappings">Value mappings</button>',
			'</div>',
			'<input type="hidden" class="timestate-dataset-filterexact" value="0">',
			'<input type="hidden" class="timestate-dataset-map">',
			'<div class="timestate-dataset-sections">',
				'<div class="timestate-dataset-section is-active" data-section="filter">',
					'<div class="timestate-dataset-grid">',
						'<label class="timestate-dataset-field"><span>Name (optional)</span><input type="text" class="timestate-dataset-title" placeholder="Agent availability"></label>',
						'<label class="timestate-dataset-field is-full"><span>Item filter</span><div class="timestate-dataset-filter"><select class="timestate-dataset-filtertype"><option value="key">Item key filter (substring)</option><option value="name">Item name filter (substring)</option></select><div class="timestate-dataset-filter-input"><input type="text" class="timestate-dataset-filtervalue" placeholder="zabbix[host,agent,available]" autocomplete="off" autocapitalize="off" spellcheck="false"><div class="timestate-dataset-suggest is-hidden"></div></div></div></label>',
						'<label class="timestate-dataset-field"><span>Max rows</span><input type="text" class="timestate-dataset-maxrows"></label>',
						'<label class="timestate-dataset-field"><span>Lookback (hours, shared timeline uses longest lookback)</span><input type="text" class="timestate-dataset-lookback"></label>',
						'<label class="timestate-dataset-field"><span>History points per item</span><input type="text" class="timestate-dataset-history"></label>',
					'</div>',
				'</div>',
				'<div class="timestate-dataset-section" data-section="processing">',
					'<div class="timestate-dataset-grid">',
						'<label class="timestate-dataset-field"><span>Merge equal consecutive states</span><select class="timestate-dataset-mergeequal"><option value="1">Yes</option><option value="0">No</option></select></label>',
						'<label class="timestate-dataset-field"><span>Merge short segments (&lt; seconds, 0 = off)</span><input type="text" class="timestate-dataset-mergeshort"></label>',
						'<label class="timestate-dataset-field"><span>Null-gap mode</span><select class="timestate-dataset-nullgap"><option value="0">Disconnected</option><option value="1">Connected</option></select></label>',
						'<label class="timestate-dataset-field"><span>Backfill from first value</span><select class="timestate-dataset-backfill"><option value="0">No</option><option value="1">Yes</option></select></label>',
					'</div>',
				'</div>',
				'<div class="timestate-dataset-section" data-section="preview">',
					'<div class="timestate-dataset-preview"><div class="timestate-dataset-preview-title">Matched items</div><div class="timestate-dataset-preview-meta">Type to preview matching items (wildcards like * are supported).</div><div class="timestate-dataset-preview-list"></div></div>',
				'</div>',
				'<div class="timestate-dataset-section" data-section="mappings">',
					'<div class="timestate-map-builder timestate-map-builder--dataset">',
						'<div class="timestate-map-builder-title">Value mappings</div>',
						'<div class="timestate-map-builder-help">Type + condition + display text + color. Add multiple rows.</div>',
						'<div class="timestate-map-rows"></div>',
						'<button type="button" class="timestate-map-add">Add mapping</button>',
					'</div>',
				'</div>',
			'</div>'
		].join('');

		rowEl.querySelector('.timestate-dataset-title').value = String(set.name || '');
		rowEl.querySelector('.timestate-dataset-filtertype').value = String(set.filter_type || 'key') === 'name' ? 'name' : 'key';
		rowEl.querySelector('.timestate-dataset-filtervalue').value = String(set.filter_value || '');
		rowEl.querySelector('.timestate-dataset-filterexact').value = String(set.filter_exact || '0');
		rowEl.querySelector('.timestate-dataset-maxrows').value = String(set.max_rows || '20');
		rowEl.querySelector('.timestate-dataset-lookback').value = String(set.lookback_hours || '24');
		rowEl.querySelector('.timestate-dataset-history').value = String(set.history_points || '500');
		rowEl.querySelector('.timestate-dataset-mergeequal').value = String(set.merge_equal_states ?? '1');
		rowEl.querySelector('.timestate-dataset-mergeshort').value = String(set.merge_shorter_than || '0');
		rowEl.querySelector('.timestate-dataset-nullgap').value = String(set.null_gap_mode ?? '0');
		rowEl.querySelector('.timestate-dataset-backfill').value = String(set.null_gap_backfill_first ?? '0');
		const stateMapField = rowEl.querySelector('.timestate-dataset-map');
		stateMapField.value = String(set.state_map || 'value:0=OK|#2E7D32,value:1=Problem|#C62828');
		initDataSetSectionTabs(rowEl);
		rowsWrap.appendChild(rowEl);

		const titleEl = rowEl.querySelector('.timestate-dataset-title');
		const headNameEl = rowEl.querySelector('.timestate-dataset-name');
		const previewBox = rowEl.querySelector('.timestate-dataset-preview');
		const suggestBox = rowEl.querySelector('.timestate-dataset-suggest');
		const filterInput = rowEl.querySelector('.timestate-dataset-filtervalue');
		const filterTypeSel = rowEl.querySelector('.timestate-dataset-filtertype');
		const filterExactInput = rowEl.querySelector('.timestate-dataset-filterexact');
		const mapBuilder = rowEl.querySelector('.timestate-map-builder--dataset');
		const mapRowsWrap = mapBuilder ? mapBuilder.querySelector('.timestate-map-rows') : null;
		const mapAddBtn = mapBuilder ? mapBuilder.querySelector('.timestate-map-add') : null;
		const mappingRows = parseMappings(stateMapField.value);
		const effectiveRows = mappingRows.length > 0
			? mappingRows
			: [
				{type: 'value', value: '0', label: 'OK', color: '#2E7D32'},
				{type: 'value', value: '1', label: 'Problem', color: '#C62828'}
			];
		if (mapRowsWrap) {
			for (const row of effectiveRows) {
				buildMappingRow(mapRowsWrap, stateMapField, row);
			}
			mapAddBtn?.addEventListener('click', () => {
				buildMappingRow(mapRowsWrap, stateMapField, {type: 'value', value: '', label: '', color: '#607D8B'});
			});
		}

		let previewTimer = null;
		let previewSeq = 0;
		let suggestTimer = null;
		let suggestSeq = 0;
		rowEl.dataset.suggestArmed = '0';
		const positionSuggest = () => {
			if (!suggestBox || suggestBox.classList.contains('is-hidden') || !filterInput) {
				return;
			}
			const pad = 8;
			const inputRect = filterInput.getBoundingClientRect();
			const vw = window.innerWidth || document.documentElement.clientWidth || 0;
			const vh = window.innerHeight || document.documentElement.clientHeight || 0;
			const boxRect = suggestBox.getBoundingClientRect();

			let left = Math.round(inputRect.left);
			let top = Math.round(inputRect.bottom + 4);

			if (top + boxRect.height + pad > vh) {
				top = Math.round(inputRect.top - boxRect.height - 4);
			}
			top = Math.max(pad, Math.min(top, Math.max(pad, vh - boxRect.height - pad)));

			const minWidth = Math.max(260, Math.round(inputRect.width));
			suggestBox.style.minWidth = `${minWidth}px`;
			if (left + minWidth + pad > vw) {
				left = vw - minWidth - pad;
			}
			left = Math.max(pad, left);

			suggestBox.style.left = `${left}px`;
			suggestBox.style.top = `${top}px`;
		};

		if (suggestBox && suggestBox.parentNode !== document.body) {
			document.body.appendChild(suggestBox);
		}
		const hideSuggest = () => {
			if (!suggestBox) {
				return;
			}
			suggestBox.classList.add('is-hidden');
			suggestBox.innerHTML = '';
		};
		const renderSuggest = (items, filterType) => {
			if (!suggestBox) {
				return;
			}
			suggestBox.innerHTML = '';

			if (!Array.isArray(items) || items.length === 0) {
				const empty = document.createElement('div');
				empty.className = 'timestate-dataset-suggest-empty';
				empty.textContent = 'No matching items.';
				suggestBox.appendChild(empty);
				suggestBox.classList.remove('is-hidden');
				positionSuggest();
				return;
			}

			const max = Math.min(30, items.length);
			for (let i = 0; i < max; i++) {
				const item = items[i];
				const mainText = filterType === 'name'
					? String(item.name || '')
					: String(item.key_ || '');
				const subText = `${String(item.host || '')} :: ${String(item.name || '')} [${String(item.key_ || '')}]`;
				const row = document.createElement('div');
				row.className = 'timestate-dataset-suggest-item';
				row.innerHTML = `<div class="timestate-dataset-suggest-main"></div><div class="timestate-dataset-suggest-sub"></div>`;
				row.querySelector('.timestate-dataset-suggest-main').textContent = mainText;
				row.querySelector('.timestate-dataset-suggest-sub').textContent = subText;
				row.addEventListener('mousedown', (event) => {
					event.preventDefault();
					if (filterInput) {
						rowEl.dataset.suggestLock = '1';
						rowEl.dataset.suggestArmed = '0';
						filterInput.value = mainText;
						if (filterExactInput) {
							filterExactInput.value = '1';
						}
						filterInput.dispatchEvent(new Event('input', {bubbles: true}));
						filterInput.dispatchEvent(new Event('change', {bubbles: true}));
						filterInput.blur();
					}
					hideSuggest();
					window.setTimeout(() => {
						rowEl.dataset.suggestLock = '0';
					}, 120);
				});
				suggestBox.appendChild(row);
			}
			suggestBox.classList.remove('is-hidden');
			positionSuggest();
		};

		const refreshSuggest = async () => {
			if (rowEl.dataset.suggestArmed !== '1') {
				hideSuggest();
				return;
			}
			if (document.activeElement !== filterInput) {
				hideSuggest();
				return;
			}

			const hostids = getHostIds();
			if (hostids.length === 0) {
				renderSuggest([], 'key');
				const empty = suggestBox?.querySelector('.timestate-dataset-suggest-empty');
				if (empty) {
					empty.textContent = 'Select at least one host first.';
				}
				return;
			}

			const filterType = String(filterTypeSel?.value || 'key');
			const filterValue = String(filterInput?.value || '').trim();
			const filterExact = String(filterExactInput?.value || '0') === '1' ? '1' : '0';
			const maxRows = Math.max(1, Math.min(200, Number(rowEl.querySelector('.timestate-dataset-maxrows')?.value || 20)));
			if (filterValue.length < 1) {
				hideSuggest();
				return;
			}

			suggestBox?.classList.remove('is-hidden');
			if (suggestBox) {
				suggestBox.innerHTML = '<div class="timestate-dataset-suggest-empty">Loading...</div>';
				positionSuggest();
			}

			const seq = ++suggestSeq;
			const params = new URLSearchParams({
				action: 'widget.timestate.items',
				output: 'ajax',
				hostids_csv: hostids.join(','),
				item_key_search: filterType === 'key' ? filterValue : '',
				item_name_search: filterType === 'name' ? filterValue : '',
				filter_exact: filterExact,
				max_rows: String(Math.max(maxRows, 50))
			});

			try {
				const response = await fetch(`zabbix.php?${params.toString()}`, {
					method: 'GET',
					credentials: 'same-origin',
					headers: {'X-Requested-With': 'XMLHttpRequest'}
				});
				const text = await response.text();
				if (seq !== suggestSeq) {
					return;
				}
				const items = parseItemsPayload(text).items || [];
				renderSuggest(items, filterType);
			}
			catch (_error) {
				if (suggestBox) {
					suggestBox.innerHTML = '<div class="timestate-dataset-suggest-empty">Unable to load suggestions right now.</div>';
					suggestBox.classList.remove('is-hidden');
					positionSuggest();
				}
			}
		};

		const scheduleSuggest = () => {
			if (suggestTimer !== null) {
				window.clearTimeout(suggestTimer);
			}
			suggestTimer = window.setTimeout(refreshSuggest, 180);
		};

		const refreshPreview = async () => {
			const hostids = getHostIds();
			if (hostids.length === 0) {
				renderDataSetPreview(previewBox, [], 'Select at least one host to preview items.');
				return;
			}

			const filterType = String(rowEl.querySelector('.timestate-dataset-filtertype')?.value || 'key');
			const filterValue = String(rowEl.querySelector('.timestate-dataset-filtervalue')?.value || '').trim();
			const filterExact = String(filterExactInput?.value || '0') === '1' ? '1' : '0';
			const maxRows = Math.max(1, Math.min(200, Number(rowEl.querySelector('.timestate-dataset-maxrows')?.value || 20)));

			if (filterValue.length < 1) {
				renderDataSetPreview(previewBox, [], 'Type to preview matching items.');
				return;
			}

			const seq = ++previewSeq;
			const params = new URLSearchParams({
				action: 'widget.timestate.items',
				output: 'ajax',
				hostids_csv: hostids.join(','),
				item_key_search: filterType === 'key' ? filterValue : '',
				item_name_search: filterType === 'name' ? filterValue : '',
				filter_exact: filterExact,
				max_rows: String(maxRows)
			});

			try {
				const response = await fetch(`zabbix.php?${params.toString()}`, {
					method: 'GET',
					credentials: 'same-origin',
					headers: {'X-Requested-With': 'XMLHttpRequest'}
				});
				const text = await response.text();
				if (seq !== previewSeq) {
					return;
				}
				const items = parseItemsPayload(text).items || [];
				renderDataSetPreview(previewBox, items, `Previewing ${items.length} matched item(s).`);
			}
			catch (_error) {
				renderDataSetPreview(previewBox, [], 'Unable to load preview right now.');
			}
		};

		const schedulePreview = () => {
			if (previewTimer !== null) {
				window.clearTimeout(previewTimer);
			}
			previewTimer = window.setTimeout(refreshPreview, 250);
		};

		const sync = () => {
			const title = String(titleEl?.value || '').trim();
			if (headNameEl) {
				headNameEl.textContent = title !== '' ? title : 'Data set';
			}
			renderDataSetTabs(builder, rowsWrap);
			const rows = getDataSetsFromDom(rowsWrap);
			hiddenField.value = serializeDataSets(rows);
			hiddenField.dispatchEvent(new Event('input', {bubbles: true}));
			hiddenField.dispatchEvent(new Event('change', {bubbles: true}));
			scheduleDataSetSectionHeightUpdate(rowEl);
		};

		rowEl.addEventListener('input', sync);
		rowEl.addEventListener('change', sync);
		rowEl.querySelector('.timestate-dataset-filtertype')?.addEventListener('change', () => {
			if (filterExactInput) {
				filterExactInput.value = '0';
			}
			rowEl.dataset.suggestArmed = '0';
			hideSuggest();
			scheduleSuggest();
			schedulePreview();
		});
		rowEl.querySelector('.timestate-dataset-filtervalue')?.addEventListener('input', (event) => {
			if (rowEl.dataset.suggestLock !== '1' && filterExactInput) {
				filterExactInput.value = '0';
			}
			if (event.isTrusted && rowEl.dataset.suggestLock !== '1') {
				rowEl.dataset.suggestArmed = '1';
			}
			if (rowEl.dataset.suggestLock === '1') {
				schedulePreview();
				return;
			}
			scheduleSuggest();
			schedulePreview();
		});
		rowEl.querySelector('.timestate-dataset-filtervalue')?.addEventListener('blur', () => {
			rowEl.dataset.suggestArmed = '0';
			window.setTimeout(hideSuggest, 120);
		});
		window.addEventListener('resize', positionSuggest);
		window.addEventListener('scroll', positionSuggest, true);
		rowEl.querySelector('.timestate-dataset-maxrows')?.addEventListener('input', schedulePreview);
		rowEl.querySelector('.timestate-dataset-remove')?.addEventListener('click', () => {
			const removedIndex = Number(rowEl.dataset.datasetIndex || '0');
			suggestBox?.remove();
			rowEl.remove();
			renderDataSetTabs(builder, rowsWrap, removedIndex);
			sync();
		});
		renderDataSetTabs(builder, rowsWrap, requestedActiveIndex);
		sync();
		scheduleDataSetSectionHeightUpdate(rowEl);
		schedulePreview();
	}

	function ensureDataSetBuilder() {
		if (window.timestate_widget_form._dataSetBuilderBound) {
			return;
		}

		const hiddenField = findField('datasets_json');
		if (!hiddenField) {
			return;
		}

		ensureValueMappingBuilderStyle();
		document.querySelectorAll('.timestate-dataset-suggest').forEach((el) => {
			el.remove();
		});
		const hiddenWrap = hiddenField.closest('.form-field');
		if (!hiddenWrap || !hiddenWrap.parentNode) {
			return;
		}

		const anchorField = findField('item_name_search') || findField('item_key_search');
		const anchorWrap = anchorField ? anchorField.closest('.form-field') : null;
		const insertAfter = anchorWrap && anchorWrap.parentNode ? anchorWrap : hiddenWrap;
		const anchorRow = getFieldRow(anchorField ? (anchorField.name || '') : '')
			|| getFieldRow('item_name_search')
			|| getFieldRow('item_key_search')
			|| getFieldRow('datasets_json');

		const builder = document.createElement('div');
		builder.id = 'timestate-datasets';
		builder.className = 'timestate-datasets';
		builder.innerHTML = [
			'<div class="timestate-datasets-header">',
				'<div class="timestate-datasets-title">Data sets</div>',
				'<div class="timestate-datasets-help">Each data set has its own filters and processing options. Add as many as you need.</div>',
			'</div>',
			'<div class="timestate-dataset-layout">',
				'<div class="timestate-dataset-sidebar">',
					'<div class="timestate-dataset-selectors"></div>',
					'<button type="button" class="timestate-dataset-add"><span class="timestate-dataset-add-plus">+</span><span>Add new data set</span><span class="timestate-dataset-add-caret">▾</span></button>',
				'</div>',
				'<div class="timestate-dataset-main">',
					'<div class="timestate-dataset-rows"></div>',
				'</div>',
			'</div>',
		].join('');

		if (anchorRow && anchorRow.tagName === 'TR' && anchorRow.parentNode) {
			const fullRow = document.createElement('tr');
			fullRow.className = 'timestate-datasets-row';
			const fullCell = document.createElement('td');
			fullCell.colSpan = 2;
			fullCell.appendChild(builder);
			fullRow.appendChild(fullCell);
			anchorRow.parentNode.insertBefore(fullRow, anchorRow.nextSibling);
		}
		else {
			insertAfter.parentNode.insertBefore(builder, insertAfter.nextSibling);
		}
		hiddenWrap.style.display = 'none';

		const rowsWrap = builder.querySelector('.timestate-dataset-rows');
		const addBtn = builder.querySelector('.timestate-dataset-add');
		let rows = parseDataSets(hiddenField.value);
		if (rows.length === 0) {
			rows = [{
				name: '',
				filter_type: String(findField('item_key_search')?.value || '') !== '' ? 'key' : 'name',
				filter_value: String(findField('item_key_search')?.value || findField('item_name_search')?.value || ''),
				filter_exact: '0',
				max_rows: String(findField('max_rows')?.value || '20'),
				lookback_hours: String(findField('lookback_hours')?.value || '24'),
				history_points: String(findField('history_points')?.value || '500'),
				merge_equal_states: String(findField('merge_equal_states')?.value || '1'),
				merge_shorter_than: String(findField('merge_shorter_than')?.value || '0'),
				null_gap_mode: String(findField('null_gap_mode')?.value || '0'),
				null_gap_backfill_first: String(findField('null_gap_backfill_first')?.value || '0'),
				state_map: String(findField('state_map')?.value || 'value:0=OK|#2E7D32,value:1=Problem|#C62828')
			}];
		}
		for (let i = 0; i < rows.length; i++) {
			buildDataSetRow(builder, rowsWrap, hiddenField, rows[i], i === 0 ? 0 : null);
		}
		renderDataSetTabs(builder, rowsWrap, 0);

		addBtn?.addEventListener('click', () => {
			const currentRows = Array.from(rowsWrap.querySelectorAll('.timestate-dataset-row'));
			const newIndex = currentRows.length;
			buildDataSetRow(builder, rowsWrap, hiddenField, {
				name: '',
				filter_type: 'key',
				filter_value: '',
				filter_exact: '0',
				max_rows: '20',
				lookback_hours: '24',
				history_points: '500',
				merge_equal_states: '1',
				merge_shorter_than: '0',
				null_gap_mode: '0',
				null_gap_backfill_first: '0',
				state_map: 'value:0=OK|#2E7D32,value:1=Problem|#C62828'
			}, newIndex);
		});

		// Keep global row sorting, but move it close to Hosts.
		moveFieldRowBefore('row_sort', 'item_key_search');
		moveFieldRowBefore('row_group_mode', 'item_key_search');
		moveFieldRowBefore('row_group_collapsed', 'item_key_search');
		moveFieldRowBefore('axis_tick_step', 'item_key_search');
		moveFieldRowBefore('axis_label_density', 'item_key_search');
		moveFieldRowBefore('legend_mode', 'item_key_search');
		moveFieldRowBefore('legend_show_count', 'item_key_search');
		moveFieldRowBefore('legend_show_duration', 'item_key_search');
		moveFieldRowBefore('segment_label_mode', 'item_key_search');
		showFieldRow('row_group_mode');
		showFieldRow('row_group_collapsed');

		for (const legacy of [
			'item_key_search',
			'item_name_search',
			'lookback_hours',
			'max_rows',
			'history_points',
			'merge_equal_states',
			'merge_shorter_than',
			'null_gap_mode',
			'null_gap_backfill_first',
			'state_map',
			'datasets_json'
		]) {
			const field = findField(legacy);
			if (field) {
				hideFieldRow(legacy);
			}
		}

		hideLabelCellsByText([
			'Data sets',
			'Item key filter (substring)',
			'Item name filter (substring)',
			'Lookback (hours)',
			'Max rows',
			'History points per item',
			'Merge equal consecutive states',
			'Merge short segments (< seconds, 0 = off)',
			'Null-gap mode',
			'Backfill from first value',
			'Value mappings (comma separated)',
			'Data sets (JSON)'
		]);

		window.timestate_widget_form._dataSetBuilderBound = true;
	}

	function ensureValueMappingBuilder() {
		if (window.timestate_widget_form._valueMappingBuilderBound) {
			return;
		}

		const stateMapField = findField('state_map');
		if (!stateMapField) {
			return;
		}

		ensureValueMappingBuilderStyle();
		const stateWrap = stateMapField.closest('.form-field');
		if (!stateWrap || !stateWrap.parentNode) {
			return;
		}

		const existing = document.getElementById('timestate-map-builder');
		if (existing) {
			window.timestate_widget_form._valueMappingBuilderBound = true;
			return;
		}

		const builder = document.createElement('div');
		builder.id = 'timestate-map-builder';
		builder.className = 'timestate-map-builder';
		builder.innerHTML = [
			'<div class="timestate-map-builder-title">Value mappings</div>',
			'<div class="timestate-map-builder-help">Type + condition + display text + color. Add multiple rows.</div>',
			'<div class="timestate-map-rows"></div>',
			'<button type="button" class="timestate-map-add">Add mapping</button>'
		].join('');
		stateWrap.parentNode.insertBefore(builder, stateWrap.nextSibling);

		// Hide legacy raw field to avoid confusion.
		stateWrap.style.display = 'none';

		const rowsWrap = builder.querySelector('.timestate-map-rows');
		const addBtn = builder.querySelector('.timestate-map-add');
		const rows = parseMappings(stateMapField.value);
		if (rows.length === 0) {
			rows.push(
				{type: 'value', value: '0', label: 'OK', color: '#2E7D32'},
				{type: 'value', value: '1', label: 'Problem', color: '#C62828'}
			);
		}
		for (const row of rows) {
			buildMappingRow(rowsWrap, stateMapField, row);
		}

		addBtn?.addEventListener('click', () => {
			buildMappingRow(rowsWrap, stateMapField, {type: 'value', value: '', label: '', color: '#607D8B'});
		});

		window.timestate_widget_form._valueMappingBuilderBound = true;
	}

	window.timestate_widget_form = {
		init() {
			ensureModernBulkPickerStyle();
			ensurePickerOutsideClick();
			ensureWideEditDialog();

			for (const input of document.querySelectorAll('input[type="text"]')) {
				enhanceColorField(input);
			}

			const observer = new MutationObserver(() => {
				ensureWideEditDialog();
				for (const input of document.querySelectorAll('input[type="text"]')) {
					enhanceColorField(input);
				}
			});
			observer.observe(document.body, {childList: true, subtree: true});

			ensureDataSetBuilder();
		}
	};
})();
