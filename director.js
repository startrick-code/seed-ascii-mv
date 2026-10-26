(function (R) {
  // Editable, original director timeline. Seconds on the animation clock.
  const timeline = [
    {
      id: "boot",
      name: "SYSTEM BOOT",
      start: 0,
      end: 5,
      transition: 0.65,
      params: { particles: 180 },
      keys: [0, 0.8, 2.5, 4.5],
    },
    {
      id: "creation",
      name: "MATHEMATICAL CREATION",
      start: 5,
      end: 11,
      transition: 0.8,
      params: { curves: 3 },
      keys: [5, 6.5, 9, 10.5],
    },
    {
      id: "dimension",
      name: "DATA DIMENSION",
      start: 11,
      end: 18,
      transition: 0.8,
      params: { frames: 16 },
      keys: [11, 13, 16, 17.5],
    },
    {
      id: "life",
      name: "EMERGENT LIFE",
      start: 18,
      end: 25,
      transition: 0.8,
      params: { nodes: 84 },
      keys: [18, 20, 22.5, 24.5],
    },
    {
      id: "consciousness",
      name: "CONSCIOUSNESS",
      start: 25,
      end: 30,
      transition: 0,
      params: { fragments: 180 },
      keys: [25, 26, 27.7, 29.2, 30],
    },
  ];
  function scene(t) {
    return timeline.find((s) => t < s.end) || timeline[4];
  }
  function render(t, w, h, features = { bass: 0, rms: 0 }) {
    t = Geo.clamp(t, 0, 30);
    const s = scene(t),
      a = Scenes[s.id](t - s.start, w, h, features, s.params);
    const next = timeline[timeline.indexOf(s) + 1];
    if (next && t > s.end - s.transition) {
      const u = Geo.smooth(s.end - s.transition, s.end, t),
        b = Scenes[next.id](t - next.start, w, h, features, next.params);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const ac = a.cells[y][x],
            bc = b.cells[y][x];
          if (bc[0] !== " " && Geo.hash(x + y * w) < u) a.cells[y][x] = bc;
          else ac[2] = (ac[2] ?? 1) * (1 - u);
        }
    }
    return a;
  }
  R.Director = { timeline, scene, render };
})(globalThis);
