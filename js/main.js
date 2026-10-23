(function () {
	'use strict';

	var doc = document.documentElement;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	doc.classList.add('js');

	/* ---------- preloader ---------- */
	function markLoaded() { document.body.classList.add('loaded'); }
	window.addEventListener('load', function () { setTimeout(markLoaded, 300); });
	setTimeout(markLoaded, 3000); // never block the page on slow assets

	document.getElementById('year').textContent = new Date().getFullYear();

	/* ---------- theme toggle ---------- */
	document.querySelector('.theme-toggle').addEventListener('click', function () {
		var next = doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
		doc.setAttribute('data-theme', next);
		try { localStorage.setItem('theme', next); } catch (e) {}
	});

	/* ---------- mobile menu ---------- */
	var menuBtn = document.querySelector('.menu-toggle');
	function setMenu(open) {
		document.body.classList.toggle('menu-open', open);
		menuBtn.setAttribute('aria-expanded', open);
	}
	menuBtn.addEventListener('click', function () {
		setMenu(!document.body.classList.contains('menu-open'));
	});
	document.querySelectorAll('.nav-links a').forEach(function (a) {
		a.addEventListener('click', function () { setMenu(false); });
	});

	/* ---------- nav state, scroll progress ---------- */
	var nav = document.querySelector('.nav');
	var progress = document.querySelector('.scroll-progress');
	var lastY = 0;
	function onScroll() {
		var y = window.scrollY;
		var max = document.body.scrollHeight - window.innerHeight;
		progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
		nav.classList.toggle('scrolled', y > 20);
		nav.classList.toggle('hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
		lastY = y;
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	/* ---------- active section highlight ---------- */
	var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
	var sectionObserver = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (!entry.isIntersecting) return;
			navLinks.forEach(function (l) {
				l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
			});
		});
	}, { rootMargin: '-45% 0px -50% 0px' });
	document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });

	/* ---------- reveal on scroll ---------- */
	document.querySelectorAll('.reveal').forEach(function (el) {
		if (el.dataset.delay) el.style.setProperty('--delay', el.dataset.delay + 'ms');
	});
	var revealObserver = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (!entry.isIntersecting) return;
			var el = entry.target;
			el.classList.add('visible');
			if (el.classList.contains('skill')) animateSkill(el);
			el.querySelectorAll('.counter').forEach(animateCounter);
			revealObserver.unobserve(el);
		});
	}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
	document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

	/* ---------- skills & counters ---------- */
	function countTo(target, duration, onStep) {
		if (reduceMotion) { onStep(target); return; }
		var start = null;
		function step(ts) {
			if (!start) start = ts;
			var p = Math.min((ts - start) / duration, 1);
			var eased = 1 - Math.pow(1 - p, 4);
			onStep(Math.round(target * eased));
			if (p < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function animateSkill(el) {
		var percent = parseInt(el.dataset.percent, 10);
		var val = el.querySelector('.skill-val');
		el.querySelector('.skill-bar i').style.width = percent + '%';
		countTo(percent, 1600, function (n) { val.textContent = n + '%'; });
	}

	function animateCounter(el) {
		var target = parseInt(el.dataset.target, 10);
		// years count up from a nearby value instead of zero
		var from = target > 1000 ? target - 30 : 0;
		countTo(target - from, 1800, function (n) { el.textContent = from + n; });
	}

	/* ---------- typing effect ---------- */
	var typed = document.querySelector('.typed');
	var words = JSON.parse(typed.dataset.words);
	if (reduceMotion) {
		typed.textContent = words[0];
	} else {
		var wi = 0, ci = 0, deleting = false;
		(function type() {
			var word = words[wi];
			ci += deleting ? -1 : 1;
			typed.textContent = word.slice(0, ci);
			var delay = deleting ? 45 : 95;
			if (!deleting && ci === word.length) { deleting = true; delay = 1800; }
			else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 400; }
			setTimeout(type, delay);
		})();
	}

	/* ---------- pointer effects (desktop only) ---------- */
	var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	if (finePointer && !reduceMotion) {
		var glow = document.querySelector('.cursor-glow');
		window.addEventListener('mousemove', function (e) {
			document.body.classList.add('has-pointer');
			glow.style.left = e.clientX + 'px';
			glow.style.top = e.clientY + 'px';
		}, { passive: true });

		document.querySelectorAll('.tilt').forEach(function (el) {
			el.addEventListener('mousemove', function (e) {
				var r = el.getBoundingClientRect();
				var x = (e.clientX - r.left) / r.width;
				var y = (e.clientY - r.top) / r.height;
				el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 10) + 'deg) rotateY(' + ((x - 0.5) * 10) + 'deg)';
				el.style.setProperty('--mx', x * 100 + '%');
				el.style.setProperty('--my', y * 100 + '%');
			});
			el.addEventListener('mouseleave', function () { el.style.transform = ''; });
		});

		document.querySelectorAll('.magnetic').forEach(function (el) {
			el.addEventListener('mousemove', function (e) {
				var r = el.getBoundingClientRect();
				var x = e.clientX - r.left - r.width / 2;
				var y = e.clientY - r.top - r.height / 2;
				el.style.transform = 'translate(' + x * 0.2 + 'px,' + y * 0.3 + 'px)';
			});
			el.addEventListener('mouseleave', function () { el.style.transform = ''; });
		});
	}

	/* ---------- portfolio filter ---------- */
	var filters = document.querySelectorAll('.filter');
	var pill = document.querySelector('.filter-pill');
	var projects = document.querySelectorAll('.project');

	function movePill(btn) {
		pill.style.width = btn.offsetWidth + 'px';
		pill.style.transform = 'translate(' + (btn.offsetLeft - 6) + 'px,' + (btn.offsetTop - 6) + 'px)';
	}
	movePill(document.querySelector('.filter.active'));
	window.addEventListener('resize', function () { movePill(document.querySelector('.filter.active')); });
	document.fonts && document.fonts.ready.then(function () { movePill(document.querySelector('.filter.active')); });

	filters.forEach(function (btn) {
		btn.addEventListener('click', function () {
			filters.forEach(function (b) { b.classList.remove('active'); });
			btn.classList.add('active');
			movePill(btn);
			var group = btn.dataset.filter;
			projects.forEach(function (p, i) {
				var show = group === 'all' || p.dataset.groups.split(' ').indexOf(group) > -1;
				p.classList.remove('is-entering');
				p.classList.toggle('is-hidden', !show);
				if (show) {
					p.classList.add('visible');
					void p.offsetWidth; // restart animation
					p.style.animationDelay = (i * 60) + 'ms';
					p.classList.add('is-entering');
				}
			});
		});
	});

	/* ---------- project modal ---------- */
	var modal = document.getElementById('modal');
	var modalContent = modal.querySelector('.modal-content');
	var lastFocus = null;

	function openModal(id) {
		var tpl = document.getElementById(id);
		if (!tpl) return;
		lastFocus = document.activeElement;
		modalContent.innerHTML = '';
		modalContent.appendChild(tpl.content.cloneNode(true));
		modal.querySelector('.modal-dialog').scrollTop = 0;
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
		document.body.classList.add('no-scroll');
		modal.querySelector('.modal-close').focus();
	}
	function closeModal() {
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('no-scroll');
		if (lastFocus) lastFocus.focus();
	}

	projects.forEach(function (p) {
		p.setAttribute('tabindex', '0');
		p.setAttribute('role', 'button');
		p.addEventListener('click', function () { openModal(p.dataset.modal); });
		p.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p.dataset.modal); }
		});
	});
	modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closeModal); });
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
	});
})();
