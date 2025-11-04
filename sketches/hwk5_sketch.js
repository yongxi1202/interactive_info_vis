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
    
    p.preload = function() {
      data = p.loadTable('data/flight_delays_calendar.csv', 'csv', 'header', 
        function() {
          processData();
          loaded = true;
        },
        function(err) {
          console.error('Error loading:', err);
        }
      );
    };
    
    p.setup = function() {
      let canvas = p.createCanvas(1080, 608);
      canvas.parent('sketch-container-sk15');
      p.textFont('monospace');
      p.noLoop(); //
    };
    
    function processData() {
      let tempMonthDayData = {};
      
      for (let i = 0; i < data.getRowCount(); i++) {
        let row = data.getRow(i);
        let date = row.getString('date');
        let delayRate = parseFloat(row.getString('delay_rate')) || 0;
        let avgDelay = parseFloat(row.getString('avg_delay')) || 0;
        let numFlights = parseInt(row.getString('num_flights')) || 0;
        
        let [year, month, day] = date.split('-').map(Number);
        
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
      
      let minAvgDelay = Infinity;
      let maxAvgDelay = -Infinity;
      
      for (let monthDayKey in tempMonthDayData) {
        let item = tempMonthDayData[monthDayKey];
        let avgDelayRate = item.totalDelayRate / item.count;
        let avgAvgDelay = item.totalAvgDelay / item.count;
        
        let monthKey = String(item.month).padStart(2, '0');
        
        if (!aggregatedMonthlyData[monthKey]) {
          aggregatedMonthlyData[monthKey] = [];
        }
        
        let aggregatedDay = {
          month: item.month,
          day: item.day,
          delayRate: avgDelayRate,
          avgDelay: avgAvgDelay,
          count: item.count,
          dates: item.dates
        };
        
        aggregatedMonthlyData[monthKey].push(aggregatedDay);
        
        if (avgAvgDelay < minAvgDelay) {
          minAvgDelay = avgAvgDelay;
          bestDay = aggregatedDay;
        }
        if (avgAvgDelay > maxAvgDelay) {
          maxAvgDelay = avgAvgDelay;
          worstDay = aggregatedDay;
        }
      }
      
      for (let monthKey in aggregatedMonthlyData) {
        aggregatedMonthlyData[monthKey].sort((a, b) => a.day - b.day);
      }
      
      console.log('Processed days:', Object.keys(dailyData).length);
      console.log('Aggregated days:', Object.keys(tempMonthDayData).length);
      console.log('Best day:', bestDay);
      console.log('Worst day:', worstDay);
    }
    
    p.draw = function() {
      p.background(40, 50, 65);
      
      if (!loaded) {
        p.fill(255);
        p.textSize(20);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Loading data...', p.width/2, p.height/2);
        return;
      }
      
      // Title
      p.fill(255);
      p.textSize(28);
      p.textAlign(p.CENTER);
      p.text('CALENDAR HEATMAP: When to Fly', p.width/2, 40);
      p.textSize(16);
      p.text('Flight Delay Patterns 2019-2023', p.width/2, 70);
      
      drawCalendar();
      drawLegend();
    }
    
    function drawCalendar() {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      const startY = 120;
      const rowHeight = 42;
      const col1X = MARGIN + 60;
      const col2X = p.width/2 + 40;
      
      hoveredDay = null; // Reset hover state
      
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        let month = monthIdx + 1;
        let monthStr = String(month).padStart(2, '0');
        let isLeftCol = monthIdx < 6;
        
        let x = isLeftCol ? col1X : col2X;
        let y = startY + (monthIdx % 6) * rowHeight;
        
        // Month label
        p.fill(255);
        p.textSize(13);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(months[monthIdx], x - 10, y);
        
        let daysInMonth = aggregatedMonthlyData[monthStr];
        
        if (daysInMonth && daysInMonth.length > 0) {
          let maxDays = Math.min(31, daysInMonth.length);
          
          for (let d = 0; d < maxDays; d++) {
            if (d >= daysInMonth.length) break;
            
            let dayData = daysInMonth[d];
            let cx = x + d * CIRCLE_SPACING;
            let cy = y;
            
            let color = getColorForDelay(dayData.delayRate);
            p.fill(color[0], color[1], color[2]);
            p.noStroke();
            p.circle(cx, cy, CIRCLE_SIZE);
            
            // Hover detection
            let dist = p.dist(p.mouseX, p.mouseY, cx, cy);
            if (dist < CIRCLE_SIZE/2 + 5) {
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
      p.fill(255);
      p.textSize(14);
      p.textAlign(p.LEFT, p.CENTER);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let worstMonth = monthNames[worstDay.month - 1];
      p.text(`${worstMonth} ${worstDay.day}: WORST DAY (avg ${worstDay.avgDelay.toFixed(0)} min delay)`, 
             MARGIN + 40, y);
      
      // Best day
      p.fill(GREEN[0], GREEN[1], GREEN[2]);
      p.circle(MARGIN + 20, y + 35, 18);
      p.fill(255);
      
      let bestMonth = monthNames[bestDay.month - 1];
      let bestText = bestDay.avgDelay < 0 
        ? `avg ${Math.abs(bestDay.avgDelay).toFixed(0)} min EARLY`
        : `avg ${bestDay.avgDelay.toFixed(0)} min DELAY`;
      
      p.text(`${bestMonth} ${bestDay.day}: BEST DAY (${bestText})`, 
             MARGIN + 40, y + 35);
      
      // Color legend
      const legendY = y + 75;
      p.textSize(13);
      p.textAlign(p.LEFT, p.CENTER);
      
      p.fill(GREEN[0], GREEN[1], GREEN[2]);
      p.circle(MARGIN + 40, legendY, 16);
      p.fill(255);
      p.text('Low delay rate (<20%)', MARGIN + 65, legendY);
      
      p.fill(YELLOW[0], YELLOW[1], YELLOW[2]);
      p.circle(MARGIN + 280, legendY, 16);
      p.fill(255);
      p.text('Medium (20-35%)', MARGIN + 305, legendY);
      
      p.fill(RED[0], RED[1], RED[2]);
      p.circle(MARGIN + 480, legendY, 16);
      p.fill(255);
      p.text('High delay rate (>35%)', MARGIN + 505, legendY);
      
      // Data source
      p.fill(120);
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Data: US Department of Transportation, Flight Delays 2019-2023', 
             p.width/2, y + 175);
    }
    
    function drawTooltip(hovered) {
      let day = hovered.data;
      let tx = hovered.x;
      let ty = hovered.y - 95;
      
      // Adjust position
      if (tx < 170) tx = 170;
      if (tx > p.width - 170) tx = p.width - 170;
      if (ty < 110) ty = hovered.y + 40;
      
      // Shadow
      p.fill(0, 0, 0, 30);
      p.noStroke();
      p.rect(tx - 163, ty - 38, 330, 90, 5);
      
      // Box
      p.fill(255, 255, 255, 250);
      p.stroke(0);
      p.strokeWeight(2);
      p.rect(tx - 165, ty - 40, 330, 90, 5);
      
      // Text
      p.fill(0);
      p.noStroke();
      p.textAlign(p.LEFT, p.TOP);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let monthName = monthNames[day.month - 1];
      
      // Title
      p.textSize(14);
      p.text(`${monthName} ${day.day} (avg of ${day.count} years)`, tx - 155, ty - 30);
      
      // Main info
      p.textSize(13);
      let delayText = day.avgDelay < 0 
        ? `Avg ${Math.abs(day.avgDelay).toFixed(0)} min EARLY` 
        : `Avg ${day.avgDelay.toFixed(0)} min DELAY`;
      
      p.text(`Delay Rate: ${day.delayRate.toFixed(1)}%  |  ${delayText}`, 
             tx - 155, ty - 5);
      
      // Years
      let years = day.dates.map(d => d.split('-')[0]);
      p.textSize(11);
      p.fill(100);
      p.text(`Based on years: ${years.join(', ')}`, tx - 155, ty + 20);
      
    }
    
    p.mouseMoved = function() {
        p.redraw();
      };
      
    };
    
    new p5(hwk5, 'sketch-container-sk15');