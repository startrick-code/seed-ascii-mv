"use strict";
const $ = (id) => document.getElementById(id),
  a = $("audio"),
  canvas = $("screen"),
  ctx = canvas.getContext("2d");
let sourceURL = "",
  scrubbing = false,
  resume = false,
  lastKey = "",
  needsResize = true,
  isDemo = false;
const palette = ["#526343", "#e6bf72", "#7bbd83", "#91d9cb"];
const analysis = new AudioAnalysis(a);
let lastRender = -1000,
  frames = 0,
  fps = 0,
  fpsSince = 0;
const previewEnd = () =>
  Math.min(30, Number.isFinite(a.duration) ? a.duration : 30);

const status = (s) => ($("status").textContent = s);
function duration() {
  return Number.isFinite(a.duration) ? Math.min(30, a.duration) : 0;
}
function seek(t) {
  if (!duration()) return;
  a.currentTime = ASCII.clamp(t, 0, duration());
  lastKey = "";
}
async function play() {
  if (!a.src) {
    status("请先加载本地音频或原创测试音频");
    return;
  }
  try {
    if (a.ended || a.currentTime >= previewEnd() - 0.02) seek(0);
    const unlocked = analysis.unlock();
    const playing = a.play();
    await playing;
    await unlocked;
    if (analysis.failed)
      status("音频分析不可用，时间轴动画继续；可关闭音频响应。");
  } catch (e) {
    status(
      "播放未启动，请再次点击播放；也可换用 Safari 支持的 MP3 / AAC / WAV。",
    );
  }
}
$("play").onclick = () => (a.paused ? play() : a.pause());
function load(blob, demo) {
  a.pause();
  a.removeAttribute("src");
  a.load();
  if (sourceURL) URL.revokeObjectURL(sourceURL);
  sourceURL = URL.createObjectURL(blob);
  a.src = sourceURL;
  isDemo = demo;
  analysis.reset();
  a.load();
  status(
    demo
      ? "原创 30 秒测试音轨已加载，点击播放"
      : "本地音频已加载 · 30 秒原创 MV，导演时间轴尚未针对歌曲校准",
  );
  lastKey = "";
}
$("file").onchange = (e) => {
  if (e.target.files[0]) load(e.target.files[0], false);
};
// Original synthesized arpeggio, pad and pulse; no third-party music.
$("demo").onclick = () => {
  const rate = 22050,
    n = Math.ceil(ASCII.duration * rate),
    buffer = new ArrayBuffer(44 + n * 2),
    v = new DataView(buffer);
  function str(p, s) {
    for (let i = 0; i < s.length; i++) v.setUint8(p + i, s.charCodeAt(i));
  }
  str(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, n * 2, true);
  const notes = [130.81, 164.81, 196, 261.63, 220, 196, 164.81, 146.83];
  for (let i = 0; i < n; i++) {
    const t = i / rate,
      beat = t % 0.5,
      note = notes[Math.floor(t * 2) % notes.length],
      env = Math.exp(-beat * 8) * Math.min(1, beat * 150);
    const pad = Math.sin(2 * Math.PI * 65.405 * t) * 0.12;
    const bell =
      (Math.sin(2 * Math.PI * note * t) +
        0.3 * Math.sin(2 * Math.PI * note * 2 * t)) *
      env *
      0.25;
    const pulse =
      Math.sin(
        2 * Math.PI * (55 * (t % 0.5) + 4 * (1 - Math.exp(-(t % 0.5) * 20))),
      ) *
      Math.exp(-(t % 0.5) * 23) *
      0.24;
    const fade = Math.min(1, t * 2, (30 - t) * 2);
    v.setInt16(
      44 + i * 2,
      Math.max(-1, Math.min(1, (pad + bell + pulse) * fade)) * 24000,
      true,
    );
  }
  load(new Blob([buffer], { type: "audio/wav" }), true);
};
$("restart").onclick = () => seek(0);
$("hideControls").onclick = () => {
  document.body.classList.add("immersive");
  $("showControls").hidden = false;
};
$("showControls").onclick = () => {
  document.body.classList.remove("immersive");
  $("showControls").hidden = true;
};
$("reactive").onchange = () => {
  analysis.enabled = $("reactive").checked;
  lastKey = "";
};
$("debugToggle").onchange = () => {
  $("debug").hidden = !$("debugToggle").checked;
};
a.addEventListener("seeking", () => {
  analysis.reset();
  lastKey = "";
});
$("back").onclick = () => seek(a.currentTime - 5);
$("forward").onclick = () => seek(a.currentTime + 5);
$("chapter").onchange = (e) =>
  seek(Number(e.target.value) - Number($("offset").value || 0));
$("grid").onchange = () => {
  needsResize = true;
};
$("offset").oninput = () => {
  lastKey = "";
};
function beginScrub() {
  if (scrubbing) return;
  scrubbing = true;
  resume = !a.paused;
  a.pause();
}
$("seek").oninput = () => {
  beginScrub();
  seek(Number($("seek").value));
};
function finishScrub() {
  if (!scrubbing) return;
  scrubbing = false;
  if (resume) play();
  resume = false;
}
$("seek").onchange = finishScrub;
$("seek").addEventListener("pointerup", finishScrub);
$("seek").addEventListener("pointercancel", finishScrub);
for (const ev of ["play", "pause", "ended"])
  a.addEventListener(ev, () => {
    $("play").textContent = a.paused ? "播放" : "暂停";
    lastKey = "";
  });
a.addEventListener("loadedmetadata", () => {
  $("seek").max = duration();
  lastKey = "";
});
a.addEventListener("error", () =>
  status("音频读取失败，请选择 Safari 支持的 MP3 / AAC / WAV 文件。"),
);
$("fullscreen").onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen)
      await document.documentElement.requestFullscreen();
    else status("此 Safari 不支持网页全屏，可通过“添加到主屏幕”打开。");
  } catch (e) {
    status("无法进入全屏，可使用 Safari“添加到主屏幕”。");
  }
};
new ResizeObserver(() => {
  needsResize = true;
}).observe($("stage"));
document.addEventListener("visibilitychange", () => {
  needsResize = true;
  lastKey = "";
});
document.addEventListener("keydown", (e) => {
  if (/INPUT|SELECT|BUTTON/.test(e.target.tagName)) return;
  if (e.code === "Space") {
    e.preventDefault();
    $("play").click();
  }
  if (e.code === "ArrowRight") seek(a.currentTime + 5);
  if (e.code === "ArrowLeft") seek(a.currentTime - 5);
});
function stamp(t) {
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${(t % 60).toFixed(1).padStart(4, "0")}`;
}
function loop(now) {
  if (a.currentTime >= previewEnd() && !a.paused) {
    a.pause();
    a.currentTime = previewEnd();
  }
  const [w, h] = $("grid").value.split(",").map(Number),
    t = ASCII.timeline(a.currentTime, Number($("offset").value) || 0),
    key = `${t.toFixed(4)},${w},${h},${$("reactive").checked}`;
  if (needsResize) {
    const r = $("stage").getBoundingClientRect(),
      ratio = 16 / 9;
    const width = Math.min(r.width, r.height * ratio),
      height = width / ratio,
      dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    needsResize = false;
    lastKey = "";
  }
  if (
    key !== lastKey &&
    now - lastRender >= 1000 / Number($("quality").value) - 1
  ) {
    lastRender =
      now - ((now - lastRender) % (1000 / Number($("quality").value)));
    const features = analysis.sample();
    const g = Director.render(t, w, h, features),
      cw = canvas.width / w,
      ch = canvas.height / h;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${Math.min(ch * 0.94, cw * 1.65)}px ui-monospace, Menlo, monospace`;
    ctx.textBaseline = "middle";
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const [char, color, alpha = 1] = g.cells[y][x];
        if (char && char !== " " && alpha > 0.01) {
          ctx.globalAlpha = Math.min(
            1,
            alpha *
              (0.93 + 0.07 * Math.cos(y * 0.8 - t * 2)) *
              (1 + Math.min(0.06, features.rms * 0.2)),
          );
          ctx.fillStyle = palette[color];
          ctx.fillText(
            char,
            x * cw,
            (y + 0.5) * ch,
            cw * ASCII.cellWidth(char),
          );
        }
      }
    ctx.globalAlpha = 1;
    lastKey = key;
    frames++;
  }
  if (now - fpsSince > 1000) {
    fps = Math.round((frames * 1000) / (now - fpsSince));
    frames = 0;
    fpsSince = now;
  }
  canvas.dataset.scene = Director.scene(t).id;
  canvas.dataset.time = t.toFixed(3);
  $("debug").textContent =
    `${Director.scene(t).name} | ${t.toFixed(2)}s | ${fps} FPS | ${analysis.analyser && !analysis.failed ? "FFT ready" : "FFT off"}`;
  if (!scrubbing) $("seek").value = a.currentTime;
  $("time").textContent = stamp(a.currentTime) + " / " + stamp(previewEnd());
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
