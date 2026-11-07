/* Das Auge: Bau und Funktion. Reines JavaScript, keine externen Ressourcen. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var TEILE = [
    { id: 'hornhaut', name: 'Hornhaut', silben: 'Horn-haut', kern: true,
      text: 'Die Hornhaut liegt ganz vorn. Sie schützt das Auge. Sie bricht das Licht und bündelt es schon stark.' },
    { id: 'lederhaut', name: 'Lederhaut', silben: 'Le-der-haut', kern: false,
      text: 'Die Lederhaut ist die weiße, feste Hülle. Sie schützt das Auge und hält seine Form.' },
    { id: 'aderhaut', name: 'Aderhaut', silben: 'Ader-haut', kern: false,
      text: 'Die Aderhaut liegt unter der Lederhaut. Ihre Blutgefäße versorgen das Auge. Sie ist dunkel und schluckt Streulicht.' },
    { id: 'iris', name: 'Iris', silben: 'I-ris', kern: true,
      text: 'Die Iris ist ein Ring aus Muskeln. Sie macht die Pupille größer oder kleiner. So steuert sie die Lichtmenge.' },
    { id: 'pupille', name: 'Pupille', silben: 'Pu-pil-le', kern: true,
      text: 'Die Pupille ist das Loch in der Iris. Durch sie fällt das Licht ins Auge. Bei viel Licht ist sie klein. Bei wenig Licht ist sie groß.' },
    { id: 'linse', name: 'Linse', silben: 'Lin-se', kern: true,
      text: 'Die Linse bricht das Licht und bündelt es auf der Netzhaut. Sie ist elastisch und ändert ihre Form. So wird das Bild in der Nähe und in der Ferne scharf.' },
    { id: 'ziliarmuskel', name: 'Ziliarmuskel', silben: 'Zi-li-ar-mus-kel', kern: false,
      text: 'Der Ziliarmuskel hält die Linse mit feinen Fasern. Er ändert die Form der Linse. Beim Sehen in der Nähe wird die Linse dicker.' },
    { id: 'glaskoerper', name: 'Glaskörper', silben: 'Glas-kör-per', kern: false,
      text: 'Der Glaskörper ist eine klare, gelartige Masse. Er füllt das Auge aus und hält seine Form. Das Licht geht hindurch.' },
    { id: 'netzhaut', name: 'Netzhaut', silben: 'Netz-haut', kern: true,
      text: 'Die Netzhaut kleidet den Augenhintergrund aus. Sie enthält die Sinneszellen für Licht. Hier entsteht das Bild. Die Sinneszellen wandeln Licht in Signale um.' },
    { id: 'gelber-fleck', name: 'Gelber Fleck', silben: 'Gel-ber Fleck', kern: false,
      text: 'Der Gelbe Fleck liegt in der Mitte der Netzhaut. Hier sitzen die meisten Sinneszellen. Hier sehen wir am schärfsten.' },
    { id: 'blinder-fleck', name: 'Blinder Fleck', silben: 'Blin-der Fleck', kern: false,
      text: 'Am Blinden Fleck verlässt der Sehnerv das Auge. Hier gibt es keine Sinneszellen. Hier sehen wir nichts.' },
    { id: 'sehnerv', name: 'Sehnerv', silben: 'Seh-nerv', kern: true,
      text: 'Der Sehnerv leitet die Signale der Netzhaut zum Gehirn.' }
  ];
  var BY_ID = {};
  TEILE.forEach(function (t) { BY_ID[t.id] = t; });

  /* ---------- Hilfsfunktionen ---------- */
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function icon(kind) { // 'ok' = Haken, 'nok' = Kreuz (lokale Inline-SVG)
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
  function shuffle(a) {
    var b = a.slice(), i, j, t;
    for (i = b.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }

  /* Hervorhebung: kopiert die Formen eines Teils als gestrichelten Umriss in die Ebene .hl */
  function markiere(svg, id) {
    var layer = svg.querySelector('.hl');
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    if (!id) return;
    var g = svg.querySelector('.tg[data-teil="' + id + '"]');
    if (!g) return;
    Array.prototype.forEach.call(g.children, function (c) {
      var k = c.cloneNode(false);
      k.removeAttribute('class');
      layer.appendChild(k);
    });
  }

  /* ---------- Aufgabe 1: Untersuchen ---------- */
  var svg1 = document.getElementById('auge-svg');
  var info1 = document.getElementById('info1');
  var liste1 = document.getElementById('liste1');
  var gesehen = {};
  var aktiv1 = null;

  function zeigeInfo(id) {
    aktiv1 = id;
    gesehen[id] = true;
    var t = BY_ID[id];
    info1.textContent = '';
    var h = el('h3', null, t.name + ' ');
    h.appendChild(el('span', 'silben', '(' + t.silben + ')'));
    info1.appendChild(h);
    info1.appendChild(el('p', null, t.text));
    var n = Object.keys(gesehen).length;
    info1.appendChild(el('p', 'zaehler', 'Du hast ' + n + ' von ' + TEILE.length + ' Teilen angesehen.'));
    markiere(svg1, id);
    Array.prototype.forEach.call(liste1.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-teil') === id ? 'true' : 'false');
    });
  }
  function startInfo() {
    info1.textContent = '';
    info1.appendChild(el('p', null, 'Tippe ein Teil in der Abbildung an oder wähle es in der Liste.'));
  }
  TEILE.forEach(function (t) {
    var li = el('li');
    var b = el('button', null, t.name);
    b.type = 'button';
    b.setAttribute('data-teil', t.id);
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { zeigeInfo(t.id); });
    li.appendChild(b);
    liste1.appendChild(li);
  });
  Array.prototype.forEach.call(svg1.querySelectorAll('.tg'), function (g) {
    g.addEventListener('click', function () { zeigeInfo(g.getAttribute('data-teil')); });
  });
  startInfo();

  /* ---------- Aufgabe 2: Benennen ---------- */
  var abb2 = document.getElementById('abb2');
  var svg2 = svg1.cloneNode(true);
  svg2.removeAttribute('id');
  Array.prototype.forEach.call(svg2.querySelectorAll('.tg'), function (g) { g.style.cursor = 'default'; });
  markiere(svg2, null);
  abb2.appendChild(svg2);

  var quizBox = document.getElementById('quiz');
  var umfang = 'kern';
  var q = null;

  function neuesQuiz() {
    var pool = TEILE.filter(function (t) { return umfang === 'alle' || t.kern; });
    q = { pool: pool, fragen: shuffle(pool), i: 0, richtig: 0, falsch: [], beantwortet: false };
    zeigeFrage();
  }
  function optionenFuer(ziel) {
    var andere = shuffle(q.pool.filter(function (t) { return t.id !== ziel.id; })).slice(0, 3);
    return shuffle(andere.concat([ziel]));
  }
  function zeigeFrage() {
    var ziel = q.fragen[q.i];
    q.beantwortet = false;
    markiere(svg2, ziel.id);
    quizBox.textContent = '';
    quizBox.appendChild(el('p', 'fortschritt', 'Frage ' + (q.i + 1) + ' von ' + q.fragen.length));
    var h = el('h3', null, 'Wie heißt das markierte Teil?');
    h.tabIndex = -1;
    h.id = 'quiz-frage';
    quizBox.appendChild(h);
    var opt = el('div', 'optionen');
    optionenFuer(ziel).forEach(function (t) {
      var b = el('button', null, t.name);
      b.type = 'button';
      b.setAttribute('data-id', t.id);
      b.addEventListener('click', function () { antwort(t, ziel, opt); });
      opt.appendChild(b);
    });
    quizBox.appendChild(opt);
    var fb = el('div');
    fb.id = 'quiz-fb';
    quizBox.appendChild(fb);
  }
  function antwort(gewaehlt, ziel, opt) {
    if (q.beantwortet) return;
    q.beantwortet = true;
    var ok = gewaehlt.id === ziel.id;
    if (ok) q.richtig++; else q.falsch.push(ziel.name);
    Array.prototype.forEach.call(opt.querySelectorAll('button'), function (b) {
      var id = b.getAttribute('data-id');
      b.disabled = true;
      if (id === ziel.id) { b.classList.add('richtig'); b.textContent = 'Richtig: ' + b.textContent; }
      else if (id === gewaehlt.id) { b.classList.add('falsch'); b.textContent = 'Falsch: ' + b.textContent; }
    });
    var fb = document.getElementById('quiz-fb');
    var r = el('p', 'rueck ' + (ok ? 'ok' : 'nok'));
    r.appendChild(icon(ok ? 'ok' : 'nok'));
    r.appendChild(el('span', null, ok ? 'Richtig. Das ist ' + artikelName(ziel, true) + '.' : 'Nicht richtig. Das markierte Teil ist ' + artikelName(ziel, true) + '.'));
    fb.appendChild(r);
    fb.appendChild(el('p', null, ziel.text));
    var last = q.i === q.fragen.length - 1;
    var w = el('button', 'btn', last ? 'Ergebnis zeigen' : 'Weiter');
    w.type = 'button';
    w.addEventListener('click', function () {
      if (last) zeigeErgebnis(); else { q.i++; zeigeFrage(); document.getElementById('quiz-frage').focus(); }
    });
    fb.appendChild(w);
    w.focus();
  }
  function artikelName(t, mitArtikel) {
    var m = { 'hornhaut': 'die Hornhaut', 'lederhaut': 'die Lederhaut', 'aderhaut': 'die Aderhaut', 'iris': 'die Iris', 'pupille': 'die Pupille', 'linse': 'die Linse', 'ziliarmuskel': 'der Ziliarmuskel', 'glaskoerper': 'der Glaskörper', 'netzhaut': 'die Netzhaut', 'gelber-fleck': 'der Gelbe Fleck', 'blinder-fleck': 'der Blinde Fleck', 'sehnerv': 'der Sehnerv' };
    var voll = m[t.id];
    if (mitArtikel) return voll;
    return voll.replace(/^(die|der|das) /, '');
  }
  function zeigeErgebnis() {
    markiere(svg2, null);
    quizBox.textContent = '';
    var h = el('h3', null, 'Ergebnis: ' + q.richtig + ' von ' + q.fragen.length + ' richtig');
    h.tabIndex = -1;
    quizBox.appendChild(h);
    if (q.falsch.length) {
      quizBox.appendChild(el('p', null, 'Wiederhole diese Teile: ' + q.falsch.join(', ') + '.'));
    } else {
      quizBox.appendChild(el('p', null, 'Alle Teile richtig benannt.'));
    }
    var b = el('button', 'btn', 'Noch einmal');
    b.type = 'button';
    b.addEventListener('click', function () { neuesQuiz(); document.getElementById('quiz-frage').focus(); });
    quizBox.appendChild(b);
    h.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll('#umfang button'), function (b) {
    b.addEventListener('click', function () {
      umfang = b.getAttribute('data-umfang');
      Array.prototype.forEach.call(document.querySelectorAll('#umfang button'), function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      neuesQuiz();
    });
  });
  neuesQuiz();

  /* ---------- Aufgabe 3: Kamera-Vergleich ---------- */
  var KAMERA = [
    { kamera: 'Objektiv (bündelt das Licht)', richtig: ['linse', 'hornhaut'] },
    { kamera: 'Blende (regelt die Lichtmenge)', richtig: ['iris'] },
    { kamera: 'Sensor (nimmt das Bild auf)', richtig: ['netzhaut'] },
    { kamera: 'Gehäuse (hält die Form)', richtig: ['lederhaut'] },
    { kamera: 'Schwarze Innenwand (schluckt Streulicht)', richtig: ['aderhaut'] }
  ];
  var OPT_KAMERA = [
    ['hornhaut', 'Hornhaut'], ['iris', 'Iris mit Pupille'], ['linse', 'Linse'], ['glaskoerper', 'Glaskörper'],
    ['netzhaut', 'Netzhaut'], ['aderhaut', 'Aderhaut'], ['lederhaut', 'Lederhaut'], ['sehnerv', 'Sehnerv']
  ];
  var kbody = document.getElementById('kamera-body');
  KAMERA.forEach(function (k, i) {
    var tr = el('tr');
    var th = el('th', null, k.kamera);
    th.scope = 'row';
    var td = el('td');
    var sel = el('select');
    sel.id = 'kam-' + i;
    sel.setAttribute('aria-label', 'Teil des Auges für ' + k.kamera);
    var o0 = el('option', null, 'Bitte wählen');
    o0.value = '';
    sel.appendChild(o0);
    OPT_KAMERA.forEach(function (o) {
      var op = el('option', null, o[1]);
      op.value = o[0];
      sel.appendChild(op);
    });
    td.appendChild(sel);
    var td2 = el('td');
    td2.id = 'kam-fb-' + i;
    tr.appendChild(th); tr.appendChild(td); tr.appendChild(td2);
    kbody.appendChild(tr);
  });
  document.getElementById('kamera-pruefen').addEventListener('click', function () {
    var richtig = 0, offen = 0;
    KAMERA.forEach(function (k, i) {
      var v = document.getElementById('kam-' + i).value;
      var fb = document.getElementById('kam-fb-' + i);
      fb.textContent = '';
      if (!v) { offen++; fb.appendChild(el('span', null, 'Noch offen')); return; }
      var ok = k.richtig.indexOf(v) !== -1;
      if (ok) richtig++;
      var s = el('span', 'zeilen-rueck ' + (ok ? 'ok' : 'nok'));
      s.appendChild(icon(ok ? 'ok' : 'nok'));
      s.appendChild(el('span', null, ok ? 'Richtig' : 'Prüfe noch einmal'));
      fb.appendChild(s);
    });
    var sum = document.getElementById('kamera-summe');
    sum.textContent = richtig + ' von ' + KAMERA.length + ' richtig.' + (offen ? ' ' + offen + ' noch nicht beantwortet.' : '');
  });
})();
