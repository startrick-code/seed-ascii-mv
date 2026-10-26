(function (R) {
  const { mix, smooth, hash, point: P, line: L, rotate, project } = Geo;
  const grid = (w, h) => new ASCII.Grid(w, h);
  function ring(g, t, r = 0.2, alpha = 1) {
    for (let i = 0; i < 110; i++) {
      const a = (i / 110) * Math.PI * 2;
      P(
        g,
        Math.cos(a) * r,
        Math.sin(a) * r * 1.6,
        "+*"[i % 2],
        i % 4 === 0 ? 3 : 1,
        alpha,
      );
    }
  }
  function boot(t, w, h, f, p) {
    const g = grid(w, h),
      u = smooth(1.3, 4.6, t);
    const commands = [
      "> wake /seed:0x17",
      "> allocate possibility",
      "> bind space :: time",
      "> core online",
    ];
    commands.forEach((s, i) => {
      const n = Math.max(0, Math.floor((t - 0.4 - i * 0.65) * 26));
      if (n) g.put(5, 3 + i, s.slice(0, n), i === 3 ? 1 : 2);
    });
    if (t < 1.8 && Math.floor(Math.max(0, t) * 4) % 2 === 0)
      g.center(Math.floor(h * 0.52), "_", 3);
    for (let i = 0; i < p.particles; i++) {
      const a = hash(i) * Math.PI * 2 + t * 0.14,
        r = mix(0.8 + hash(i + 400) * 0.5, 0.06 + hash(i + 800) * 0.13, u);
      P(
        g,
        Math.cos(a) * r,
        Math.sin(a) * r * 1.6,
        "01:+*"[i % 5],
        i % 6 === 0 ? 3 : 2,
        0.25 + 0.7 * u,
      );
    }
    ring(g, t, 0.12 + 0.012 * Math.sin(t * 4), smooth(2.8, 4, t));
    if (t > 3) g.center(Math.floor(h * 0.53), "[ * ]", 3);
    return g;
  }
  function creation(t, w, h, f) {
    const g = grid(w, h),
      u = smooth(-0.6, 2, t),
      rot = smooth(2, 5, t) * 0.45;
    ring(g, t, 0.12 * (1 - u), 1 - u);
    L(g, -0.82, 0, 0.82, 0, ".", 0, u);
    L(g, 0, -0.75, 0, 0.75, ":", 0, u);
    for (let k = 0; k < 3; k++)
      for (let i = 0; i < 270; i++) {
        const x = (i / 269) * 1.64 - 0.82,
          a = x * 5 + t * 0.9 + k * 2.094;
        const y = Math.sin(a) * (0.24 + 0.05 * k);
        const xx = x * Math.cos(rot) - y * Math.sin(rot),
          yy = x * Math.sin(rot) + y * Math.cos(rot);
        const start = hash(i + k * 270) * Math.PI * 2;
        P(
          g,
          mix(Math.cos(start) * 0.12, xx, u),
          mix(Math.sin(start) * 0.19, yy, u),
          " .:-=+*"[2 + k],
          k === 0 ? 1 : k === 1 ? 2 : 3,
          0.65 + 0.2 * Math.sin(i * 0.1 + t),
        );
      }
    for (let j = 0; j < 3; j++) {
      const r = 0.22 + j * 0.14;
      for (let i = 0; i < 90; i++) {
        const a = (i / 90) * Math.PI * 2 + t * 0.4;
        P(
          g,
          Math.cos(a) * r,
          Math.sin(a * 2 + t * 0.2) * r,
          "·".replace("·", "."),
          j === 1 ? 3 : 0,
          smooth(2, 4, t) * 0.7,
        );
      }
    }
    g.put(4, h - 4, "f(x) -> space", 2);
    return g;
  }
  function dimension(t, w, h, f, p) {
    const g = grid(w, h),
      enter = smooth(-0.8, 1.5, t),
      roll = 0.12 * Math.sin(t * 0.4),
      speed = t * 0.48;
    for (let j = p.frames - 1; j >= 0; j--) {
      let z = (((j * 0.58 - speed) % 9.28) + 9.28) % 9.28;
      const depth = 0.8 + z,
        scale = 1.6 / depth;
      const cx = 0.16 * Math.sin(z * 0.5 + t * 0.25),
        cy = 0.11 * Math.cos(z * 0.7 + t * 0.3);
      const corners = [
        [-1, -0.66],
        [1, -0.66],
        [1, 0.66],
        [-1, 0.66],
      ].map(([x, y]) => {
        const X = x * Math.cos(roll) - y * Math.sin(roll),
          Y = x * Math.sin(roll) + y * Math.cos(roll);
        return [X * scale + cx, Y * scale + cy];
      });
      const alpha =
        Math.min(1, 2 / depth) * enter * (0.88 + Math.min(0.12, f.rms * 0.3));
      for (let k = 0; k < 4; k++) {
        const a = corners[k],
          b = corners[(k + 1) % 4];
        L(
          g,
          ...a,
          ...b,
          j % 3 === 0 ? "+" : ".",
          j % 4 === 0 ? 3 : j % 2 ? 2 : 1,
          alpha,
        );
        if (j < 10) {
          const z2 = depth + 0.58,
            s2 = 1.6 / z2;
          L(
            g,
            ...a,
            (corners[k][0] * s2) / scale,
            (corners[k][1] * s2) / scale,
            ":",
            0,
            alpha * 0.5,
          );
        }
      }
      for (let k = 0; k < 6; k++)
        P(
          g,
          ((k / 5) * 2 - 1) * scale + cx,
          -0.66 * scale + cy,
          String((j + k) % 10),
          2,
          alpha,
        );
    }
    g.put(4, h - 4, "z / unbounded", 3);
    return g;
  }
  function lifePosition(i, t) {
    const a = (i / 84) * Math.PI * 2,
      grow = smooth(0, 5.5, t),
      r = 0.48 + 0.1 * Math.cos(a * 5 - t * 0.35);
    const nx = Math.cos(a) * r,
      ny = Math.sin(a) * r * 1.05;
    const q = rotate(
      Math.cos(a) * 0.65,
      Math.sin(a) * 0.48,
      Math.sin(a * 3) * 0.32,
      t * 0.08,
      0.3,
    );
    return [mix(q[0], nx, grow), mix(q[1], ny, grow)];
  }
  function life(t, w, h, f, p) {
    const g = grid(w, h),
      positions = Array.from({ length: p.nodes }, (_, i) => lifePosition(i, t));
    for (let i = 0; i < p.nodes; i++) {
      const a = positions[i];
      for (const step of [1, 7, 21]) {
        const j = (i + step) % p.nodes,
          b = positions[j],
          wave = (t * 0.8 - i / p.nodes + 3) % 1;
        L(
          g,
          ...a,
          ...b,
          step === 1 ? ":" : ".",
          wave < 0.09 ? 3 : step === 1 ? 2 : 0,
          step === 1 ? 0.8 : 0.22 + 0.15 * smooth(0, 4, t),
        );
      }
    }
    for (let i = 0; i < p.nodes; i++) {
      const a = positions[i],
        pulse = (t * 0.8 - i / p.nodes + 3) % 1;
      P(
        g,
        ...a,
        pulse < 0.1 ? "@" : "o",
        pulse < 0.1 ? 3 : 2,
        0.6 + 0.4 * Math.cos(i * 0.15 - t),
      );
    }
    // A growing fivefold seed / branching filament, not a figurative copied asset.
    for (let k = 0; k < 5; k++) {
      const angle = k * Math.PI * 0.4 + t * 0.07;
      for (let i = 0; i < 50; i++) {
        const r = (i / 50) * 0.44 * smooth(2, 5, t),
          a = angle + r * 3;
        P(g, Math.cos(a) * r, Math.sin(a) * r, "+*"[i % 2], 1, 0.85);
      }
    }
    ring(g, t, 0.07 + 0.012 * Math.sin(t * 3), smooth(3, 5, t));
    g.put(4, h - 4, "signal / becomes self", 2);
    return g;
  }
  function consciousness(t, w, h, f, p) {
    const g = grid(w, h),
      u = smooth(0.2, 2.6, t),
      fade = 1 - smooth(4.25, 5, t);
    for (let i = 0; i < p.fragments; i++) {
      const a = (i / p.fragments) * Math.PI * 2,
        r = 0.5 + 0.08 * Math.cos(a * 5),
        targetX = ((i % 15) - 7) * 0.018;
      const x = mix(Math.cos(a) * r, targetX, u),
        y = mix(Math.sin(a) * r, 0, u);
      const glitch =
        t < 1.6 && hash(Math.floor(t * 12) + Math.floor(i / 12)) > 0.72;
      P(
        g,
        x + (glitch ? 0.09 : 0),
        y,
        "01/+=*"[i % 6],
        i % 3 === 0 ? 3 : 2,
        (1 - u) * fade,
      );
    }
    const text = "AWAITING INPUT",
      reveal = smooth(1.7, 3.1, t);
    const n = Math.floor(text.length * reveal);
    g.center(
      Math.floor(h * 0.5),
      text.slice(0, n) + (Math.floor(t * 2) % 2 === 0 ? "_" : " "),
      1,
    );
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        g.cells[y][x][2] = (g.cells[y][x][2] ?? 1) * fade;
      }
    if (t < 2)
      for (let i = 0; i < 4; i++) {
        const y = Math.floor(hash(i + Math.floor(t * 10)) * h);
        if (hash(i + t) > 0.6)
          g.put(Math.floor(w * 0.2), y, "--:: / REASSEMBLE / ::--", 0);
      }
    return g;
  }
  R.Scenes = { boot, creation, dimension, life, consciousness };
})(globalThis);
