const boxBreathingClock = function (p) {
  const canvasSize = 800;
  const duration = 4000;
  const labels = ["Breathe in", "Hold", "Breathe out", "Hold"];
  const colors = [
    p => p.color(56,127,117),   // top
    p => p.color(123,188,182),  // right
    p => p.color(152,228,217),  // bottom
    p => p.color(168,189,191),  // left
  ];

  let phase = 0, startTime = 0, progress = 0;

  p.setup = function () {
    p.createCanvas(p.min(p.windowWidth, canvasSize), p.min(p.windowHeight, canvasSize));
    p.textFont("Arial"); p.textAlign(p.CENTER, p.CENTER);
    startTime = p.millis();
  };

  p.draw = function () {
    p.background(8, 12, 18);

    // timing
    const elapsed = p.millis() - startTime;
    progress = p.constrain(elapsed / duration, 0, 1);
    if (progress >= 1) { phase = (phase + 1) % 4; startTime = p.millis(); }

    // geometry
    const margin = p.width * 0.12;
    const cx = p.width/2, cy = p.height/2;
    const x1 = margin, y1 = margin;
    const x2 = p.width - margin, y2 = p.height - margin;

    // draw only the ACTIVE edge (avoid future edges showing up)
    p.noFill();
    p.strokeWeight(8);
    p.stroke(colors[phase](p));

    const t = progress; // 0..1 shrinking
    switch (phase) {
      case 0: // top: left->right, shrink from left towards right
        p.line(p.lerp(x1, x2, t), y1, x2, y1);
        break;
      case 1: // right: top->bottom
        p.line(x2, p.lerp(y1, y2, t), x2, y2);
        break;
      case 2: // bottom: right->left
        p.line(x1, y2, p.lerp(x2, x1, t), y2);
        break;
      case 3: // left: bottom->top
        p.line(x1, y1, x1, p.lerp(y2, y1, t));
        break;
    }

    // label + countdown
    p.fill(240);
    p.textSize(p.width * 0.06);
    p.text(labels[phase], p.width / 2, y1 - p.width * 0.02);
    p.textSize(p.width * 0.12);
    p.text(Math.ceil(4 - t * 4), p.width / 2, cy + p.width * 0.02);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.min(p.windowWidth, canvasSize), p.min(p.windowHeight, canvasSize));
  };
};
new p5(boxBreathingClock);
