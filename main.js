"use strict";
const drawButton = document.getElementById("draw");
const eraseButton = document.getElementById("erase");

const drawSizeSlider = document.getElementById("draw-size");
const drawSizeBind = document.getElementById("draw-size-bind");

const bgAlphaSizeSlider = document.getElementById("bg-alpha-size");
const bgAlphaSizeBind = document.getElementById("bg-alpha-size-bind");

drawSizeSlider.value = 18;
drawSizeSlider.value = localStorage.getItem("drawSize");
let drawSize = localStorage.getItem("drawSize");

bgAlphaSizeSlider.value = 1;
bgAlphaSizeSlider.value = localStorage.getItem("bgAlphaSize");
let bgAlphaSize = localStorage.getItem("bgAlphaSize");

//blur
const blurSizeSlider = document.getElementById("blur-size");
const blurSizeBind = document.getElementById("blur-size-bind");

blurSizeSlider.value = 0;
blurSizeSlider.value = localStorage.getItem("blurSize");
let blurSize = localStorage.getItem("blurSize");
blurSizeBind.innerHTML = blurSizeSlider.value;
//end blur

const canvas = document.getElementById("canvas");

let draw = true;

let backgroundColor = [255, 255, 255];
let drawColor = [0, 0, 0];
let brushType = 0;

let blobs = 0;
let isDrawing;

const defaultCanvas = [512, 512];

//MAKE BACKGROUND FILL WITH WHITE IF ALPHA MODE NOT ON IF ALPHA MODE ON LEAVE AS IS AND MAKE ERASE SET BACKGROUUND TO TRASNPARENT
//MAKE TOOLBAR SCROLL

//CHANGING BACKGROUND COLOR WHEN CANVAS HAS A LOT OF SHAPES IS NOT GOOD AT ALL

//NEXT: undo feature and background color change

function hexTorgb(hex) { //convert hex to rgb value
  return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
}

const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

//load values from storage
window.onload = () => {
    canvas.setAttribute("style", `width:${defaultCanvas[0]}px; height:${defaultCanvas[1]}px;`)
    gridCanvas.setAttribute("style", `width:${defaultCanvas[0]}px; height:${defaultCanvas[1]}px;`)
    document.getElementById("canvas-size-width").value = defaultCanvas[0];
    document.getElementById("canvas-size-height").value = defaultCanvas[1];
    canvas.width = defaultCanvas[0];
    canvas.height = defaultCanvas[1];

    if(localStorage.getItem("drawSize") == null) localStorage.setItem("drawSize", 18)
    drawSizeSlider.value = localStorage.getItem("drawSize");
    drawSizeBind.innerHTML = drawSizeSlider.value;

    if(localStorage.getItem("bgAlphaSize") == null) localStorage.setItem("bgAlphaSize", 1)
    bgAlphaSizeSlider.value = localStorage.getItem("bgAlphaSize");
    bgAlphaSizeBind.innerHTML = bgAlphaSizeSlider.value;

    if(localStorage.getItem("drawColor") == null) {localStorage.setItem("drawColor", '#000000');}
    document.getElementById("draw-color").value = localStorage.getItem("drawColor");
    drawColor = hexTorgb(localStorage.getItem("drawColor"));
    console.log(drawColor);

    if(localStorage.getItem("backgroundColor") == null) {localStorage.setItem("backgroundColor", '#FFFFFF');}
    document.getElementById("background-color").value = localStorage.getItem("backgroundColor");
    backgroundColor = hexTorgb(localStorage.getItem("backgroundColor"));
    console.log(backgroundColor);


    if(localStorage.getItem("draw") == null) localStorage.setItem("draw", true);
    if(localStorage.getItem("draw") == 'true') handleButtonInput(document.getElementById("draw"));
    if(localStorage.getItem("draw") == 'false') handleButtonInput(document.getElementById("erase"));

    if(localStorage.getItem("brushType") == null) localStorage.setItem("brushType", 0);
    if(localStorage.getItem("brushType") == 0) handleButtonInput(document.getElementById("circle-type"));
    if(localStorage.getItem("brushType") == 1) handleButtonInput(document.getElementById("square-type"));

    initCanvas();
}

const handleHeaderAction = (action) => {
  console.log(action)
}

//canvas zoom
let scaleFactor = 1.0;
let zoomIncrement = 0.1;
let zoomTimeout;

canvas.addEventListener('wheel', function(event) {
  event.preventDefault(); // Prevent default scroll behavior

  if (event.deltaY < 0) {
      // Scrolling up, zoom in
      scaleFactor += zoomIncrement;
  } else {
      // Scrolling down, zoom out
      if (scaleFactor > zoomIncrement) {
          scaleFactor -= zoomIncrement;
      }
  }

  applyZoom();
});

function zoomIn() {
    scaleFactor += zoomIncrement;
    applyZoom();
    zoomTimeout = setTimeout(zoomIn, 100);
}

function zoomOut() {
    if (scaleFactor > zoomIncrement) {
        scaleFactor -= zoomIncrement;
        applyZoom();
        zoomTimeout = setTimeout(zoomOut, 100);
    }
}

function stopZoom() {
    clearTimeout(zoomTimeout);
}

function applyZoom() {
    canvas.style.transform = `scale(${clamp(scaleFactor, 0.1, 100)})`;
    gridCanvas.style.transform = `scale(${clamp(scaleFactor, 0.1, 100)})`;
}
//end canvas zoom

//draw size slider
drawSizeSlider.oninput = function() {
    drawSizeBind.innerHTML = this.value;
    drawSize = this.value;
    localStorage.setItem("drawSize", this.value);
    drawSizeSlider.setAttribute("value", this.value);
}

//blur size slider
blurSizeSlider.oninput = function() {
    blurSizeBind.innerHTML = this.value;
    blurSize = this.value;
    localStorage.setItem("blurSize", this.value);
    blurSizeSlider.setAttribute("value", this.value);
}

//bg alpha size slider
bgAlphaSizeSlider.oninput = function() {
  bgAlphaSizeBind.innerHTML = this.value;
  bgAlphaSize = this.value;
  localStorage.setItem("bgAlphaSize", this.value);
  bgAlphaSizeSlider.setAttribute("value", this.value);
}

bgAlphaSizeSlider.onchange = function() {
  initCanvas();
}

//handle button inputs
function handleButtonInput(button) {
    if (button.dataset.group != null) {
        if (button.dataset.active === "false") {
            button.dataset.active = "true";
            
            document.querySelectorAll(".paint-button").forEach(element => {
                if (element !== button && element.dataset.group === button.dataset.group) {
                    element.dataset.active = "false";
                }
            });
            //button events
            if(button.id === "draw") {draw = true; localStorage.setItem("draw", true);}
            if(button.id === "erase") {draw = false; localStorage.setItem("draw", false);}
            if(button.id === "circle-type") {brushType = 0; localStorage.setItem("brushType", 0);}
            if(button.id === "square-type") {brushType = 1; localStorage.setItem("brushType", 1);}
        }
    }
}

function handleNumberInput(input) {
  const value = input.value.trim();
  const min = parseInt(input.min);
  const max = parseInt(input.max);

  if (value === '') return;

  const numericValue = parseInt(value);
  if (isNaN(numericValue) || numericValue < min) {
    input.value = min;
    input.setAttribute("value", min);
  } else if (numericValue > max) {
    input.value = max;
    input.setAttribute("value", max);
  } else {
    input.value = numericValue;
    input.setAttribute("value", numericValue);
  }

  // Handle canvas size change
  if (input.dataset.action === "canvas-size") {
    if (input.id === "canvas-size-width") {
      canvas.style.width = `${input.value}px`;
      canvas.width = input.value;
      gridCanvas.style.width = `${input.value}px`;
      gridCanvas.width = input.value;
    }
    if (input.id === "canvas-size-height") {
      canvas.style.height = `${input.value}px`;
      canvas.height = input.value;
      gridCanvas.style.height = `${input.value}px`;
      gridCanvas.height = input.value;
    }

    // Redraw the grid
    redrawGrid();
  }
}

function redrawGrid() {
  const ctx = gridCanvas.getContext("2d");

  // Set up the grid pattern
  const gridSize = 20; // Change this value according to your grid size
  const numCols = Math.ceil(gridCanvas.width / gridSize);
  const numRows = Math.ceil(gridCanvas.height / gridSize);

  ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  ctx.fillStyle = "#ccc"; // Color for the grid pattern
  ctx.globalAlpha = 0.2; // Set the transparency for the grid

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      if ((col + row) % 2 === 0) {
        ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      }
    }
  }

  ctx.globalAlpha = 1; // Reset the alpha value
}


let colorChangingTimeout;

function handleBackgroundColorChange(input) {
  if (input.dataset.action === 'background-color') {
    clearTimeout(colorChangingTimeout);

    colorChangingTimeout = setTimeout(() => {
      backgroundColor = hexTorgb(input.value);
      localStorage.setItem("backgroundColor", input.value);
      initCanvas();
    }, 300);
  }
}

function handleColorInput(input) {
  if (input.dataset.action === 'draw-color') {
    drawColor = hexTorgb(input.value);
    localStorage.setItem("drawColor", input.value);
  }

  handleBackgroundColorChange(input);
}

const colorInputs = document.querySelectorAll('.paint-color');
colorInputs.forEach(input => {
  input.addEventListener('input', () => {
    handleColorInput(input);
  });

  input.addEventListener('change', () => {
    handleColorInput(input);
  });
});
  
//start canvas logic
const ctx = canvas.getContext("2d");
const gridCanvas = document.getElementById('grid-canvas');
const ctxGrid = gridCanvas.getContext('2d');

let drawnContent = [];

const devicePixelRatio = window.devicePixelRatio || 1;
const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                          ctx.mozBackingStorePixelRatio ||
                          ctx.msBackingStorePixelRatio ||
                          ctx.oBackingStorePixelRatio ||
                          ctx.backingStorePixelRatio || 1;
const ratio = devicePixelRatio / backingStoreRatio;

canvas.width = canvas.clientWidth * ratio;
canvas.height = canvas.clientHeight * ratio;
gridCanvas.width = canvas.width;
gridCanvas.height = canvas.height;
ctx.scale(ratio, ratio);
ctxGrid.scale(ratio, ratio);

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function spawnCircle(locationX, locationY, size) {
  const minCanvasSize = Math.min(canvas.width, canvas.height);
  const drawSize = Math.min(size, minCanvasSize);
  ctx.imageSmoothingEnabled = true;
  ctx.beginPath();
  blobs++;

  if (!draw) {
    ctx.globalCompositeOperation = 'destination-out'; // Use destination-out to erase
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Fill style is irrelevant for erasing

    switch (brushType) {
      case 0:
        ctx.arc(locationX, locationY, drawSize / 2, 0, Math.PI * 2);
        ctx.fill();
        storeDrawnShape(locationX, locationY, drawSize, ctx.fillStyle, 'erase', true);
        break;
      case 1:
        ctx.fillRect(locationX - drawSize / 2, locationY - drawSize / 2, drawSize, drawSize);
        storeDrawnShape(locationX, locationY, drawSize, ctx.fillStyle, 'erase', true);
        break;
      default:
        break;
    }
    
    ctx.globalCompositeOperation = 'source-over'; // Reset composite operation for normal drawing
  } else {
    ctx.fillStyle = `rgba(${drawColor[0]}, ${drawColor[1]}, ${drawColor[2]}, ${bgAlphaSize})`;
    
    switch (brushType) {
      case 0:
        ctx.arc(locationX, locationY, drawSize / 2, 0, Math.PI * 2);
        storeDrawnShape(locationX, locationY, drawSize, ctx.fillStyle, 'circle');
        break;
      case 1:
        ctx.fillRect(locationX - drawSize / 2, locationY - drawSize / 2, drawSize, drawSize);
        storeDrawnShape(locationX, locationY, drawSize, ctx.fillStyle, 'square');
        break;
      default:
        break;
    }
    
    ctx.fill();
  }
}

function clearCanvas(color, alpha) {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the background and the stored non-erased content
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 1; // Reset alpha for drawing shapes

  // Redraw only non-erased content on top of the new background
  drawnContent.forEach(shape => {
    if (!shape.isErase) {
      ctx.fillStyle = shape.color;
      if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape.type === 'square') {
        ctx.fillRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
      }
    }
  });
}

const initCanvas = () => {
  clearCanvas(`rgba(0, 0, 0, 0)`, bgAlphaSize); // Set transparent background
  console.log("Canvas initialized");
}

function updateDisplay(event) {
  const mousePos = getMousePos(canvas, event);
  const drawSize = parseInt(document.getElementById("draw-size").value);
  canvas.setAttribute("busy", isDrawing);
  canvas.setAttribute("blobs", blobs);

  if (draw) {
    ctx.fillStyle = `rgb(${drawColor[0]}, ${drawColor[1]}, ${drawColor[2]})`;
    spawnCircle(mousePos.x, mousePos.y, drawSize);
  } 
  else {
    ctx.fillStyle = `rgba(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]}, ${bgAlphaSize})`;
    spawnCircle(mousePos.x, mousePos.y, drawSize);
  } 
}

canvas.addEventListener("mousedown", (event) => {
    if (event.button === 0) { //left mouse button (button index 0)
      isDrawing = true;
      updateDisplay(event);
    }
});

canvas.addEventListener("mouseup", (event) => {
  if (event.button === 0) { //left mouse button (button index 0)
    isDrawing = false;
    updateDisplay(event);
  }
});

const throttledUpdateDisplay = _.throttle(updateDisplay, 0);

canvas.addEventListener("mousemove", (event) => {
  if (event.buttons === 1) {
    throttledUpdateDisplay(event);
  }
});

function storeDrawnShape(locationX, locationY, size, color, type, isErase) {
  drawnContent.push({
    x: locationX,
    y: locationY,
    size: size,
    color: color,
    type: type,
    isErase: isErase // Include an indicator for erasures
  });
}

// Function to draw the alpha grid
function drawAlphaGrid() {
  const gridSize = 20; // Size of each grid square
  const numCols = Math.ceil(gridCanvas.width / gridSize);
  const numRows = Math.ceil(gridCanvas.height / gridSize);

  ctxGrid.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  ctxGrid.fillStyle = 'rgba(204, 204, 204, 0.2)'; // Color and transparency for the grid pattern

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      if ((col + row) % 2 === 0) {
        ctxGrid.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      }
    }
  }
}

// Call the function to draw the alpha grid
drawAlphaGrid();
initCanvas();
//end canvas logic
