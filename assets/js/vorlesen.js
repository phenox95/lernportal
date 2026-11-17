/* Lernportal – Vorlesen (Prototyp).
   Vorlesen ist die wirksamste Hilfe bei LRS (siehe Planungsvorgaben, Abschnitt 12.3). Dieser Baustein liest Text im Browser
   vor und färbt das gerade gesprochene Wort ein. Es wird nichts übertragen: nur Stimmen, die auf dem Gerät liegen
   (voice.localService), werden gewählt. Gibt es keine, bleibt der Knopf weg, nichts bricht.

   Einbinden: <script src=".../assets/js/vorlesen.js" defer></script>. Dann bekommt jedes Element mit data-vorlesen einen Knopf „Vorlesen“.
   Beispiel: <div class="material" data-vorlesen>…Text…</div>   oder   <p data-vorlesen="Satz">…</p> (Satz für Satz statt Wort für Wort).
   Von Hand: window.LPVorlesen.start(element), window.LPVorlesen.stopp().
   Bedienung: Vorlesen/Pause, Tempo (langsam, normal, schnell). Das Tempo bleibt im Browser gemerkt (nur auf dem Gerät).
   Hervorhebung: nur Hintergrundfarbe auf dem Wort (kein Fettdruck, kein Text über Bildern). Der Text bleibt echter Text. */
(function () {
  "use strict";
  var synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;

  var TEMPO = { langsam: 0.75, normal: 0.95, schnell: 1.2 };
  var tempo = "normal";
  try { tempo = localStorage.getItem("lp-vorlesen-tempo") || "normal"; } catch (e) { /* ohne Speicher */ }
  if (!TEMPO[tempo]) tempo = "normal";

  var stimme = null;
  function stimmeWaehlen() {
    var v = synth.getVoices() || [];
    var de = v.filter(function (x) { return /^de(-|_|$)/i.test(x.lang); });
    var lokal = de.filter(function (x) { return x.localService; });
    stimme = lokal[0] || null; /* nur lokale Stimmen: sonst könnte das Gerät den Text an einen Dienst senden */
    return !!stimme;
  }
  stimmeWaehlen();
  if (synth.addEventListener) synth.addEventListener("voiceschanged", function () { stimmeWaehlen(); ergaenzen(); });

  var css = document.createElement("style");
  css.textContent =
    ".lp-vl-leiste{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 8px}" +
    ".lp-vl-leiste button{font:inherit;font-weight:700;font-size:16px;min-height:44px;padding:6px 16px;border-radius:12px;border:2px solid currentColor;background:transparent;color:inherit;cursor:pointer}" +
    ".lp-vl-leiste button[aria-pressed=true]{background:#1A2B24;color:#fff;border-color:#1A2B24}" +
    ".lp-vl-w.lp-vl-jetzt{background:#F4B400;color:#1A2B24;border-radius:4px;box-shadow:0 0 0 2px #F4B400}" +
    "@media (forced-colors:active){.lp-vl-w.lp-vl-jetzt{outline:2px solid Highlight}}";
  document.head.appendChild(css);

  var aktiv = null; /* { wurzel, woerter[], i, utter, pause } */

  function woerterBauen(wurzel) {
    if (wurzel.__vlWoerter) return wurzel.__vlWoerter;
    var liste = [];
    var w = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (p.closest(".lp-vl-leiste,script,style,[aria-hidden=true],.lp-vl-aus")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var knoten = [], n; while ((n = w.nextNode())) knoten.push(n);
    knoten.forEach(function (t) {
      var teile = t.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
      teile.forEach(function (s) {
        if (!s) return;
        if (/^\s+$/.test(s)) { frag.appendChild(document.createTextNode(s)); return; }
        var sp = document.createElement("span"); sp.className = "lp-vl-w"; sp.textContent = s; frag.appendChild(sp); liste.push(sp);
      });
      t.parentNode.replaceChild(frag, t);
    });
    wurzel.__vlWoerter = liste;
    return liste;
  }

  function aus() { if (aktiv) aktiv.woerter.forEach(function (w) { w.classList.remove("lp-vl-jetzt"); }); }

  function stopp() {
    synth.cancel();
    if (aktiv) { aus(); aktiv.wurzel.__vlKnopf && aktiv.wurzel.__vlKnopf(false); }
    aktiv = null;
  }

  function start(wurzel, ab) {
    stopp();
    var woerter = woerterBauen(wurzel);
    if (!woerter.length) return;
    var i0 = ab || 0, text = "", starts = [];
    for (var i = i0; i < woerter.length; i++) { starts.push(text.length); text += woerter[i].textContent + " "; }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE"; if (stimme) u.voice = stimme; u.rate = TEMPO[tempo];
    aktiv = { wurzel: wurzel, woerter: woerter, utter: u };
    u.onboundary = function (e) {
      if (e.name && e.name !== "word") return;
      var k = 0; while (k + 1 < starts.length && starts[k + 1] <= e.charIndex) k++;
      aus(); var w = woerter[i0 + k]; if (w) { w.classList.add("lp-vl-jetzt"); try { w.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (x) { /* alt */ } }
    };
    u.onend = u.onerror = function () { if (aktiv && aktiv.utter === u) { aus(); wurzel.__vlKnopf && wurzel.__vlKnopf(false); aktiv = null; } };
    wurzel.__vlKnopf && wurzel.__vlKnopf(true);
    synth.speak(u);
  }

  function leiste(wurzel) {
    if (wurzel.__vlDa) return; wurzel.__vlDa = true;
    var l = document.createElement("div"); l.className = "lp-vl-leiste";
    var kn = document.createElement("button"); kn.type = "button"; kn.setAttribute("aria-pressed", "false"); kn.textContent = "🔊 Vorlesen";
    var pa = document.createElement("button"); pa.type = "button"; pa.textContent = "Pause"; pa.hidden = true;
    var te = document.createElement("button"); te.type = "button"; te.textContent = "Tempo: " + tempo; te.setAttribute("aria-label", "Sprechtempo wechseln");
    l.appendChild(kn); l.appendChild(pa); l.appendChild(te);
    wurzel.insertBefore(l, wurzel.firstChild);
    wurzel.__vlKnopf = function (an) { kn.setAttribute("aria-pressed", String(an)); kn.textContent = an ? "■ Stopp" : "🔊 Vorlesen"; pa.hidden = !an; pa.textContent = "Pause"; };
    kn.onclick = function () { if (aktiv && aktiv.wurzel === wurzel) stopp(); else start(wurzel); };
    pa.onclick = function () { if (synth.paused) { synth.resume(); pa.textContent = "Pause"; } else { synth.pause(); pa.textContent = "Weiter"; } };
    te.onclick = function () {
      var k = Object.keys(TEMPO); tempo = k[(k.indexOf(tempo) + 1) % k.length]; te.textContent = "Tempo: " + tempo;
      try { localStorage.setItem("lp-vorlesen-tempo", tempo); } catch (e) { /* ohne Speicher */ }
      if (aktiv && aktiv.wurzel === wurzel) start(wurzel);
    };
    /* Ein Wort antippen: ab hier vorlesen (hilft beim Wiederholen einer Stelle) */
    wurzel.addEventListener("click", function (e) {
      var w = e.target.closest && e.target.closest(".lp-vl-w"); if (!w || !aktiv || aktiv.wurzel !== wurzel) return;
      start(wurzel, woerterBauen(wurzel).indexOf(w));
    });
  }

  function ergaenzen() {
    if (!stimme && !stimmeWaehlen()) return; /* keine lokale deutsche Stimme: kein Knopf */
    [].forEach.call(document.querySelectorAll("[data-vorlesen]"), leiste);
  }
  window.LPVorlesen = { start: start, stopp: stopp, verfuegbar: function () { return !!stimme; } };
  window.addEventListener("pagehide", function () { synth.cancel(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ergaenzen); else ergaenzen();
})();
