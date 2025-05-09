/*
  Generative Art Tile with p5.js
  --------------------------------
  This sketch creates a generative tile with a background, dot grid, and randomly placed shapes (squares, triangles, semicircles, squiggles).
  Shapes are placed without overlapping and wrap around the canvas edges for seamless tiling.
  Each shape and background color is chosen from a shuffled palette for variety.
*/

// Shadow color for shapes (Medium Gray)
let shadowColor = '#444444'; // RGB(68, 68, 68) - Medium Gray
let shadowOffset = 3; // Offset for drop shadow
let placedShapes = []; // Stores placed shapes to avoid overlap
let shapeSizeScale = 1.0; // Default scale factor for shapes (medium)
let shapeCountMode = 'usual'; // Default to usual amount of shapes
let fillProbability = 0.85; // 85% chance of shapes being filled

function setup() {
  pixelDensity(1);
  let cnv = createCanvas(600, 600);  // Start with medium size
  cnv.parent('sketch-holder');
  angleMode(DEGREES);
  rectMode(CENTER);
  noLoop(); // Only draw once unless manually redrawn
  
  // Expose functions to window for external access
  window.resizeCanvas = resizeCanvas;
  window.regenerateTile = regenerateTile;
  window.saveCanvas = saveCanvas;
  window.setShapeSize = setShapeSize;
  window.setShapeCount = setShapeCount;
  
  // Initialize with medium shape size
  setShapeSize('medium');
  
  // Only draw if we should render
  if (window.shouldRender) {
    redraw();
  }
}

// Set the shape size scale factor
function setShapeSize(size) {
  const scales = {
    small: 1.0,    // Current medium becomes small
    medium: 1.3,   // Current large becomes medium
    large: 1.82    // New large (1.3 * 1.4)
  };
  shapeSizeScale = scales[size] || 1.0;
}

// Set the shape count mode
function setShapeCount(mode) {
  shapeCountMode = mode;
}

// Get available shapes based on count mode
function getAvailableShapes() {
  const allShapes = ['squares', 'triangles', 'semicircles', 'squiggles', 'isoTriangles', 'ovals', 'sineWaves', 'dotGrids', 'stripeyCircles'];
  switch(shapeCountMode) {
    case 'fewer':
      return shuffle(allShapes).slice(0, 4);
    case 'usual':
      return shuffle(allShapes).slice(0, 6);
    case 'many':
      return allShapes;
    default:
      return shuffle(allShapes).slice(0, 6);
  }
}

// Redraws the tile (can be called externally)
function regenerateTile() {
  redraw();
}

// Main drawing function: sets up palette, background, dot grid, and places shapes
function draw() {
  // Only draw if we should render
  if (!window.shouldRender) return;
  
  placedShapes = [];

  // Color palette (all vibrant, pastel-like)
  let palette = shuffle([
    '#FF6EC7', // RGB(255, 110, 199) - Neon Pink
    '#70A1FF', // RGB(112, 161, 255) - Sky Blue
    '#A29BFE', // RGB(162, 155, 254) - Lavender
    '#FFE66D', // RGB(255, 230, 109) - Lemon Yellow
    '#1ABC9C', // RGB(26, 188, 156) - Turquoise
    '#FF3CAC', // RGB(255, 60, 172) - Hot Pink
    '#FFF200', // RGB(255, 242, 0) - Bright Yellow
    '#A0E7E5', // RGB(160, 231, 229) - Aqua
    '#FF9F43', // RGB(255, 159, 67) - Coral Orange
    '#00D2D3', // RGB(0, 210, 211) - Teal
    '#54A0FF', // RGB(84, 160, 255) - Electric Blue
    '#5F27CD', // RGB(95, 39, 205) - Purple
    '#FF9FF3', // RGB(255, 159, 243) - Bubblegum Pink
    '#00D894', // RGB(0, 216, 148) - Mint Green
    '#FECA57'  // RGB(254, 202, 87) - Golden Yellow
  ]);

  // Assign colors to roles
  let colorMap = {
    background: palette.pop(),
    dots: palette.pop()
  };

  // Get available shapes and assign colors
  let availableShapes = getAvailableShapes();
  availableShapes.forEach(shape => {
    colorMap[shape] = palette.pop();
  });

  background(colorMap.background); // Set background color
  drawWrappedDotGrid(colorMap.dots); // Draw dot grid

  // Number of each shape to place
  let shapeCounts = {};
  availableShapes.forEach(shape => {
    switch(shape) {
      case 'squares':
      case 'triangles':
      case 'isoTriangles':
      case 'ovals':
        shapeCounts[shape] = int(random(2, 4));
        break;
      case 'semicircles':
        shapeCounts[shape] = int(random(3, 5));
        break;
      case 'squiggles':
        shapeCounts[shape] = int(random(3, 6));
        break;
      case 'sineWaves':
      case 'dotGrids':
        shapeCounts[shape] = int(random(1, 3));
        break;
      case 'stripeyCircles':
        shapeCounts[shape] = int(random(1, 3));
        break;
    }
  });

  // Drawing order: bottom to top
  const drawOrder = [
    'stripeyCircles',
    'squares',
    'semicircles',
    'isoTriangles',
    'triangles',
    'squiggles',
    'dotGrids',
    'sineWaves'
  ];

  drawOrder.forEach(shape => {
    if (!availableShapes.includes(shape)) return;
    switch(shape) {
      case 'stripeyCircles':
        for (let i = 0; i < shapeCounts.stripeyCircles; i++) {
          let d = 90 * random(0.96, 1.44) * shapeSizeScale;
          let r = d / 2;
          let { x, y } = getNonOverlappingPosition(r);
          let rot = random(360);
          let stripeCount = int(random(6, 10));
          let stripeWidth = d / (stripeCount * 2 - 1);
          let stripeColor = colorMap.stripeyCircles;
          drawWrappedShape(x, y, r, () => {
            push();
            rotate(rot);
            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.arc(0, 0, r, 0, 2 * Math.PI);
            drawingContext.clip();
            stroke(stripeColor);
            strokeWeight(stripeWidth);
            strokeCap(SQUARE);
            noFill();
            let fullLen = d * 1.5;
            for (let i = 0; i < stripeCount; i++) {
              let offset = (i - (stripeCount-1)/2) * 2 * stripeWidth;
              line(offset, -fullLen, offset, fullLen);
            }
            drawingContext.restore();
            pop();
          });
        }
        break;
      case 'squares':
        for (let i = 0; i < shapeCounts.squares; i++) {
          let boxSize = 75 * random(0.96, 1.44) * shapeSizeScale;
          let r = sqrt(2 * sq(boxSize / 2)); // Diagonal radius
          let { x, y } = getNonOverlappingPosition(r);
          let rot = random(360);
          let isFilled = random() < fillProbability;
          drawWrappedShape(x, y, r, () => {
            if (isFilled) {
              drawDropShadow(() => rect(0, 0, boxSize, boxSize), rot);
            }
            drawMainShape(colorMap.squares, () => {
              if (isFilled) {
                rect(0, 0, boxSize, boxSize);
              } else {
                noFill();
                stroke(shadowColor);
                strokeWeight(3);
                rect(0, 0, boxSize, boxSize);
              }
            }, rot);
          });
        }
        break;
      case 'semicircles':
        for (let i = 0; i < shapeCounts.semicircles; i++) {
          let d = 90 * random(0.96, 1.44) * shapeSizeScale; // Diameter
          let r = d / 2;
          let { x, y } = getNonOverlappingPosition(r);
          let rot = random(360);
          let isFilled = random() < fillProbability;
          drawWrappedShape(x, y, r, () => {
            if (isFilled) {
              drawDropShadow(() => arc(0, 0, d, d, 0, 180, PIE), rot);
            }
            drawMainShape(colorMap.semicircles, () => {
              if (isFilled) {
                arc(0, 0, d, d, 0, 180, PIE);
              } else {
                noFill();
                stroke(shadowColor);
                strokeWeight(3);
                arc(0, 0, d, d, 0, 180, PIE);
              }
            }, rot);
          });
        }
        break;
      case 'isoTriangles':
        for (let i = 0; i < shapeCounts.isoTriangles; i++) {
          let base = 60 * random(0.96, 1.44) * shapeSizeScale;
          let height = 70 * random(0.96, 1.44) * shapeSizeScale;
          let r = sqrt(sq(base / 2) + sq(height)); // Circumradius
          let { x, y } = getNonOverlappingPosition(r);
          let rot = random(360);
          let isFilled = random() < fillProbability;
          drawWrappedShape(x, y, r, () => {
            if (isFilled) {
              drawDropShadow(() => {
                triangle(-base/2, height/2, base/2, height/2, 0, -height/2);
              }, rot);
            }
            drawMainShape(colorMap.isoTriangles, () => {
              if (isFilled) {
                triangle(-base/2, height/2, base/2, height/2, 0, -height/2);
              } else {
                noFill();
                stroke(shadowColor);
                strokeWeight(3);
                triangle(-base/2, height/2, base/2, height/2, 0, -height/2);
              }
            }, rot);
          });
        }
        break;
      case 'triangles':
        for (let i = 0; i < shapeCounts.triangles; i++) {
          let side = 90 * random(0.96, 1.44) * shapeSizeScale;
          let h = (sqrt(3) / 2) * side; // Height of equilateral triangle
          let r = sqrt(sq(side / 2) + sq(h / 2)); // Circumradius
          let { x, y } = getNonOverlappingPosition(r);
          let rot = random(360);
          let isFilled = random() < fillProbability;
          drawWrappedShape(x, y, r, () => {
            if (isFilled) {
              drawDropShadow(() => {
                triangle(-side / 2, h / 2, side / 2, h / 2, 0, -h / 2);
              }, rot);
            }
            drawMainShape(colorMap.triangles, () => {
              if (isFilled) {
                triangle(-side / 2, h / 2, side / 2, h / 2, 0, -h / 2);
              } else {
                noFill();
                stroke(shadowColor);
                strokeWeight(3);
                triangle(-side / 2, h / 2, side / 2, h / 2, 0, -h / 2);
              }
            }, rot);
          });
        }
        break;
      case 'squiggles':
        for (let i = 0; i < shapeCounts.squiggles; i++) {
          let humps = int(random(3, 6));
          let spacing = 18 * random(0.96, 1.44) * shapeSizeScale;
          let amplitude = 13.5 * random(0.96, 1.44) * shapeSizeScale;
          let len = humps * spacing * TWO_PI / 10;
          let r = sqrt(sq(len / 2) + sq(amplitude)) + 10; // Bounding radius
          let { x, y } = getNonOverlappingPosition(r);
          let rot = random(360);
          drawWrappedShape(x, y, r, () => {
            // Draw drop shadow for squiggle
            push();
            translate(shadowOffset, shadowOffset);
            rotate(rot);
            stroke(shadowColor);
            strokeWeight(4 * shapeSizeScale);
            noFill();
            beginShape();
            for (let j = 0; j < len; j++) {
              let px = j;
              let py = sin(j * (360 / spacing)) * amplitude;
              vertex(px, py);
            }
            endShape();
            pop();
            // Draw main squiggle
            push();
            rotate(rot);
            stroke(colorMap.squiggles);
            strokeWeight(4 * shapeSizeScale);
            noFill();
            beginShape();
            for (let j = 0; j < len; j++) {
              let px = j;
              let py = sin(j * (360 / spacing)) * amplitude;
              vertex(px, py);
            }
            endShape();
            pop();
          });
        }
        break;
      case 'dotGrids':
        for (let i = 0; i < shapeCounts.dotGrids; i++) {
          let gridSize = random(10, 20);
          let spacing = 5 * random(1, 1.44) * shapeSizeScale;
          let dotSize = 3 * random(1, 1.44) * shapeSizeScale;
          let len = gridSize * spacing;
          let r = len / 2 + 10; // Bounding radius
          let { x, y } = getNonOverlappingPosition(r);
          let rot = random(360);
          drawWrappedShape(x, y, r, () => {
            push();
            rotate(rot);
            fill(colorMap.dotGrids);
            noStroke();
            // Draw grid of dots
            for (let offset = -50; offset <= 50; offset += 10) {
              for (let j = 0; j < len; j += spacing) {
                let px = j;
                let py = offset;
                ellipse(px, py, dotSize);
              }
            }
            pop();
          });
        }
        break;
      case 'sineWaves':
        for (let i = 0; i < shapeCounts.sineWaves; i++) {
          let humps = random(10, 20);
          let spacing = 18 * random(0.96, 1.44) * shapeSizeScale;
          let amplitude = random(1,3) * random(0.96, 1.44) * shapeSizeScale;
          let len = humps * spacing * TWO_PI / 20;
          let r = sqrt(sq(len / 2) + sq(amplitude)) + 10; // Bounding radius
          let { x, y } = getNonOverlappingPosition(r);
          let rot = random(360);
          drawWrappedShape(x, y, r, () => {
            push();
            rotate(rot);
            stroke(colorMap.sineWaves);
            strokeWeight(1 * shapeSizeScale);
            noFill();
            // Draw 7 parallel sine waves
            for (let offset = -50; offset <= 50; offset += 5) {
              beginShape();
              for (let j = 0; j < len; j++) {
                let px = j;
                let py = cos(j * (360 / spacing)) * amplitude + offset;
                vertex(px, py);
              }
              endShape();
            }
            pop();
          });
        }
        break;
    }
  });

  noStroke();
}

// Draws a shape and its wrapped copies for seamless tiling
function drawWrappedShape(x, y, radius, drawFn) {
  // Draw at (x, y) and at wrapped positions
  for (let dx = -width; dx <= width; dx += width) {
    for (let dy = -height; dy <= height; dy += height) {
      push();
      translate(x + dx, y + dy);
      drawFn();
      pop();
    }
  }
}

// Draws a drop shadow for a shape
function drawDropShadow(drawFn, rotation) {
  push();
  translate(shadowOffset, shadowOffset);
  rotate(rotation);
  fill(shadowColor); // Dark Gray
  noStroke();
  drawFn();
  pop();
}

// Draws the main shape with fill and outline
function drawMainShape(fillColor, drawFn, rotation) {
  push();
  rotate(rotation);
  fill(fillColor);
  stroke(shadowColor); // Outline with dark gray
  strokeWeight(2);
  drawFn();
  pop();
}

// Draws a grid of dots, wrapped for seamless tiling
function drawWrappedDotGrid(dotColor) {
  push();
  fill(dotColor);
  noStroke();
  const dotSize = random(6, 9);  // Single random size for all dots
  for (let x = -40; x < width + 80; x += 40) {
    for (let y = -40; y < height + 80; y += 40) {
      drawWrappedShape(x, y, 0, () => {
        ellipse(0, 0, dotSize);
      });
    }
  }
  pop();
}

// Finds a random position for a shape that doesn't overlap others
function getNonOverlappingPosition(radius) {
  let attempts = 10;
  while (attempts-- > 0) {
    let x = random(radius, width - radius);
    let y = random(radius, height - radius);
    let tooClose = false;
    for (let s of placedShapes) {
      let d = dist(x, y, s.x, s.y);
      if (d < radius + s.radius + 12) { // 12px buffer
        tooClose = true;
        break;
      }
    }
    if (!tooClose) {
      placedShapes.push({ x, y, radius });
      return { x, y };
    }
  }
  // Fallback: just return a random position
  return { x: random(width), y: random(height) };
}