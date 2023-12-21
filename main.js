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

let blobs = 1;
let isDrawing;

const defaultCanvas = [512, 512];

//MAKE BACKGROUND FILL WITH WHITE IF ALPHA MODE NOT ON IF ALPHA MODE ON LEAVE AS IS AND MAKE ERASE SET BACKGROUUND TO TRASNPARENT
//MAKE TOOLBAR SCROLL

//NEXT: undo feature

//REMOVE OR FIX UNUSED FEATURES

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

    const allMenus = document.querySelectorAll('.dropdown-menu');
    allMenus.forEach(menu => {
        menu.style.display = 'none';
    });
    initCanvas();
}

let transactionHistory = []; // Array to save transaction history
let redoHistory = []; // Array to save undone transactions

function pushTransaction(action, element) {
  transactionHistory.push({ action, element });
}

function undo() {
  if (transactionHistory.length > 0) {
    const lastAction = transactionHistory.pop();
    if (lastAction.action === 'add') {
      const elementToRemove = lastAction.element;
      const indexToRemove = drawnContent.findIndex(element => JSON.stringify(element) === JSON.stringify(elementToRemove));
      if (indexToRemove !== -1) {
        drawnContent.splice(indexToRemove, 1);
        redoHistory.push(lastAction);
        console.log("Element removed:", elementToRemove);
      }
    } else if (lastAction.action === 'remove') {
      drawnContent.push(lastAction.element);
      redoHistory.push(lastAction);
      console.log("Element added:", lastAction.element);
    }
    initCanvas();
  } else {
    console.log("Nothing to undo");
  }
}

function redo() {
  if (redoHistory.length > 0) {
    const lastUndoneAction = redoHistory.pop();
    if (lastUndoneAction.action === 'add') {
      drawnContent.push(lastUndoneAction.element);
      transactionHistory.push(lastUndoneAction);
      console.log("Redo element added:", lastUndoneAction.element);
    } else if (lastUndoneAction.action === 'remove') {
      const elementToRemove = lastUndoneAction.element;
      const indexToRemove = drawnContent.findIndex(element => JSON.stringify(element) === JSON.stringify(elementToRemove));
      if (indexToRemove !== -1) {
        drawnContent.splice(indexToRemove, 1);
        transactionHistory.push(lastUndoneAction);
        console.log("Redo element removed:", elementToRemove);
      }
    }
    initCanvas();
    blobs = drawnContent.length + 1;
  } else {
    console.log("Nothing to redo");
  }
}

function addTransaction(locationX, locationY, size, color, type, isErase) {
  const element = {
    x: locationX,
    y: locationY,
    size: size,
    color: color,
    type: type,
    isErase: isErase
  };
  pushTransaction('add', element);
}

const handleHeaderAction = (action) => {
  const allMenus = document.querySelectorAll('.dropdown-menu');
  allMenus.forEach(menu => {
      menu.style.display = 'none';
      menu.removeEventListener('mouseleave', hideMenu); // Remove any previous event listener
  });

  const menu = document.getElementById(`${action}-menu`);
  if (menu) {
      const button = document.querySelector(`button[aria-label="${action}"]`);
      const rect = button.getBoundingClientRect();

      // Calculate the horizontal center position
      const buttonWidth = rect.width;
      const menuWidth = menu.offsetWidth;
      const centerPosition = rect.left + (buttonWidth / 0) - (menuWidth / 2);

      // Position the menu horizontally centered below the button
      menu.style.position = 'absolute';
      menu.style.left = `${centerPosition}px`;
      menu.style.top = rect.bottom + 'px';
      menu.style.display = 'flex';
      menu.style.zIndex = 9999;

      // Add event listener to hide menu on mouse leave
      menu.addEventListener('mouseleave', hideMenu);
  }
}

const handleHeaderSubAction = (action) => {
  switch (action) {
    case 'new-file':
      window.location.reload();
      break;
    case 'save':
      saveCanvasAsImage();
      break;
    case 'save-as':
      saveCanvasAsImage();
      break;
    case 'exit':
      closeWindow();
      break;
    case 'undo':
      undo();
      break;
    case 'redo':
      redo();
      break;
    case 'zoom-in':
      console.log(`Zoom: ${canvas.style.transform}`);
      break;
    case 'zoom-out':
      console.log(`Zoom: ${canvas.style.transform}`);
      break;
    default:
      break;
  }
}

function closeWindow() {
  let new_window = open(location, '_self');
  new_window.close();
  return false;
}

const hideMenu = (event) => {
  event.target.style.display = 'none';
}

//canvas zoom
let scaleFactor = 1.0;
let zoomIncrement = 0.1;
let zoomTimeout;

canvas.addEventListener('wheel', function(event) {
  event.preventDefault();

  if (event.deltaY < 0) {
      //zoom in
      scaleFactor += zoomIncrement;
  } else {
      //zoom out
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

document.addEventListener('keydown', function(event) {
  // Check if Ctrl+S (or Command+S for Mac) is pressed
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    saveCanvasAsImage();
  }
});

function saveCanvasAsImage() {
  const canvas = document.getElementById('canvas');
  
  const dataURL = canvas.toDataURL('image/png');

  const link = document.createElement('a');
  link.download = 'image.png';
  link.href = dataURL;

  link.click();
}

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

  //handle canvas size change
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

    redrawGrid();
  }
}

function redrawGrid() {
  const ctx = gridCanvas.getContext("2d");

  const gridSize = 20;
  const numCols = Math.ceil(gridCanvas.width / gridSize);
  const numRows = Math.ceil(gridCanvas.height / gridSize);

  ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  ctx.fillStyle = "#ccc"; //grid color
  ctx.globalAlpha = 0.2;

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      if ((col + row) % 2 === 0) {
        ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      }
    }
  }

  ctx.globalAlpha = 1; //reset the alpha value
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

  if (!draw) {
    ctx.globalCompositeOperation = 'destination-out'; //for erase
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'; //eraase is transparent right now

    switch (brushType) {
      case 0:
        ctx.arc(locationX, locationY, drawSize / 2, 0, Math.PI * 2);
        ctx.fill();
        storeDrawnShape(locationX, locationY, drawSize, ctx.fillStyle, 'erase', true);
        addTransaction(locationX, locationY, drawSize, ctx.fillStyle, 'erase', true); //for undo/redo
        break;
      case 1:
        ctx.fillRect(locationX - drawSize / 2, locationY - drawSize / 2, drawSize, drawSize);
        storeDrawnShape(locationX, locationY, drawSize, ctx.fillStyle, 'erase', true);
        addTransaction(locationX, locationY, drawSize, ctx.fillStyle, 'erase', true); //for undo/redo
        break;
      default:
        break;
    }
    
    ctx.globalCompositeOperation = 'source-over'; //normal drawiing
  } 
  else {
    ctx.fillStyle = `rgba(${drawColor[0]}, ${drawColor[1]}, ${drawColor[2]}, ${bgAlphaSize})`;
    
    switch (brushType) {
      case 0:
        ctx.arc(locationX, locationY, drawSize / 2, 0, Math.PI * 2);
        storeDrawnShape(locationX, locationY, drawSize, ctx.fillStyle, 'circle');
        addTransaction(locationX, locationY, drawSize, ctx.fillStyle, 'circle'); //for undo/redo
        break;
      case 1:
        ctx.fillRect(locationX - drawSize / 2, locationY - drawSize / 2, drawSize, drawSize);
        storeDrawnShape(locationX, locationY, drawSize, ctx.fillStyle, 'square');
        addTransaction(locationX, locationY, drawSize, ctx.fillStyle, 'square'); //for undo/redo
        break;
      default:
        break;
    }
    
    ctx.fill();
  }
  blobs = drawnContent.length + 1;
}

function clearCanvas(color, alpha) {
  //clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //draw the background and the stored non-erased content
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 1;

  //redraw only non-erased content on top of the new background
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
  clearCanvas(`rgba(0, 0, 0, 0)`, bgAlphaSize); //make transparent background
  console.log("Canvas initialized");
  blobs = drawnContent.length + 1;
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
    if (event.button === 0) { //left mouse button
      isDrawing = true;
      updateDisplay(event);
    }
});

canvas.addEventListener("mouseup", (event) => {
  if (event.button === 0) { //left mouse button
    isDrawing = false;
    //updateDisplay(event);
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
    isErase: isErase //shape is eraseer
  });
}

function drawAlphaGrid() {
  const gridSize = 20; //for grid square
  const numCols = Math.ceil(gridCanvas.width / gridSize);
  const numRows = Math.ceil(gridCanvas.height / gridSize);

  ctxGrid.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  ctxGrid.fillStyle = 'rgba(204, 204, 204, 0.2)'; //fill for the grid pattern

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      if ((col + row) % 2 === 0) {
        ctxGrid.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      }
    }
  }
}
drawAlphaGrid();
initCanvas();