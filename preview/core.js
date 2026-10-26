/* Independent original framework. No upstream implementation or assets. */
(function (root) {
  "use strict";
  const duration = 30;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function timeline(t, offset) {
    return clamp(t + offset, 0, duration);
  }
  function cellWidth(c) {
    const n = c.codePointAt(0);
    if (/\p{Mark}/u.test(c) || n === 0x200d || n === 0xfe0f) return 0;
    return n >= 0x1100 &&
      (n <= 0x115f ||
        n === 0x2329 ||
        n === 0x232a ||
        (n >= 0x2e80 && n <= 0xa4cf) ||
        (n >= 0xac00 && n <= 0xd7a3) ||
        (n >= 0xf900 && n <= 0xfaff) ||
        (n >= 0xfe10 && n <= 0xfe6f) ||
        (n >= 0xff01 && n <= 0xff60) ||
        (n >= 0xffe0 && n <= 0xffe6) ||
        n >= 0x1f300)
      ? 2
      : 1;
  }
  class Grid {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.cells = Array.from({ length: h }, () =>
        Array.from({ length: w }, () => [" ", 0]),
      );
    }
    put(x, y, s, color = 1) {
      x = Math.floor(x);
      y = Math.floor(y);
      if (y < 0 || y >= this.h) return;
      for (const ch of String(s)) {
        const k = cellWidth(ch);
        if (!k) continue;
        if (x >= 0 && x + k <= this.w) {
          for (let j = x; j < x + k; j++) {
            if (this.cells[y][j][0] === "" && j > 0)
              this.cells[y][j - 1] = [" ", 0];
            if (cellWidth(this.cells[y][j][0] || " ") === 2 && j + 1 < this.w)
              this.cells[y][j + 1] = [" ", 0];
          }
          this.cells[y][x] = [ch, color];
          if (k === 2) this.cells[y][x + 1] = ["", color];
        }
        x += k;
      }
    }
    center(y, s, color = 1) {
      this.put(
        Math.floor((this.w - [...s].reduce((a, c) => a + cellWidth(c), 0)) / 2),
        y,
        s,
        color,
      );
    }
  }
  const api = { duration, clamp, timeline, cellWidth, Grid };
  root.ASCII = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
