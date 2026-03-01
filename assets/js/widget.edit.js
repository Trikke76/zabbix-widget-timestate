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
			const rect = button.getBoundingClientRect();
			pop.style.top = `${Math.round(rect.bottom + 6)}px`;
			pop.style.left = `${Math.round(rect.left)}px`;
		};
		const closePop = () => {
			pop.classList.add('is-hidden');
		};
		const openPop = () => {
			ensureColorDots();
			positionPop();
			pop.classList.remove('is-hidden');
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

	window.timestate_widget_form = {
		init() {
			ensureModernBulkPickerStyle();
			ensurePickerOutsideClick();

			for (const input of document.querySelectorAll('input[type="text"]')) {
				enhanceColorField(input);
			}

			const observer = new MutationObserver(() => {
				for (const input of document.querySelectorAll('input[type="text"]')) {
					enhanceColorField(input);
				}
			});
			observer.observe(document.body, {childList: true, subtree: true});

			ensureItemPreviewBinding();
		}
	};
})();
