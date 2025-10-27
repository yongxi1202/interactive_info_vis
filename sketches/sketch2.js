const boxBreathingClock = function (p) {
  const canvasSize = 800;
  const duration = 4000; // 4s per phase
  const totalPhases = 4;
  const labels = ["Breathe in", "Hold", "Breathe out", "Hold"];

  let phase = 0;       // 0..3
  let startTime = 0;   // ms
  let progress = 0;    // 0..1 within a phase

  p.setup = function () {
    p.createCanvas(p.min(p.windowWidth, canvasSize), p.min(p.windowHeight, canvasSize));
    p.textFont("Arial");
    p.textAlign(p.CENTER, p.CENTER);
    startTime = p.millis();
  };

  p.draw = function () {
    p.background(8, 12, 18);

    // phase timing
    const elapsed = p.millis() - startTime;
    progress = p.constrain(elapsed / duration, 0, 1);
    if (progress >= 1) {
      phase = (phase + 1) % totalPhases;
      startTime = p.millis();
      progress = 0;
    }

    // label + countdown
    p.fill(240);
    p.textSize(p.width * 0.06);
    p.text(labels[phase], p.width / 2, p.height / 2 - p.width * 0.08);

    p.textSize(p.width * 0.12);
    p.text(Math.ceil(4 - progress * 4), p.width / 2, p.height / 2 + p.width * 0.02);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.min(p.windowWidth, canvasSize), p.min(p.windowHeight, canvasSize));
  };
};
new p5(boxBreathingClock);
