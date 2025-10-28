// Breathing Moon Clock
registerSketch('sk4', function (p) {
  let canvasSize = 800;
  let centerX, centerY;
  
  p.setup = function () {
    p.createCanvas(canvasSize, canvasSize);
    centerX = canvasSize / 2;
    centerY = canvasSize / 2;
  };
  
  p.draw = function () {
    // Get current time
    let h = p.hour();
    let m = p.minute();
    let s = p.second();
    let ms = p.millis();
    
    // Calculate breathing cycle (4-second inhale, 4-second exhale)
    let breathCycle = (ms % 8000) / 8000; // 0 to 1 over 8 seconds
    let breathAmount;
    let isInhaling;
    
    if (breathCycle < 0.5) {
      // Inhale (0 to 0.5)
      breathAmount = p.map(breathCycle, 0, 0.5, 0, 1);
      breathAmount = p.easeInOutCubic(breathAmount);
      isInhaling = true;
    } else {
      // Exhale (0.5 to 1)
      breathAmount = p.map(breathCycle, 0.5, 1, 1, 0);
      breathAmount = p.easeInOutCubic(breathAmount);
      isInhaling = false;
    }
    
    // Calculate moon phase based on minutes (0-60 = new moon to full moon)
    let moonPhase = m / 60;
    
    // Draw starry background
    drawStarryBackground(h);
    
    // Draw breathing moon
    drawBreathingMoon(breathAmount, moonPhase);
    
    // Draw breathing instruction
    drawBreathingGuide(isInhaling, breathCycle);
    
    // Draw time display
    drawTimeDisplay(h, m, s);
  };
  
  // Easing function for smooth breathing
  p.easeInOutCubic = function(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  
  function drawStarryBackground(hour) {
    // Background darkness based on hour
    let darkness;
    if (hour >= 6 && hour < 18) {
      // Daytime
      darkness = p.map(hour, 6, 18, 40, 60);
    } else {
      // Nighttime
      let nightHour = (hour + 12) % 24;
      darkness = p.map(nightHour, 6, 18, 10, 30);
    }
    
    // Gradient background
    for (let y = 0; y < canvasSize; y++) {
      let inter = p.map(y, 0, canvasSize, 0, 1);
      let brightness = p.lerp(darkness, darkness * 0.6, inter);
      p.stroke(brightness * 0.5, brightness * 0.6, brightness);
      p.line(0, y, canvasSize, y);
    }
    
    // Draw stars
    let starDensity = p.map(darkness, 10, 60, 120, 30);
    
    p.randomSeed(42);
    p.noStroke();
    for (let i = 0; i < starDensity; i++) {
      let x = p.random(canvasSize);
      let y = p.random(canvasSize);
      let size = p.random(1, 2.5);
      let twinkle = p.sin(p.millis() * 0.001 + i) * 0.5 + 0.5;
      let alpha = p.random(150, 255) * twinkle;
      
      p.fill(255, 255, 255, alpha);
      p.ellipse(x, y, size, size);
    }
  }
  
  function drawBreathingMoon(breathAmount, moonPhase) {
    p.push();
    p.translate(centerX, centerY);
    
    // Base moon size that breathes
    let baseMoonSize = 220;
    let breathExpansion = 60;
    let moonSize = baseMoonSize + breathAmount * breathExpansion;
    
    // Draw moon body
    p.noStroke();
    p.fill(245, 242, 230);
    p.ellipse(0, 0, moonSize, moonSize);
    
    // Draw moon phase (simple shadow overlay)
    if (moonPhase < 0.5) {
      // Waxing (0 to 0.5) - shadow on left
      let shadowWidth = p.map(moonPhase, 0, 0.5, moonSize, 0);
      p.fill(20, 25, 45, 150);
      p.arc(0, 0, shadowWidth, moonSize, -p.HALF_PI, p.HALF_PI);
    } else {
      // Waning (0.5 to 1) - shadow on right
      let shadowWidth = p.map(moonPhase, 0.5, 1, 0, moonSize);
      p.fill(20, 25, 45, 150);
      p.arc(0, 0, shadowWidth, moonSize, p.HALF_PI, -p.HALF_PI);
    }
    
    p.pop();
  }
  
  function drawBreathingGuide(isInhaling, breathCycle) {
    // Instruction text that pulses
    let instruction = isInhaling ? "Inhale" : "Exhale";
    let instructionAlpha = p.map(p.sin(breathCycle * p.TWO_PI), -1, 1, 120, 255);
    
    p.fill(255, 255, 255, instructionAlpha);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(36);
    p.text(instruction, centerX, centerY + 220);
  }
  
  function drawTimeDisplay(h, m, s) {
    // Time display
    p.fill(255, 255, 255, 130);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.text(`${p.nf(h, 2)}:${p.nf(m, 2)}:${p.nf(s, 2)}`, centerX, canvasSize - 40);
  }
  
  p.windowResized = function () {
    // Keep canvas at fixed size
  };
});