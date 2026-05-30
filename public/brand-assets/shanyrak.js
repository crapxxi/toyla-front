// shanyrak.js — authentic Kazakh shanyrak emblem (hoop + curved dome lattice + uyk spokes)
// Injects SVG into any element with [data-shanyrak]; colors via data-attrs.
(function () {
  function shanyrak({ hoop = "#261B11", lattice = "#A8492A", spoke = "#B0843A", knot = "#A8492A", spokes = 28, sw = 2 } = {}) {
    let s = `<svg viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">`;
    // uyk spokes
    s += `<g stroke="${spoke}" stroke-width="${sw * 0.82}">`;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2, r1 = 30.5, r2 = 41;
      s += `<line x1="${(50 + r1 * Math.cos(a)).toFixed(2)}" y1="${(50 + r1 * Math.sin(a)).toFixed(2)}" x2="${(50 + r2 * Math.cos(a)).toFixed(2)}" y2="${(50 + r2 * Math.sin(a)).toFixed(2)}"/>`;
    }
    s += `</g>`;
    // hoop — double ring
    s += `<circle cx="50" cy="50" r="30" stroke="${hoop}" stroke-width="${sw * 1.1}"/>`;
    s += `<circle cx="50" cy="50" r="27" stroke="${hoop}" stroke-width="${sw * 0.5}" opacity="0.5"/>`;
    // curved dome lattice (kúldreýish) clipped to inner circle
    const cid = "clip" + Math.random().toString(36).slice(2, 7);
    s += `<g stroke="${lattice}" stroke-width="${sw * 0.92}" clip-path="url(#${cid})">`;
    s += `<path d="M37,24 Q33,50 37,76"/><path d="M50,21 L50,79"/><path d="M63,24 Q67,50 63,76"/>`;
    s += `<path d="M24,37 Q50,33 76,37"/><path d="M21,50 L79,50"/><path d="M24,63 Q50,67 76,63"/>`;
    s += `</g>`;
    s += `<circle cx="50" cy="50" r="3.2" fill="${knot}" stroke="none"/>`;
    s += `<defs><clipPath id="${cid}"><circle cx="50" cy="50" r="27.5"/></clipPath></defs></svg>`;
    return s;
  }
  function render() {
    document.querySelectorAll("[data-shanyrak]").forEach((el) => {
      el.innerHTML = shanyrak({
        hoop: el.dataset.hoop, lattice: el.dataset.lattice, spoke: el.dataset.spoke,
        knot: el.dataset.knot || el.dataset.lattice,
        spokes: el.dataset.spokes ? +el.dataset.spokes : 28,
        sw: el.dataset.sw ? +el.dataset.sw : 2,
      });
    });
  }
  window.Shanyrak = shanyrak;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
