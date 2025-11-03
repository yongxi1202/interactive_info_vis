let hwk5 = function(p) {
  
    let data;
    let dailyData = {};
    let aggregatedMonthlyData = {};
    let loaded = false;
    
    // Colors
    const GREEN = [76, 175, 80];
    const YELLOW = [255, 235, 59];
    const RED = [244, 67, 54];
    
    // Layout
    const MARGIN = 60;
    const CIRCLE_SIZE = 10;
    const CIRCLE_SPACING = 13;
    
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
      
      let tempMonthDayData = {};
      
      for (let i = 0; i < data.getRowCount(); i++) {
        let row = data.getRow(i);
        let date = row.getString('date');
        let delayRate = parseFloat(row.getString('delay_rate')) || 0;
        let avgDelay = parseFloat(row.getString('avg_delay')) || 0;
        let numFlights = parseInt(row.getString('num_flights')) || 0;
        
        let [year, month, day] = date.split('-').map(Number);
        
        // Store original daily data
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
        
        let monthDayKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (!tempMonthDayData[monthDayKey]) {
          tempMonthDayData[monthDayKey] = {
            month: month,
            day: day,
            totalDelayRate: 0,
            totalAvgDelay: 0,
            count: 0,
            dates: []
          };
        }
        
        tempMonthDayData[monthDayKey].totalDelayRate += delayRate;
        tempMonthDayData[monthDayKey].totalAvgDelay += avgDelay;
        tempMonthDayData[monthDayKey].count += 1;
        tempMonthDayData[monthDayKey].dates.push(date);
      }
      
      for (let monthDayKey in tempMonthDayData) {
        let item = tempMonthDayData[monthDayKey];
        let avgDelayRate = item.totalDelayRate / item.count;
        let avgAvgDelay = item.totalAvgDelay / item.count;
        
        let monthKey = String(item.month).padStart(2, '0');
        
        if (!aggregatedMonthlyData[monthKey]) {
          aggregatedMonthlyData[monthKey] = [];
        }
        
        aggregatedMonthlyData[monthKey].push({
          month: item.month,
          day: item.day,
          delayRate: avgDelayRate,
          avgDelay: avgAvgDelay,
          count: item.count,
          dates: item.dates
        });
      }
      
      // Sort each month's days
      for (let monthKey in aggregatedMonthlyData) {
        aggregatedMonthlyData[monthKey].sort((a, b) => a.day - b.day);
      }
      
      console.log('Processed days:', Object.keys(dailyData).length);
      console.log('Aggregated months:', Object.keys(aggregatedMonthlyData).length);
      console.log('Best day:', bestDay);
      console.log('Worst day:', worstDay);
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
      
      drawCalendar();
      drawLegend();
    }
    
    // Draw calendar
    function drawCalendar() {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      const startY = 120;
      const rowHeight = 42;
      const col1X = MARGIN + 60;
      const col2X = p.width/2 + 40;
      
      hoveredDay = null;
      
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
        
        // Get aggregated days for this month
        let daysInMonth = aggregatedMonthlyData[monthStr];
        
        if (daysInMonth && daysInMonth.length > 0) {
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
      
      if (hoveredDay) {
        drawTooltip(hoveredDay);
      }
    }
    
    function getColorForDelay(delayRate) {
      if (delayRate < 20) return GREEN;
      if (delayRate < 35) return YELLOW;
      return RED;
    }
    
    function drawLegend() {
      const y = 450;
      
      if (!bestDay || !worstDay) return;
      
      // Worst day
      p.fill(RED[0], RED[1], RED[2]);
      p.circle(MARGIN + 20, y, 18);
      p.fill(0);
      p.textSize(14);
      p.textAlign(p.LEFT, p.CENTER);
      
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
      
      // Data source
      p.fill(120);
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Data: US DOT Flight Delays 2019-2023 (averaged across years) | Hover for details', 
             p.width/2, y + 175);
    }
    
    function drawTooltip(hovered) {
      let day = hovered.data;
      let tx = hovered.x;
      let ty = hovered.y - 75;
      
      if (tx < 150) tx = 150;
      if (tx > p.width - 150) tx = p.width - 150;
      if (ty < 100) ty = hovered.y + 35;
      
      // Box
      p.fill(255, 255, 255, 250);
      p.stroke(0);
      p.strokeWeight(2);
      p.rect(tx - 140, ty - 32, 280, 65, 5);
      
      // Text
      p.fill(0);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      
      // Show month and day (averaged across all years)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let monthName = monthNames[day.month - 1];
      
      p.text(`${monthName} ${day.day} (avg of ${day.count} years)`, tx - 130, ty - 22);
      p.text(`Avg Delay Rate: ${day.delayRate.toFixed(1)}%`, tx - 130, ty - 2);
      p.text(`Avg Delay: ${day.avgDelay.toFixed(0)} minutes`, tx - 130, ty + 18);
      p.text(`Based on: ${day.dates.join(', ')}`, tx - 130, ty + 38);
    }
    
    p.mouseMoved = function() {
      let prevHovered = hoveredDay;
      hoveredDay = null;
      
      if (prevHovered || hoveredDay) {
        p.redraw();
      }
    };
    
  };
  
  new p5(hwk5, 'sketch-container-sk15');