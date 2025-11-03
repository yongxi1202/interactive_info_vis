let hwk5 = function(p) {
  
    let data;
    let dailyData = {};
    let monthlyData = {};
    let loaded = false;
    
    // Colors
    const GREEN = [76, 175, 80];   // Good (low delay)
    const YELLOW = [255, 235, 59]; // Medium
    const RED = [244, 67, 54];     // Bad (high delay)
    
    // Layout
    const MARGIN = 60;
    const CIRCLE_SIZE = 14;
    const CIRCLE_SPACING = 18;
    
    let hoveredDay = null;
    let bestDay = null;
    let worstDay = null;
    
    // Preload data
    p.preload = function() {
        data = p.loadTable('data/flight_delays_calendar.csv', 'csv', 'header', processData);
        loaded = true;
      };
    
    // Setup
    p.setup = function() {
      let canvas = p.createCanvas(1080, 1080);
      canvas.parent('sketch-container-sk15');
      p.textFont('monospace');
      p.noLoop();
    };
    
    // Process data
    function processData() {
      let minDelay = Infinity;
      let maxDelay = -Infinity;
      
      for (let i = 0; i < data.getRowCount(); i++) {
        let row = data.getRow(i);
        let date = row.getString('date');
        let delayRate = parseFloat(row.getString('delay_rate')) || 0;
        let avgDelay = parseFloat(row.getString('avg_delay')) || 0;
        let numFlights = parseInt(row.getString('num_flights')) || 0;
        
        let [year, month, day] = date.split('-').map(Number);
        
        // Store by date
        dailyData[date] = {
          date: date,
          year: year,
          month: month,
          day: day,
          delayRate: delayRate,
          avgDelay: avgDelay,
          numFlights: numFlights,
          dayName: row.getString('day_name')
        };
        
        // Track best and worst
        if (delayRate < minDelay) {
          minDelay = delayRate;
          bestDay = dailyData[date];
        }
        if (delayRate > maxDelay) {
          maxDelay = delayRate;
          worstDay = dailyData[date];
        }
        
        // Aggregate by year-month
        let monthKey = `${year}-${String(month).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(dailyData[date]);
      }
      
      // Sort each month's days
      for (let monthKey in monthlyData) {
        monthlyData[monthKey].sort((a, b) => a.day - b.day);
      }
      
      console.log('Processed days:', Object.keys(dailyData).length);
      console.log('Best day:', bestDay);
      console.log('Worst day:', worstDay);
      console.log('Months:', Object.keys(monthlyData).length);
    }
    
    // Draw
    p.draw = function() {
      p.background(250, 245, 235);
      
      if (!loaded) {
        p.fill(0);
        p.textSize(20);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Loading data...', p.width/2, p.height/2);
        return;
      }
      
      // Title
      p.fill(0);
      p.textSize(28);
      p.textAlign(p.CENTER);
      p.text('CALENDAR HEATMAP: When to Fly', p.width/2, 40);
      p.textSize(16);
      p.text('Flight Delay Patterns 2019-2023', p.width/2, 70);
      
      // Draw calendar
      drawCalendar();
      
      // Draw legend
      drawLegend();
    }
    
    // Draw calendar grid
    function drawCalendar() {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      const startY = 120;
      const rowHeight = 48;
      const col1X = MARGIN + 60;
      const col2X = p.width/2 + 40;
      
      // Use 2023 data (most complete year)
      const year = 2023;
      
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        let month = monthIdx + 1;
        let monthStr = String(month).padStart(2, '0');
        let isLeftCol = monthIdx < 6;
        
        let x = isLeftCol ? col1X : col2X;
        let y = startY + (monthIdx % 6) * rowHeight;
        
        // Month label
        p.fill(0);
        p.textSize(13);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(months[monthIdx], x - 10, y);
        
        // Get days for this month
        let monthKey = `${year}-${monthStr}`;
        let daysInMonth = monthlyData[monthKey];
        
        if (daysInMonth && daysInMonth.length > 0) {
          // Draw all days (up to 31)
          let maxDays = Math.min(31, daysInMonth.length);
          
          for (let d = 0; d < maxDays; d++) {
            if (d >= daysInMonth.length) break;
            
            let dayData = daysInMonth[d];
            let cx = x + d * CIRCLE_SPACING;
            let cy = y;
            
            // Color based on delay rate
            let color = getColorForDelay(dayData.delayRate);
            p.fill(color[0], color[1], color[2]);
            p.noStroke();
            p.circle(cx, cy, CIRCLE_SIZE);
            
            // Check hover
            let dist = p.dist(p.mouseX, p.mouseY, cx, cy);
            if (dist < CIRCLE_SIZE/2 + 2) {
              hoveredDay = {
                data: dayData,
                x: cx,
                y: cy
              };
              p.stroke(0);
              p.strokeWeight(2);
              p.noFill();
              p.circle(cx, cy, CIRCLE_SIZE + 4);
            }
          }
        }
      }
      
      
      // Draw tooltip last
      if (hoveredDay) {
        drawTooltip(hoveredDay);
      }
    }
    
    // Get color based on delay rate
    function getColorForDelay(delayRate) {
      if (delayRate < 20) return GREEN;
      if (delayRate < 35) return YELLOW;
      return RED;
    }

    
    // Draw legend
    function drawLegend() {
      const y = 450;
      
      if (!bestDay || !worstDay) return;
      
      // Worst day
      p.fill(RED[0], RED[1], RED[2]);
      p.circle(MARGIN + 20, y, 18);
      p.fill(0);
      p.textSize(14);
      p.textAlign(p.LEFT, p.CENTER);
      
      // Format date nicely
      let worstDate = new Date(worstDay.date);
      let worstDateStr = worstDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      p.text(`${worstDateStr}: WORST DAY OF YEAR (${worstDay.delayRate.toFixed(1)}% delay rate)`, 
             MARGIN + 40, y);
      
      // Best day
      p.fill(GREEN[0], GREEN[1], GREEN[2]);
      p.circle(MARGIN + 20, y + 35, 18);
      p.fill(0);
      
      let bestDate = new Date(bestDay.date);
      let bestDateStr = bestDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      p.text(`${bestDateStr}: BEST DAY OF YEAR (${bestDay.delayRate.toFixed(1)}% delay rate)`, 
             MARGIN + 40, y + 35);
      
      
      // Color legend
      const legendY = y + 75;
      p.textSize(13);
      p.textAlign(p.LEFT, p.CENTER);
      
      p.fill(GREEN[0], GREEN[1], GREEN[2]);
      p.circle(MARGIN + 40, legendY, 16);
      p.fill(0);
      p.text('Low delay risk (<20%)', MARGIN + 65, legendY);
      
      p.fill(YELLOW[0], YELLOW[1], YELLOW[2]);
      p.circle(MARGIN + 280, legendY, 16);
      p.fill(0);
      p.text('Medium (20-35%)', MARGIN + 305, legendY);
      
      p.fill(RED[0], RED[1], RED[2]);
      p.circle(MARGIN + 480, legendY, 16);
      p.fill(0);
      p.text('High delay risk (>35%)', MARGIN + 505, legendY);
      
      // Findings based on data
      const findingsY = legendY + 50;
      p.fill(0);
      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);
      
      p.text('✅ Best months: Jan-Mar (winter, fewer delays)', MARGIN + 40, findingsY);
      p.text('⚠️  Avoid: Summer (thunderstorms), Dec holidays', MARGIN + 40, findingsY + 25);
      
      // Data source
      p.fill(120);
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Data: US DOT Flight Delays 2019-2023 | Hover over circles for details', 
             p.width/2, y + 175);
    }
    
    // Draw tooltip
    function drawTooltip(hovered) {
      let day = hovered.data;
      let tx = hovered.x;
      let ty = hovered.y - 70;
      
      // Keep tooltip on screen
      if (tx < 140) tx = 140;
      if (tx > p.width - 140) tx = p.width - 140;
      if (ty < 100) ty = hovered.y + 30;
      
      // Box
      p.fill(255, 255, 255, 250);
      p.stroke(0);
      p.strokeWeight(2);
      p.rect(tx - 130, ty - 30, 260, 60, 5);
      
      // Text
      p.fill(0);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      
      let date = new Date(day.date);
      let dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      p.text(`${dateStr} (${day.dayName})`, tx - 120, ty - 20);
      p.text(`Delay Rate: ${day.delayRate.toFixed(1)}%  |  Avg: ${day.avgDelay.toFixed(0)} min`, 
             tx - 120, ty);
      p.text(`Flights: ${day.numFlights.toLocaleString()}`, tx - 120, ty + 20);
    }
    
    // Mouse moved
    p.mouseMoved = function() {
      let prevHovered = hoveredDay;
      hoveredDay = null;
      
      // Only redraw if hover state changed
      if (prevHovered || hoveredDay) {
        p.redraw();
      }
    };
    
  };
  
  // Create instance
  new p5(hwk5, 'sketch-container-sk15');