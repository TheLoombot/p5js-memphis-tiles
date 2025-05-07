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
  
  // Initialize with medium shape size
  setShapeSize('medium');
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

// Redraws the tile (can be called externally)
function regenerateTile() {
  redraw();
}

// Main drawing function: sets up palette, background, dot grid, and places shapes
function draw() {
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
    '#A0E7E5'  // RGB(160, 231, 229) - Aqua
  ]);

  // Assign colors to roles
  let colorMap = {
    background: palette.pop(),
    dots: palette.pop(),
    triangles: palette.pop(),
    squares: palette.pop(),
    semicircles: palette.pop(),
    squiggles: palette.pop(),
    isoTriangles: palette.pop(),
    ovals: palette.pop()
  };

  background(colorMap.background); // Set background color
  drawWrappedDotGrid(colorMap.dots); // Draw dot grid

  // Number of each shape to place
  let shapeCounts = {
    squares: int(random(2, 4)),
    triangles: int(random(3, 5)),
    semicircles: int(random(3, 5)),
    squiggles: int(random(3, 6)),
    isoTriangles: int(random(2, 4)),
    ovals: int(random(2, 4))
  };

  // Place squares
  for (let i = 0; i < shapeCounts.squares; i++) {
    let boxSize = 75 * random(0.96, 1.44) * shapeSizeScale;
    let r = sqrt(2 * sq(boxSize / 2)); // Diagonal radius
    let { x, y } = getNonOverlappingPosition(r);
    let rot = random(360);
    drawWrappedShape(x, y, r, () => {
      drawDropShadow(() => rect(0, 0, boxSize, boxSize), rot);
      drawMainShape(colorMap.squares, () => rect(0, 0, boxSize, boxSize), rot);
    });
  }

  // Place triangles
  for (let i = 0; i < shapeCounts.triangles; i++) {
    let side = 90 * random(0.96, 1.44) * shapeSizeScale;
    let h = (sqrt(3) / 2) * side; // Height of equilateral triangle
    let r = sqrt(sq(side / 2) + sq(h / 2)); // Circumradius
    let { x, y } = getNonOverlappingPosition(r);
    let rot = random(360);
    drawWrappedShape(x, y, r, () => {
      drawDropShadow(() => {
        triangle(-side / 2, h / 2, side / 2, h / 2, 0, -h / 2);
      }, rot);
      drawMainShape(colorMap.triangles, () => {
        triangle(-side / 2, h / 2, side / 2, h / 2, 0, -h / 2);
      }, rot);
    });
  }

  // Place semicircles
  for (let i = 0; i < shapeCounts.semicircles; i++) {
    let d = 90 * random(0.96, 1.44) * shapeSizeScale; // Diameter
    let r = d / 2;
    let { x, y } = getNonOverlappingPosition(r);
    let rot = random(360);
    drawWrappedShape(x, y, r, () => {
      drawDropShadow(() => arc(0, 0, d, d, 0, 180, PIE), rot);
      drawMainShape(colorMap.semicircles, () => arc(0, 0, d, d, 0, 180, PIE), rot);
    });
  }

  // Place squiggles
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

  // Place isosceles triangles
  for (let i = 0; i < shapeCounts.isoTriangles; i++) {
    let base = 60 * random(0.96, 1.44) * shapeSizeScale;
    let height = 70 * random(0.96, 1.44) * shapeSizeScale;
    let r = sqrt(sq(base / 2) + sq(height)); // Circumradius
    let { x, y } = getNonOverlappingPosition(r);
    let rot = random(360);
    drawWrappedShape(x, y, r, () => {
      drawDropShadow(() => {
        triangle(-base/2, height/2, base/2, height/2, 0, -height/2);
      }, rot);
      drawMainShape(colorMap.isoTriangles, () => {
        triangle(-base/2, height/2, base/2, height/2, 0, -height/2);
      }, rot);
    });
  }

  // Place ovals
  for (let i = 0; i < shapeCounts.ovals; i++) {
    let w = 75 * random(0.96, 1.44) * shapeSizeScale;
    let h = 45 * random(0.96, 1.44) * shapeSizeScale;
    let r = sqrt(sq(w/2) + sq(h/2)); // Circumradius
    let { x, y } = getNonOverlappingPosition(r);
    let rot = random(360);
    drawWrappedShape(x, y, r, () => {
      drawDropShadow(() => ellipse(0, 0, w, h), rot);
      drawMainShape(colorMap.ovals, () => ellipse(0, 0, w, h), rot);
    });
  }

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