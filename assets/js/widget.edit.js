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

	function injectCss() {
		if (document.getElementById('timestate-color-picker-css')) {
			return;
		}

		const style = document.createElement('style');
		style.id = 'timestate-color-picker-css';
		style.textContent = [
			'.timestate-picker{position:relative;display:inline-flex;align-items:center;gap:8px;}',
			'.timestate-picker__btn{width:22px;height:22px;border:1px solid #2f3947;border-radius:6px;cursor:pointer;}',
			'.timestate-picker__pop{position:absolute;z-index:1200;top:28px;left:0;background:#141a22;border:1px solid #2f3947;border-radius:10px;box-shadow:0 12px 28px rgba(0,0,0,.45);padding:8px;min-width:210px;}',
			'.timestate-picker__grid{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;}',
			'.timestate-picker__dot{width:18px;height:18px;border-radius:5px;border:1px solid rgba(255,255,255,.18);cursor:pointer;}',
			'.timestate-picker__custom{display:flex;gap:6px;margin-top:8px;}',
			'.timestate-picker__custom input{width:100%;background:#0f151d;color:#e5edf5;border:1px solid #354255;border-radius:6px;padding:4px 6px;}',
			'.timestate-picker__custom button{border:1px solid #3b82f6;background:#0f172a;color:#e2ecff;border-radius:6px;padding:4px 8px;cursor:pointer;}'
		].join('');
		document.head.appendChild(style);
	}

	function createPicker(initialColor) {
		const palette = [
			'#22C55E', '#2E7D32', '#84CC16', '#FACC15', '#F59E0B', '#F97316', '#EF4444', '#C62828',
			'#E11D48', '#BE185D', '#A855F7', '#7C3AED', '#6366F1', '#2563EB', '#0284C7', '#0891B2',
			'#0D9488', '#059669', '#65A30D', '#CA8A04', '#EA580C', '#DC2626', '#9F1239', '#6D28D9',
			'#4338CA', '#1D4ED8', '#0369A1', '#0F766E', '#334155', '#475569', '#64748B', '#94A3B8'
		];

		const root = document.createElement('div');
		root.className = 'timestate-picker';
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'timestate-picker__btn';

		const pop = document.createElement('div');
		pop.className = 'timestate-picker__pop';
		pop.hidden = true;

		const grid = document.createElement('div');
		grid.className = 'timestate-picker__grid';

		const custom = document.createElement('div');
		custom.className = 'timestate-picker__custom';
		const customInput = document.createElement('input');
		customInput.type = 'text';
		customInput.placeholder = '#RRGGBB';
		const customApply = document.createElement('button');
		customApply.type = 'button';
		customApply.textContent = 'Apply';
		custom.appendChild(customInput);
		custom.appendChild(customApply);

		pop.appendChild(grid);
		pop.appendChild(custom);
		root.appendChild(btn);
		root.appendChild(pop);

		let value = normalizeHexColor(initialColor, '#94A3B8');
		btn.style.background = value;
		customInput.value = value;

		const emit = () => {
			root.dispatchEvent(new CustomEvent('timestate-color-change', {
				bubbles: true,
				detail: {value}
			}));
		};

		const setValue = (next, shouldEmit = true) => {
			value = normalizeHexColor(next, value);
			btn.style.background = value;
			customInput.value = value;
			if (shouldEmit) {
				emit();
			}
		};

		for (const color of palette) {
			const dot = document.createElement('button');
			dot.type = 'button';
			dot.className = 'timestate-picker__dot';
			dot.style.background = color;
			dot.title = color;
			dot.addEventListener('click', () => setValue(color));
			grid.appendChild(dot);
		}

		btn.addEventListener('click', () => {
			pop.hidden = !pop.hidden;
		});
		customApply.addEventListener('click', () => {
			setValue(customInput.value);
		});
		document.addEventListener('click', (event) => {
			if (!root.contains(event.target)) {
				pop.hidden = true;
			}
		});

		return {
			element: root,
			setValue
		};
	}

	function enhanceField(field) {
		if (!field || field.dataset.timestateColorInit === '1') {
			return;
		}

		const token = `${field.name || ''} ${field.id || ''}`;
		if (!/_color/.test(token)) {
			return;
		}

		const picker = createPicker(field.value || '#94A3B8');
		picker.element.addEventListener('timestate-color-change', (event) => {
			field.value = normalizeHexColor(event.detail && event.detail.value, '#94A3B8');
			field.dispatchEvent(new Event('input', {bubbles: true}));
			field.dispatchEvent(new Event('change', {bubbles: true}));
		});

		field.addEventListener('input', () => {
			picker.setValue(field.value, false);
		});

		field.parentNode.insertBefore(picker.element, field.nextSibling);
		field.dataset.timestateColorInit = '1';
	}

	window.timestate_widget_form = {
		init() {
			injectCss();
			for (const input of document.querySelectorAll('input[type="text"]')) {
				enhanceField(input);
			}

			const observer = new MutationObserver(() => {
				for (const input of document.querySelectorAll('input[type="text"]')) {
					enhanceField(input);
				}
			});
			observer.observe(document.body, {childList: true, subtree: true});
		}
	};
})();
