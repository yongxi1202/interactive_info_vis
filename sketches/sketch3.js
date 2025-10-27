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
    
    // Draw moon clock (shows hours)
    drawMoonClock(h, s);
    
    // Draw lotus with 60 petals
    let remainingPetals = 60 - m;
    
    p.push();
    p.translate(lotusCenter.x, lotusCenter.y);
    
    // Draw petals
    drawPetals(remainingPetals);
    
    // Draw lotus center
    drawLotusCenter(remainingPetals);
    
    p.pop();
    
    // Draw time display
    drawTimeDisplay(h, m, s, remainingPetals);
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
  
  function drawMoonClock(hour, second) {
    let moonX = canvasSize * 0.8;
    let moonY = canvasSize * 0.2;
    let moonSize = 120;
    
    p.push();
    p.translate(moonX, moonY);
    
    // Moon body
    p.noStroke();
    p.fill(245, 242, 220);
    p.ellipse(0, 0, moonSize, moonSize);
    
    // Draw 12 hour marks
    p.stroke(100, 100, 120);
    p.strokeWeight(2);
    for (let i = 0; i < 12; i++) {
      let angle = p.map(i, 0, 12, 0, p.TWO_PI) - p.HALF_PI;
      let x1 = p.cos(angle) * (moonSize * 0.4);
      let y1 = p.sin(angle) * (moonSize * 0.4);
      let x2 = p.cos(angle) * (moonSize * 0.48);
      let y2 = p.sin(angle) * (moonSize * 0.48);
      
      // Highlight current hour
      if (i === hour) {
        p.strokeWeight(4);
        p.stroke(255, 200, 100);
      } else {
        p.strokeWeight(2);
        p.stroke(100, 100, 120);
      }
      p.line(x1, y1, x2, y2);
    }
    
    // Draw hour hand
    let hourAngle = p.map(hour, 0, 12, 0, p.TWO_PI) - p.HALF_PI;
    // Add smooth second movement
    hourAngle += p.map(second, 0, 60, 0, p.TWO_PI / 12);
    
    p.stroke(255, 200, 100);
    p.strokeWeight(3);
    let handLength = moonSize * 0.3;
    let handX = p.cos(hourAngle) * handLength;
    let handY = p.sin(hourAngle) * handLength;
    p.line(0, 0, handX, handY);
    
    // Center dot
    p.noStroke();
    p.fill(255, 200, 100);
    p.ellipse(0, 0, 8, 8);
    
    p.pop();
  }
  
  function drawPetals(remainingPetals) {
    let totalPetals = 60;
    let baseRadius = 180;
    
    // Draw remaining petals
    for (let i = 0; i < remainingPetals; i++) {
      let angle = p.map(i, 0, totalPetals, 0, p.TWO_PI) - p.HALF_PI;
      
      // Calculate petal position
      let petalX = p.cos(angle) * baseRadius;
      let petalY = p.sin(angle) * baseRadius;
      
      // Draw petal
      drawPetal(petalX, petalY, angle, i, totalPetals);
    }
  }
  
  function drawPetal(x, y, angle, index, total) {
    p.push();
    p.translate(x, y);
    p.rotate(angle + p.HALF_PI);
    
    // Petal color - gradient from outer to inner
    let hue = p.map(index, 0, total, 0, 30);
    let petalColor = p.color(255 - hue, 182 - hue, 193 - hue);
    
    // Draw petal with gradient effect
    p.noStroke();
    for (let i = 0; i < 5; i++) {
      let alpha = p.map(i, 0, 5, 200, 100);
      let size = p.map(i, 0, 5, 1, 0.6);
      p.fill(p.red(petalColor), p.green(petalColor), p.blue(petalColor), alpha);
      p.ellipse(0, 0, 25 * size, 40 * size);
    }
    
    // Petal outline
    p.noFill();
    p.stroke(255, 150, 170, 150);
    p.strokeWeight(1);
    p.ellipse(0, 0, 25, 40);
    
    // Petal vein
    p.stroke(255, 150, 170, 100);
    p.line(0, -20, 0, 20);
    
    p.pop();
  }
  
  function drawLotusCenter(remaining) {
    // Center size based on remaining petals
    let centerSize = p.map(remaining, 60, 0, 60, 30);
    
    // Center
    p.noStroke();
    p.fill(255, 215, 0);
    p.ellipse(0, 0, centerSize, centerSize);
    
    // Inner detail
    p.fill(220, 180, 0);
    p.ellipse(0, 0, centerSize * 0.6, centerSize * 0.6);
    
    // Stamens around center
    let stamenCount = 16;
    for (let i = 0; i < stamenCount; i++) {
      let angle = p.TWO_PI * i / stamenCount;
      let stamenLength = centerSize * 0.5;
      let x = p.cos(angle) * stamenLength;
      let y = p.sin(angle) * stamenLength;
      
      p.stroke(200, 150, 0);
      p.strokeWeight(1.5);
      p.line(0, 0, x, y);
      
      p.noStroke();
      p.fill(255, 200, 50);
      p.ellipse(x, y, 4, 4);
    }
  }
  
  function drawTimeDisplay(h, m, s, remaining) {
    // Display remaining petals
    p.fill(255, 255, 255, 150);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
    p.text(`${remaining} petals remaining`, canvasSize / 2, canvasSize - 60);
    
    // Time display
    p.textSize(14);
    p.fill(255, 255, 255, 120);
    p.text(`${p.nf(h === 0 ? 12 : h, 2)}:${p.nf(m, 2)}:${p.nf(s, 2)}`, canvasSize / 2, canvasSize - 35);
  }
  
  p.windowResized = function () { 
    // Keep canvas at fixed size
  };
});