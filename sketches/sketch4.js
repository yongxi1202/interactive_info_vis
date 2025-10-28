// Breathing Moon Clock
registerSketch('sk4', function (p) {
  let canvasSize = 800;
  let centerX, centerY;
  let breathingSpeed = 'normal'; // 'slow', 'normal', 'fast'
  let breathingCycles = {
    slow: 12000,    // 6s inhale + 6s exhale
    normal: 8000,   // 4s inhale + 4s exhale
    fast: 6000      // 3s inhale + 3s exhale
  };
  
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
    
    // Calculate breathing cycle based on current speed
    let cycleTime = breathingCycles[breathingSpeed];
    let breathCycle = (ms % cycleTime) / cycleTime; // 0 to 1
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
    
    // Draw speed indicator
    drawSpeedIndicator();
  };
  
  p.mousePressed = function() {
    // Check if clicked on moon
    let d = p.dist(p.mouseX, p.mouseY, centerX, centerY);
    if (d < 200) { // Moon area
      // Cycle through speeds: normal -> slow -> fast -> normal
      if (breathingSpeed === 'normal') {
        breathingSpeed = 'slow';
      } else if (breathingSpeed === 'slow') {
        breathingSpeed = 'fast';
      } else {
        breathingSpeed = 'normal';
      }
    }
    return false; // Prevent default behavior
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
  
  function drawSpeedIndicator() {
    // Display current breathing speed
    let speedText = '';
    let speedColor = [255, 255, 255];
    
    if (breathingSpeed === 'slow') {
      speedText = 'Deep Breathing (6-6s)';
      speedColor = [150, 200, 255]; // Light blue
    } else if (breathingSpeed === 'normal') {
      speedText = 'Normal Breathing (4-4s)';
      speedColor = [200, 255, 200]; // Light green
    } else {
      speedText = 'Quick Breathing (3-3s)';
      speedColor = [255, 200, 150]; // Light orange
    }
    
    p.fill(speedColor[0], speedColor[1], speedColor[2], 150);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.text(speedText, centerX, 60);
  }
  
  p.windowResized = function () {
    // Keep canvas at fixed size
  };
});