/* ============================================================
   Birthday card — app logic
   1. screen machine  2. confetti  3. cake  4. yes/no
   5. hub  6. letter typewriter  7. music  8. flip card
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. SCREEN MACHINE ---------- */
  var screens = {};
  $$('.screen').forEach(function (el) { screens[el.dataset.screen] = el; });
  var current = 'cake';
  var busy = false;

  function go(name) {
    if (busy || name === current) return;
    busy = true;

    var from = screens[current];
    var to   = screens[name];

    from.classList.add('is-leaving');
    from.classList.remove('is-active');

    // one frame so the browser commits the outgoing transform first
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        to.classList.remove('is-leaving');
        to.classList.add('is-active');
      });
    });

    $('#bunting').classList.toggle('show', name === 'cake');

    setTimeout(function () {
      from.classList.remove('is-leaving');
      busy = false;
      if (name === 'letter') revealLetter();
      if (name !== 'gift') pauseAudio();
    }, reduceMotion ? 60 : 480);

    current = name;
  }

  /* ---------- 2. CONFETTI ---------- */
  var PALETTE = ['#ba181b', '#ffd166', '#ffffff', '#f3b8b8', '#6a040f'];
  var has = function () { return typeof window.confetti === 'function'; };

  function burst() {
    if (!has()) return;
    var base = { colors: PALETTE, disableForReducedMotion: true };
    confetti(Object.assign({}, base, { particleCount: 90, spread: 72, startVelocity: 46, origin: { y: 0.62 } }));
    setTimeout(function () { confetti(Object.assign({}, base, { particleCount: 60, angle: 60,  spread: 62, origin: { x: 0, y: 0.7 } })); }, 140);
    setTimeout(function () { confetti(Object.assign({}, base, { particleCount: 60, angle: 120, spread: 62, origin: { x: 1, y: 0.7 } })); }, 260);
    setTimeout(function () { confetti(Object.assign({}, base, { particleCount: 110, spread: 110, scalar: 0.9, origin: { y: 0.45 } })); }, 400);
  }

  function cornerBurst() {
    if (!has()) return;
    var base = { colors: PALETTE, disableForReducedMotion: true, startVelocity: 58, particleCount: 70, spread: 58 };
    confetti(Object.assign({}, base, { angle: 62,  origin: { x: 0.02, y: 1 } }));
    confetti(Object.assign({}, base, { angle: 118, origin: { x: 0.98, y: 1 } }));
    setTimeout(function () {
      confetti(Object.assign({}, base, { angle: 70,  particleCount: 45, origin: { x: 0.08, y: 1 } }));
      confetti(Object.assign({}, base, { angle: 110, particleCount: 45, origin: { x: 0.92, y: 1 } }));
    }, 220);
  }

  /* ---------- 3. CAKE ---------- */
  var candlesOut = false;
  var cakeBtn   = $('#cakeBtn');
  var cakeLabel = $('#cakeBtnLabel');

  cakeBtn.addEventListener('click', function () {
    if (!candlesOut) {
      candlesOut = true;
      $('#flameWrap').classList.add('out');
      $('#smoke').classList.add('puff');
      burst();
      cakeLabel.classList.add('swap');            // cross-fade the label
      setTimeout(function () {
        cakeLabel.textContent = 'Next ➔';
        cakeLabel.classList.remove('swap');
      }, 260);
    } else {
      go('accept');
    }
  });

  /* ---------- 4. YES / NO ---------- */
  $('#btnYes').addEventListener('click', function () { burst(); go('hub'); });

  $('#btnNo').addEventListener('click', function () {
    var stage = $('#stage');
    stage.classList.add('shake');
    setTimeout(function () { stage.classList.remove('shake'); }, 520);
    setTimeout(function () { go('guilt'); }, 180);
  });

  $('#btnTry').addEventListener('click', function () { go('accept'); });

  /* ---------- 5. HUB ---------- */
  $$('[data-go]').forEach(function (card) {
    card.addEventListener('click', function () { go(card.dataset.go); });
  });
  $$('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () { go('hub'); });
  });

  /* ---------- 6. LETTER + TYPEWRITER ---------- */
  var LETTER =
    'To Sakshi,\n' +
    'Wishing you a day filled with love, laughter, and happiness.\n\n' +
    'Thank you for staying more positive at every moment.\n\n' +
    'Thode zyada Nakhre he lekin ye bhi chalta he 😼😼😼.\n\n' +
    'May all your dreams come true.\n' +
    'Stay Blessed forever. ❤️';

  var sheet  = $('#letterSheet');
  var textEl = $('#letterText');
  var caret  = $('#caret');
  var typeTimer = null;

  function revealLetter() {
    clearTimeout(typeTimer);
    textEl.textContent = '';
    caret.classList.remove('done');
    sheet.classList.remove('up');
    requestAnimationFrame(function () { sheet.classList.add('up'); });

    if (reduceMotion) {
      textEl.textContent = LETTER;
      caret.classList.add('done');
      return;
    }

    var i = 0;
    function tick() {
      if (current !== 'letter') return;            // navigated away
      textEl.textContent = LETTER.slice(0, ++i);
      if (i < LETTER.length) {
        var ch = LETTER[i - 1];
        var pause = ch === '\n' ? 180 : (/[.,!]/.test(ch) ? 150 : 26);
        typeTimer = setTimeout(tick, pause);
      } else {
        setTimeout(function () { caret.classList.add('done'); }, 900);
      }
    }
    typeTimer = setTimeout(tick, 900);             // wait for the slide-up
  }

 /* ---------- 7. MUSIC ---------- */
  var SONG = 'assets/audio/song.mp3';

  var audioEl   = $('#audio');
  var playBtn   = $('#playBtn');
  var giftCol   = $('#player').parentElement;
  var isPlaying = false;

  // Set the audio track
  audioEl.src = SONG;

  function setPlayState(on) {
    isPlaying = on;
    giftCol.classList.toggle('playing', on);
    var sGift = $('#s-gift');
    if (sGift) sGift.classList.toggle('playing', on);
    playBtn.textContent = on ? '❚❚' : '▶';
    playBtn.classList.toggle('is-playing', on);
    playBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
  }

  function playAudio() {
    audioEl.play().catch(function () {});
    setPlayState(true);
  }

  function pauseAudio() {
    if (!isPlaying) return;
    audioEl.pause();
    setPlayState(false);
  }

  playBtn.addEventListener('click', function () {
    isPlaying ? pauseAudio() : playAudio();
  });

  audioEl.addEventListener('ended', function () {
    setPlayState(false);
  });

  /* ---------- 8. FLIP CARD ---------- */
  var flip = $('#flipCard');
  var opened = false;

  function openCard() {
    if (opened) { flip.classList.remove('open'); opened = false; return; }
    opened = true;
    flip.classList.add('open');
    setTimeout(cornerBurst, 420);
    setTimeout(function () { $('#toast').classList.add('show'); }, 1100);
  }
  flip.addEventListener('click', openCard);
  flip.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
  });

  /* ---------- 9. NICETIES ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (['letter', 'flowers', 'gift'].indexOf(current) > -1) go('hub');
  });

  $('#bunting').classList.add('show');

  window.addEventListener('load', function () {
    if (reduceMotion) return;
    $('#cakeArt').animate(
      [{ transform: 'translateY(26px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 900, easing: 'cubic-bezier(0.34,1.56,0.64,1)', fill: 'both' }
    );
  });
})();
