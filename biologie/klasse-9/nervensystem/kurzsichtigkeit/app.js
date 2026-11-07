/* Kurzsichtigkeit und Brille: Strahlengang-Simulation (vereinfachtes Modell mit dünnen Linsen).
   Reines JavaScript, keine externen Ressourcen. Alle Längen in Millimetern. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var PX = 6;          // Pixel je mm in der Zeichnung
  var START = -60;     // Strahlen beginnen hier (x in mm)
  var XB = -15;        // Brille steht 15 mm vor der Linse
  var HB = 4.5;        // Höhe der äußeren Strahlen in mm (kleiner als die Pupille)
  var F_NORMAL = 24;   // Brennweite der Linse im Normalauge
  var S_NORMAL = 8;    // Linsenstufe des Normalauges (Brennweite = 32 - Stufe)
  var TOL = 0.6;       // Toleranz für "auf der Netzhaut" in mm

  /* ---------- Physik (rein rechnerisch, ohne Zeichnen) ---------- */
  function trace(p) {
    // p: L (Augenlänge), f (Brennweite Linse), d (Gegenstandsabstand in mm oder Infinity),
    //    brille: { typ: 'none'|'minus'|'plus', dpt: Zahl }
    var fb = null;
    if (p.brille.typ !== 'none' && p.brille.dpt > 0) {
      fb = (p.brille.typ === 'plus' ? 1 : -1) * 1000 / p.brille.dpt;
    }
    var rays = [];
    [HB, 0, -HB].forEach(function (hb) {
      var m0 = isFinite(p.d) ? hb / (XB + p.d) : 0;   // Steigung vor der Brille (Punktquelle bei x = -d)
      var y0 = hb + m0 * (START - XB);                // Höhe am linken Rand der Zeichnung
      var m1 = fb ? m0 - hb / fb : m0;                // dünne Linse: m' = m - h/f
      var h0 = hb + m1 * (0 - XB);                    // Höhe an der Augenlinse
      var m2 = m1 - h0 / p.f;
      var yr = h0 + m2 * p.L;                         // Höhe auf der Netzhaut
      rays.push({ hb: hb, y0: y0, h0: h0, m2: m2, yr: yr });
    });
    var top = rays[0], bot = rays[2];
    var xf = top.m2 < -1e-9 ? -top.h0 / top.m2 : null; // Bündelpunkt (null = Strahlen laufen auseinander)
    var spread = Math.abs(top.yr - bot.yr);
    var pos = null, bild = 'unscharf';
    if (xf !== null) {
      var delta = xf - p.L;
      pos = Math.abs(delta) <= TOL ? 'auf' : (delta < 0 ? 'vor' : 'hinter');
      bild = Math.abs(delta) <= TOL ? 'scharf' : (Math.abs(delta) <= 1.8 ? 'leicht unscharf' : 'unscharf');
    }
    return { rays: rays, xf: xf, pos: pos, bild: bild, spread: spread, fb: fb };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { trace: trace, TOL: TOL };
    return;
  }

  /* ---------- Zustand ---------- */
  var st = { L: 24, s: S_NORMAL, d: Infinity, typ: 'none', dpt: 0 };
  var PRESETS = {
    normal: { L: 24, s: 8 },
    lang: { L: 27, s: 8 },
    stark: { L: 24, s: 11 }
  };

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function svgEl(tag, attrs, cls) {
    var e = document.createElementNS(NS, tag);
    if (cls) e.setAttribute('class', cls);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function icon(kind) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2.6');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', kind === 'ok' ? 'M4 12.5l5 5L20 6.5' : 'M6 6l12 12M18 6L6 18');
    s.appendChild(p);
    return s;
  }
  function X(x) { return x * PX; }
  function Y(y) { return -y * PX; }
  function zahl(n, stellen) { return n.toFixed(stellen).replace('.', ','); }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  /* ---------- Zeichnen ---------- */
  function zeichne(res) {
    var L = st.L, f = 32 - st.s;
    var gA = $('g-auge'), gB = $('g-brille'), gR = $('g-strahlen'), gF = $('g-fokus');
    [gA, gB, gR, gF].forEach(clear);

    // Auge: abgerundeter Umriss, Netzhaut, Iris, Linse
    gA.appendChild(svgEl('rect', { x: X(-4), y: Y(13), width: (L + 6) * PX, height: 26 * PX, rx: 11 * PX, ry: 11 * PX }, 'auge-umriss'));
    gA.appendChild(svgEl('line', { x1: X(L), y1: Y(7.5), x2: X(L), y2: Y(-7.5) }, 'netzhaut-l'));
    gA.appendChild(svgEl('line', { x1: X(-1), y1: Y(5.6), x2: X(-1), y2: Y(8.2) }, 'iris-s'));
    gA.appendChild(svgEl('line', { x1: X(-1), y1: Y(-5.6), x2: X(-1), y2: Y(-8.2) }, 'iris-s'));
    var rx = 0.8 + st.s * 0.17;
    gA.appendChild(svgEl('ellipse', { cx: 0, cy: 0, rx: rx * PX, ry: 6.2 * PX }, 'linse-s'));

    // Brille
    if (st.typ !== 'none' && st.dpt > 0) {
      if (st.typ === 'plus') {
        gB.appendChild(svgEl('ellipse', { cx: X(XB), cy: 0, rx: 1.6 * PX, ry: 9 * PX }, 'brille-s'));
      } else {
        var a = X(XB - 1.5), b = X(XB + 1.5), top = Y(9), bot = Y(-9);
        gB.appendChild(svgEl('path', {
          d: 'M' + a + ' ' + top + ' L' + b + ' ' + top +
             ' Q' + X(XB - 0.3) + ' 0 ' + b + ' ' + bot +
             ' L' + a + ' ' + bot +
             ' Q' + X(XB + 0.3) + ' 0 ' + a + ' ' + top + ' Z'
        }, 'brille-s'));
      }
    }

    // Strahlen
    res.rays.forEach(function (r) {
      var pts = [[START, r.y0], [XB, r.hb], [0, r.h0], [L, r.yr]]
        .map(function (q) { return X(q[0]) + ',' + Y(q[1]); }).join(' ');
      gR.appendChild(svgEl('polyline', { points: pts }, 'ray'));
    });
    if (res.xf !== null && res.xf > L && res.xf <= 37) {
      [res.rays[0], res.rays[2]].forEach(function (r) {
        gR.appendChild(svgEl('line', { x1: X(L), y1: Y(r.yr), x2: X(res.xf), y2: 0 }, 'ray-weiter'));
      });
    }
    if (res.xf !== null && res.xf <= 37) {
      gF.appendChild(svgEl('circle', { cx: X(res.xf), cy: 0, r: 7 }, 'fokus-s'));
    }
  }

  /* ---------- Anzeige ---------- */
  var statusTimer = null;
  function statusText(res) {
    var box = $('status');
    clear(box);
    var L = st.L;
    var lage;
    if (res.xf === null) {
      box.appendChild(el('p', null, 'Die Strahlen laufen nach der Linse auseinander. Es gibt keinen Bündelpunkt.'));
    } else {
      lage = res.pos === 'auf' ? 'auf der Netzhaut' : (res.pos === 'vor' ? 'vor der Netzhaut' : 'hinter der Netzhaut');
      box.appendChild(el('p', null, 'Der Bündelpunkt liegt ' + lage + '. Er ist ' + zahl(res.xf, 1) + ' mm von der Linse entfernt. Die Netzhaut ist ' + zahl(L, 1) + ' mm von der Linse entfernt.'));
    }
    var ok = res.bild === 'scharf';
    var r = el('p', 'rueck ' + (ok ? 'ok' : 'nok'));
    r.appendChild(icon(ok ? 'ok' : 'nok'));
    r.appendChild(el('span', null, ok ? 'Das Bild ist scharf.' : (res.bild === 'leicht unscharf' ? 'Das Bild ist leicht unscharf.' : 'Das Bild ist unscharf.')));
    box.appendChild(r);
  }
  function aktualisiereBeschriftungen() {
    $('o-laenge').textContent = zahl(st.L, 1) + ' mm';
    var diff = st.s - S_NORMAL;
    $('o-linse').textContent = diff === 0 ? 'normal' : (diff > 0 ? 'stärker (Stufe +' + diff + ')' : 'schwächer (Stufe ' + String(diff).replace('-', '\u2212') + ')');
    $('o-brille').textContent = st.typ === 'none' ? 'keine Brille' : zahl(st.dpt, 1) + ' dpt';
    $('r-laenge').value = st.L;
    $('r-linse').value = st.s;
    $('r-brille').value = st.dpt;
    $('r-brille').disabled = st.typ === 'none';
    // Voreinstellung nur markieren, wenn die Werte genau passen und keine Brille gewählt ist
    Array.prototype.forEach.call(document.querySelectorAll('#seg-preset button'), function (b) {
      var p = PRESETS[b.getAttribute('data-preset')];
      b.setAttribute('aria-pressed', (p.L === st.L && p.s === st.s && st.typ === 'none') ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('#seg-gegenstand button'), function (b) {
      var v = b.getAttribute('data-d');
      var d = v === 'inf' ? Infinity : Number(v);
      b.setAttribute('aria-pressed', d === st.d ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('#seg-brille button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-b') === st.typ ? 'true' : 'false');
    });
  }
  function render(sofort) {
    var res = trace({ L: st.L, f: 32 - st.s, d: st.d, brille: { typ: st.typ, dpt: st.dpt } });
    zeichne(res);
    aktualisiereBeschriftungen();
    var blur = res.xf === null ? 12 : Math.min(12, res.spread * 8);
    if (res.bild === 'scharf') blur = 0;
    $('buchstaben').style.filter = blur > 0 ? 'blur(' + blur.toFixed(1) + 'px)' : 'none';
    clearTimeout(statusTimer);
    if (sofort) statusText(res);
    else statusTimer = setTimeout(function () { statusText(res); }, 350);
  }

  /* ---------- Bedienung ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('#seg-preset button'), function (b) {
    b.addEventListener('click', function () {
      var p = PRESETS[b.getAttribute('data-preset')];
      st.L = p.L; st.s = p.s; st.typ = 'none'; st.dpt = 0;
      render(true);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#seg-gegenstand button'), function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-d');
      st.d = v === 'inf' ? Infinity : Number(v);
      render(true);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#seg-brille button'), function (b) {
    b.addEventListener('click', function () {
      st.typ = b.getAttribute('data-b');
      if (st.typ === 'none') st.dpt = 0;
      else if (st.dpt === 0) st.dpt = 2;
      render(true);
    });
  });
  $('r-laenge').addEventListener('input', function () { st.L = Number(this.value); render(false); });
  $('r-linse').addEventListener('input', function () { st.s = Number(this.value); render(false); });
  $('r-brille').addEventListener('input', function () { st.dpt = Number(this.value); render(false); });

  /* Prüfaufgaben mit Auswahlfeldern */
  Array.prototype.forEach.call(document.querySelectorAll('form.pruef'), function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var fb = f.querySelector('.pr-fb');
      clear(fb);
      var gewaehlt = f.querySelector('input[type="radio"]:checked');
      if (!gewaehlt) {
        fb.appendChild(el('p', 'hinweis', 'Wähle zuerst eine Antwort.'));
        return;
      }
      var ok = gewaehlt.value === f.getAttribute('data-richtig');
      var r = el('p', 'rueck ' + (ok ? 'ok' : 'nok'));
      r.appendChild(icon(ok ? 'ok' : 'nok'));
      r.appendChild(el('span', null, ok ? f.getAttribute('data-ok') : f.getAttribute('data-nok')));
      fb.appendChild(r);
    });
  });

  render(true);
})();
