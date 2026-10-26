const assert = require("node:assert/strict");
require("../core.js");
require("../geometry.js");
require("../scenes.js");
require("../director.js");
const A = ASCII;
assert.equal(A.cellWidth("中"), 2);
assert.equal(A.cellWidth("a"), 1);
assert.equal(A.cellWidth("\u0301"), 0);
assert.equal(A.timeline(12, 1.5), 13.5);
const count = (g) => g.cells.flat().filter((c) => c[0].trim()).length;
for (const [w, h] of [
  [80, 30],
  [100, 36],
  [128, 44],
]) {
  for (const t of [
    0, 0.5, 2.5, 4.99, 5, 8, 10.99, 11, 12, 14.5, 17.99, 18, 20, 21.5, 24.99,
    25, 27.5, 28, 29, 30,
  ]) {
    const g = Director.render(t, w, h);
    assert.equal(g.cells.length, h);
    assert(g.cells.every((r) => r.length === w));
    if (t < 29.8) assert(count(g) > 0, `blank ${t}`);
    for (const c of g.cells.flat()) {
      assert(Number.isFinite(c[1]));
      if (c[2] !== undefined) assert(Number.isFinite(c[2]));
    }
  }
  for (const t of [4.99, 5, 10.99, 11, 17.99, 18, 24.99, 25])
    assert(count(Director.render(t, w, h)) > 20);
}
assert.equal(Director.scene(12).id, "dimension");
assert.equal(Director.scene(20).id, "life");
assert.equal(Director.scene(28).id, "consciousness");
const before = Director.render(12, 100, 36);
for (const t of [28, 0, 20, 4, 29, 8]) Director.render(t, 100, 36);
assert.deepEqual(before, Director.render(12, 100, 36));
for (const t of [1, 7, 12, 20, 26])
  assert.notDeepEqual(
    Director.render(t, 100, 36),
    Director.render(t + 0.3, 100, 36),
  );
for (let i = 0; i <= 900; i++) Director.render(i / 30, 80, 30);
console.log(
  "PASS: widths; 3 grids × 20 key times; nonblank boundaries; direct 12/20/28s routing; seek determinism; all 5 scenes move; 901 full-timeline samples.",
);
