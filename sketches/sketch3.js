// Instance-mode sketch for tab 3 - Lunar Lotus Clock
registerSketch('sk3', function (p) {
  let canvasSize = 800;
  let lotusCenter;
  
  p.setup = function () {
    p.createCanvas(canvasSize, canvasSize);
    lotusCenter = p.createVector(canvasSize / 2, canvasSize / 2);
  };
  
  p.draw = function () {
    // Get current time
    let h = p.hour() % 12;
    let m = p.minute();
    let s = p.second();
    
    // Draw background
    drawBackground();
    
    // Draw lotus center only
    p.push();
    p.translate(lotusCenter.x, lotusCenter.y);
    drawLotusCenter();
    p.pop();
    
    // Draw time display
    drawTimeDisplay(h, m, s);
  };
  
  function drawBackground() {
    // Deep blue to purple gradient
    for (let y = 0; y < canvasSize; y++) {
      let inter = p.map(y, 0, canvasSize, 0, 1);
      let c = p.lerpColor(
        p.color(15, 20, 45),
        p.color(30, 20, 60),
        inter
      );
      p.stroke(c);
      p.line(0, y, canvasSize, y);
    }
  }
  
  function drawLotusCenter() {
    let centerSize = 60;
    
    // Center
    p.noStroke();
    p.fill(255, 215, 0);
    p.ellipse(0, 0, centerSize, centerSize);
    
    // Inner detail
    p.fill(220, 180, 0);
    p.ellipse(0, 0, centerSize * 0.6, centerSize * 0.6);
  }
  
  function drawTimeDisplay(h, m, s) {
    // Time display
    p.fill(255, 255, 255, 150);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.text(`${p.nf(h === 0 ? 12 : h, 2)}:${p.nf(m, 2)}:${p.nf(s, 2)}`, canvasSize / 2, canvasSize - 35);
  }
  
  p.windowResized = function () { 
    // Keep canvas at fixed size
  };
});