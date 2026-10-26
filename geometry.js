(function (R) {
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)),
    mix = (a, b, u) => a + (b - a) * u;
  const smooth = (a, b, t) => {
    const u = clamp((t - a) / (b - a));
    return u * u * (3 - 2 * u);
  };
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  function rotate(x, y, z, a, b) {
    let X = x * Math.cos(a) - z * Math.sin(a),
      Z = x * Math.sin(a) + z * Math.cos(a);
    return [
      X,
      y * Math.cos(b) - Z * Math.sin(b),
      y * Math.sin(b) + Z * Math.cos(b),
    ];
  }
  function project(x, y, z) {
    const d = 3.8 / (3.8 + z);
    return [x * d, y * d, d];
  }
  function point(g, x, y, ch = ".", c = 1, alpha = 1) {
    const X = Math.round((0.5 + x * 0.5) * g.w),
      Y = Math.round((0.5 + y * 0.5) * g.h);
    g.put(X, Y, ch, c);
    if (X >= 0 && X < g.w && Y >= 0 && Y < g.h) g.cells[Y][X][2] = clamp(alpha);
  }
  function line(g, x, y, X, Y, ch = ".", c = 1, alpha = 1) {
    const n = Math.ceil(Math.max(Math.abs(X - x) * g.w, Math.abs(Y - y) * g.h));
    for (let i = 0; i <= n; i++) {
      const u = n ? i / n : 0;
      point(g, mix(x, X, u), mix(y, Y, u), ch, c, alpha);
    }
  }
  R.Geo = { clamp, mix, smooth, hash, rotate, project, point, line };
})(globalThis);
