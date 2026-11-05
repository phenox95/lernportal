/* Eigene, einfache Linien-Symbole. Werden als Sprite in die Seite eingefügt,
   damit sie auch beim Öffnen aus dem Dateisystem (file://) funktionieren.
   Verwendung: <svg class="ic"><use href="#i-sun"/></svg> */
(function () {
  var S = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
    wind: '<path d="M3 8.5h9.5a2.7 2.7 0 1 0-2.6-3.4"/><path d="M3 12.5h14.5a2.9 2.9 0 1 1-2.8 3.6"/><path d="M3 16.5h6.5"/>',
    water: '<path d="M2.5 8.5c2.2 0 2.2-1.8 4.4-1.8s2.2 1.8 4.4 1.8 2.2-1.8 4.4-1.8 2.2 1.8 4.4 1.8"/><path d="M2.5 13c2.2 0 2.2-1.8 4.4-1.8s2.2 1.8 4.4 1.8 2.2-1.8 4.4-1.8 2.2 1.8 4.4 1.8"/><path d="M2.5 17.5c2.2 0 2.2-1.8 4.4-1.8s2.2 1.8 4.4 1.8 2.2-1.8 4.4-1.8 2.2 1.8 4.4 1.8"/>',
    leaf: '<path d="M5 19.5C4.5 10.5 10 5 20 4.5 20 14.5 14.5 20 5 19.5z"/><path d="M5 19.5c3-5 6-8 10-10.5"/>',
    mountain: '<path d="M2.5 20 9 8.5l3.6 6 2.4-3.5 6.5 9z"/>',
    flame: '<path d="M12 3c.8 3.7 5.2 5.4 5.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2 .9-3.3 2.1-4.4.1 1.7.9 2.7 1.9 3 .2-3-.5-5 1.2-8.8z"/>',
    play: '<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l10.8-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z" fill="currentColor" stroke="none"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6"/><circle cx="17.2" cy="9" r="2.5"/><path d="M16.4 14.3c2.9.2 4.8 2.3 4.8 5.2"/>',
    star: '<path d="m12 3.2 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/>',
    bulb: '<path d="M9.2 18h5.6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.8.7 1 1.5 1 2.4h5.6c0-.9.2-1.7 1-2.4A6 6 0 0 0 12 3z"/>',
    bolt: '<path d="m13.2 2.5-8.7 11.6h6.3l-1 7.4 8.7-11.6h-6.3z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>',
    speaker: '<path d="M4 9.5v5h3.6L13 19V5L7.6 9.5z"/><path d="M16.2 9.2c1.4 1.2 1.4 4.4 0 5.6M18.8 6.6c2.9 2.6 2.9 8.2 0 10.8"/>',
    question: '<path d="M9.2 9.2a2.9 2.9 0 1 1 4.1 2.6c-.9.5-1.3 1.1-1.3 2"/><path d="M12 17.6h.01"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m20 20-4.7-4.7"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    check: '<path d="m5 12.8 4.4 4.4L19 7.4"/>',
    cross: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    chevron: '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
    chevronl: '<path d="m15 5.5-6.5 6.5 6.5 6.5"/>',
    moon: '<path d="M20 14.3A8 8 0 1 1 9.7 4a6.4 6.4 0 0 0 10.3 10.3z"/>',
    external: '<path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4.2a1.3 1.3 0 0 1-1.3 1.3H5.8a1.3 1.3 0 0 1-1.3-1.3V7.3A1.3 1.3 0 0 1 5.8 6H10"/>',
    pencil: '<path d="M4 20l1-4.2L16.6 4.2a1.8 1.8 0 0 1 2.6 0l.6.6a1.8 1.8 0 0 1 0 2.6L8.2 19z"/><path d="m14.5 6.3 3.2 3.2"/>',
    home: '<path d="M4 11 12 4l8 7v8.5a.5.5 0 0 1-.5.5H14v-5.5h-4V20H4.5a.5.5 0 0 1-.5-.5z"/>',
    car: '<path d="M4 15.5 5.7 10a2 2 0 0 1 1.9-1.4h8.8a2 2 0 0 1 1.9 1.4L20 15.5"/><path d="M3.5 15.5h17V18h-17z"/><path d="M6.5 18v1.8M17.5 18v1.8"/><path d="M7.5 12.5h.01M16.5 12.5h.01"/>',
    download: '<path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 19.5h14"/>',
    file: '<path d="M6.5 3.5h7l4 4v12a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M13.5 3.5v4h4M9 12.500h6M9 16h6"/>'
  };
  var html = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">';
  Object.keys(S).forEach(function (k) {
    html += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + S[k] + '</symbol>';
  });
  html += '</svg>';
  function inject() { document.body.insertAdjacentHTML('afterbegin', html); }
  if (document.body) inject(); else document.addEventListener('DOMContentLoaded', inject);
  window.icon = function (name, cls) {
    return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  };
})();
