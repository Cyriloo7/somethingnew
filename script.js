(function () {
  'use strict';

  var HEARTS = ['❤️', '💕', '💗', '💖', '💝', '💘'];
  var CONFETTI_COLORS = ['#a63652', '#d892a8', '#b8964f', '#f0d4dc', '#8f2d47'];

  var heartsContainer = document.getElementById('hearts-container');
  var ambientHearts = document.getElementById('ambient-hearts');
  var letterOverlay = document.getElementById('letterOverlay');
  var openLetterBtn = document.getElementById('openLetter');
  var closeLetterBtn = document.getElementById('closeLetter');
  var btnYes = document.getElementById('btnYes');
  var btnNo = document.getElementById('btnNo');
  var yesMessage = document.getElementById('yesMessage');
  var closeYesMessage = document.getElementById('closeYesMessage');
  var confettiContainer = document.getElementById('confetti-container');
  var loveMeterFill = document.getElementById('loveMeterFill');
  var loveMeterHeart = document.getElementById('loveMeterHeart');
  var loveMeterLabel = document.getElementById('loveMeterLabel');
  var loveMeterMessage = document.getElementById('loveMeterMessage');
  var loveMeterBar = document.querySelector('.love-meter-bar');
  var loveMeterSection = document.querySelector('.love-meter-section');
  var locketScene = document.getElementById('locketScene');
  var locket = document.getElementById('locket');
  var locketHeartsSpawn = document.getElementById('locket-hearts-spawn');

  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var lastHeartTime = 0;
  var HEART_THROTTLE_MS = isTouch ? 350 : 180;

  // --- Hero visible on load ---
  var hero = document.querySelector('.hero');
  if (hero) hero.classList.add('is-visible');

  // --- Ambient floating hearts (background); fewer on small screens ---
  function createAmbientHearts() {
    var count = window.innerWidth <= 480 ? 6 : 12;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('span');
      el.className = 'ambient-heart';
      el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      el.style.left = Math.random() * 100 + '%';
      el.style.animationDelay = Math.random() * 20 + 's';
      el.style.animationDuration = (15 + Math.random() * 10) + 's';
      ambientHearts.appendChild(el);
    }
  }
  createAmbientHearts();

  // --- Scroll reveal (Intersection Observer) ---
  var revealSections = document.querySelectorAll('.reveal-section');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealSections.forEach(function (section) {
    if (section === hero) return;
    observer.observe(section);
  });

  // --- Letter ---
  function openLetter() {
    letterOverlay.classList.add('is-open');
    letterOverlay.setAttribute('aria-hidden', 'false');
    closeLetterBtn.focus();
  }

  function closeLetter() {
    letterOverlay.classList.remove('is-open');
    letterOverlay.setAttribute('aria-hidden', 'true');
    openLetterBtn.focus();
  }

  if (openLetterBtn) openLetterBtn.addEventListener('click', openLetter);
  if (closeLetterBtn) closeLetterBtn.addEventListener('click', closeLetter);
  if (letterOverlay) {
    letterOverlay.addEventListener('click', function (e) {
      if (e.target === letterOverlay) closeLetter();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (letterOverlay && letterOverlay.classList.contains('is-open')) {
      closeLetter();
      e.preventDefault();
    } else if (yesMessage && yesMessage.classList.contains('is-visible')) {
      yesMessage.classList.remove('is-visible');
      yesMessage.setAttribute('aria-hidden', 'true');
      if (btnYes) btnYes.focus();
      e.preventDefault();
    }
  });

  // --- Floating hearts on click (throttled, touch-friendly) ---
  function spawnHeart(x, y) {
    var now = Date.now();
    if (now - lastHeartTime < HEART_THROTTLE_MS) return;
    lastHeartTime = now;

    var heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heartsContainer.appendChild(heart);
    setTimeout(function () {
      heart.remove();
    }, 2800);
  }

  function handleHeartTap(x, y) {
    if (x && y) spawnHeart(x, y);
  }

  document.addEventListener('click', function (e) {
    if (!isTouch) handleHeartTap(e.clientX, e.clientY);
  });

  if (isTouch) {
    document.addEventListener('touchend', function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        handleHeartTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: true });
  }

  // --- "No" button runs away (mouse and touch) ---
  // Move button to body when floating so it escapes section stacking context and stays above all content
  function moveNoButton() {
    if (!btnNo) return;
    var rect = btnNo.getBoundingClientRect();
    var maxX = window.innerWidth - rect.width - 24;
    var maxY = window.innerHeight - rect.height - 24;
    var newX = Math.max(12, Math.random() * maxX);
    var newY = Math.max(12, Math.random() * maxY);
    if (btnNo.parentNode !== document.body) {
      btnNo.style.position = 'fixed';
      btnNo.style.left = rect.left + 'px';
      btnNo.style.top = rect.top + 'px';
      btnNo.style.zIndex = '9999';
      btnNo.style.transition = 'none';
      document.body.appendChild(btnNo);
      btnNo.offsetHeight;
      btnNo.style.transition = 'left 0.35s cubic-bezier(0.33, 1, 0.68, 1), top 0.35s cubic-bezier(0.33, 1, 0.68, 1)';
    }
    btnNo.style.left = newX + 'px';
    btnNo.style.top = newY + 'px';
  }

  if (btnNo) {
    btnNo.addEventListener('mouseenter', moveNoButton);
    btnNo.addEventListener('touchstart', function (e) {
      e.preventDefault();
      moveNoButton();
    }, { passive: false });
  }

  // --- "Yes" button: confetti + message ---
  function createConfetti() {
    var count = isTouch ? 40 : 60;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      el.style.animationDelay = Math.random() * 0.5 + 's';
      el.style.animationDuration = (3 + Math.random() * 2) + 's';
      confettiContainer.appendChild(el);
      setTimeout(function (elem) {
        return function () { elem.remove(); };
      }(el), 5000);
    }
  }

  if (btnYes && yesMessage) {
    btnYes.addEventListener('click', function () {
      createConfetti();
      yesMessage.classList.add('is-visible');
      yesMessage.setAttribute('aria-hidden', 'false');
      if (closeYesMessage) setTimeout(function () { closeYesMessage.focus(); }, 100);
      if (isTouch && navigator.vibrate) navigator.vibrate(50);
    });
  }
  if (closeYesMessage && yesMessage) {
    closeYesMessage.addEventListener('click', function () {
      yesMessage.classList.remove('is-visible');
      yesMessage.setAttribute('aria-hidden', 'true');
      if (btnYes) setTimeout(function () { btnYes.focus(); }, 0);
    });
  }

  // --- Reason cards: tap/click to reveal (with subtle feedback on touch) ---
  var reasonCards = document.querySelectorAll('.reason-card');
  reasonCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var text = card.querySelector('.reason-text');
      var reason = card.getAttribute('data-reason');
      if (card.classList.contains('revealed')) return;
      card.classList.add('revealed');
      text.textContent = reason;
      if (isTouch && navigator.vibrate) navigator.vibrate(20);
    });
  });

  // --- Love meter: hold heart to fill ---
  var meterPercent = 0;
  var meterInterval = null;

  function updateMeter() {
    if (meterPercent >= 100 || !loveMeterFill || !loveMeterLabel) return;
    meterPercent += 1.5;
    if (meterPercent > 100) meterPercent = 100;
    loveMeterFill.style.width = meterPercent + '%';
    loveMeterLabel.textContent = Math.round(meterPercent) + '%';
    if (loveMeterBar) loveMeterBar.setAttribute('aria-valuenow', Math.round(meterPercent));
    if (meterPercent >= 100 && loveMeterSection && loveMeterMessage) {
      loveMeterSection.classList.add('is-full');
      loveMeterMessage.textContent = 'All of it. \u2764\uFE0F';
    } else if (meterPercent < 100 && loveMeterSection && loveMeterMessage) {
      loveMeterSection.classList.remove('is-full');
      loveMeterMessage.textContent = '';
    }
  }

  function stopMeter() {
    if (meterInterval) {
      clearInterval(meterInterval);
      meterInterval = null;
    }
  }

  if (loveMeterHeart) {
    loveMeterHeart.addEventListener('mousedown', function () {
      stopMeter();
      meterInterval = setInterval(updateMeter, 50);
    });
    loveMeterHeart.addEventListener('mouseleave', stopMeter);
    loveMeterHeart.addEventListener('mouseup', stopMeter);
    loveMeterHeart.addEventListener('touchstart', function (e) {
      e.preventDefault();
      stopMeter();
      meterInterval = setInterval(updateMeter, 50);
    }, { passive: false });
    loveMeterHeart.addEventListener('touchend', function (e) {
      e.preventDefault();
      stopMeter();
    }, { passive: false });
  }

  // --- Locket: click to open (3D open + glow + spawn hearts) ---
  function spawnLocketHearts() {
    var count = 8;
    var angleStep = (2 * Math.PI) / count;
    for (var i = 0; i < count; i++) {
      var angle = angleStep * i + Math.random() * 0.5;
      var dist = 80 + Math.random() * 40;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - 20;
      var el = document.createElement('span');
      el.className = 'locket-spawn-heart';
      el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
      el.style.animationDelay = (i * 0.05) + 's';
      locketHeartsSpawn.appendChild(el);
      setTimeout(function (elem) {
        return function () { elem.remove(); };
      }(el), 2500);
    }
  }

  if (locket && locketScene) {
    locket.addEventListener('click', function () {
      if (locketScene.classList.contains('is-open')) return;
      locketScene.classList.add('is-open');
      locket.setAttribute('aria-label', 'Locket opened');
      setTimeout(spawnLocketHearts, 400);
      if (isTouch && navigator.vibrate) navigator.vibrate(30);
    });
  }
})();
