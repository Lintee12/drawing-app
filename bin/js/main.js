"use strict";
//to add: loading images from computer to edit, more hotkeys, pixel art mode(no AA), brush preview(working on)
const drawButton = document.getElementById("draw");
const eraseButton = document.getElementById("erase");

const drawSizeSlider = document.getElementById("draw-size");
const drawSizeBind = document.getElementById("draw-size-bind");

const canvas = document.getElementById("canvas");
//const defaultCanvas = [window.screen.availWidth, window.screen.availHeight];
const defaultCanvas = [512, 512];

const gridCanvas = document.getElementById('grid-canvas');
let gridSize = 16;

let draw = true;
let drawSize = localStorage.getItem("drawSize");
let brushType = 0;
let drawColor = [0, 0, 0];
let mainAlphaSize = 255;

let blobs = 1;
let isDrawing;

//load values from storage
window.onload = () => {
    canvas.setAttribute("style", `width:${defaultCanvas[0]}px; height:${defaultCanvas[1]}px;`)
    gridCanvas.setAttribute("style", `width:${defaultCanvas[0]}px; height:${defaultCanvas[1]}px;`)
    document.getElementById("canvas-size-width").value = defaultCanvas[0];
    document.getElementById("canvas-size-height").value = defaultCanvas[1];
    canvas.width = defaultCanvas[0];
    canvas.height = defaultCanvas[1];
    gridCanvas.width = defaultCanvas[0];
    gridCanvas.height = defaultCanvas[1];

    if(localStorage.getItem("drawSize") == null) localStorage.setItem("drawSize", 18)
    drawSizeSlider.value = localStorage.getItem("drawSize");
    drawSizeBind.innerHTML = drawSizeSlider.value;

    if(localStorage.getItem("drawColor") == null) {localStorage.setItem("drawColor", '#000000');}
    document.getElementById("draw-color").value = localStorage.getItem("drawColor");
    drawColor = hexTorgb(localStorage.getItem("drawColor"));
    console.log(drawColor);

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
    redrawGrid();
    adjustHeader()
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
    case 'import':
      importImage();
      console.log("import");
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

document.addEventListener('keydown', function(event) {
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
  //handle grid size change
  if(input.dataset.action === "grid-size") {
    gridSize = input.value;
    redrawGrid();
  }
}

function submitNumberInput(input) {
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
    initCanvas();
  }
}

function redrawGrid() {
  console.log("drawing grid")
  const ctx = gridCanvas.getContext("2d");

  const numCols = Math.ceil(gridCanvas.width / gridSize);
  const numRows = Math.ceil(gridCanvas.height / gridSize);

  ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  ctx.fillStyle = "#3B3B3B"; //grid color
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

function handleColorInput(input) {
  if (input.dataset.action === 'draw-color') {
    drawColor = hexTorgb(input.value);
    localStorage.setItem("drawColor", input.value);
  };
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
const ctxGrid = gridCanvas.getContext('2d');

let drawnContent = [];

ctx.canvas.willReadFrequently = true;
ctx.imageSmoothingEnabled = true;

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

function clearCanvas(color, alpha) {
  //clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //draw the background and the stored non-erased content
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 1;

  redrawContent();
}

const initCanvas = () => {
  clearCanvas(`rgba(0, 0, 0, 0)`, mainAlphaSize); //make transparent background
  console.log("Canvas initialized");
  blobs = drawnContent.length + 1;
}

// Redraw all content
function redrawContent() {
  drawnContent.forEach(strokeData => {
    const { brushType, drawSize, strokeStyle, capType, joinType, GCO, path } = strokeData;

    ctx.lineWidth = clamp(drawSize / 2, 0, 255);
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = capType;
    ctx.lineJoin = joinType;
    ctx.globalCompositeOperation = GCO;

    if (path.length > 0) {
      const startPoint = path[0];
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);

      path.forEach(point => {
        if (brushType === 0) { //circle
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        } 
        else if (brushType === 1) { //square
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      });
    }
  });
}


let currentPath = [];
let currentStroke = {
  brushType: 0,
  drawSize: 0,
  strokeStyle: 0,
  capType: 0,
  joinType: 0,
  GCO: 0,
  path: 0
};

function startStroke(event) {
  const { x, y } = getMousePos(canvas, event);
  ctx.lineWidth = clamp(drawSize / 2, 1, 255);
  if(draw) { //draw mode
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = `rgb(${drawColor[0]}, ${drawColor[1]}, ${drawColor[2]})`;
  }
  else { //erase mode
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = `rgba(0, 0, 0, ${mainAlphaSize})`;
  }
  if (brushType === 0) { //circle
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round'
    ctx.beginPath();
    ctx.moveTo(x, y);
  } 
  else if (brushType === 1) { //square
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round'
    ctx.beginPath();
    ctx.moveTo(x, y);
    //ctx.strokeRect(x, y, drawSize / 1000, drawSize / 1000);
  }

  currentPath = [{ x, y }];
  currentStroke = {
    brushType: brushType,
    drawSize: drawSize,
    strokeStyle: ctx.strokeStyle,
    capType: ctx.lineCap,
    joinType: ctx.lineJoin,
    GCO: ctx.globalCompositeOperation,
    path: currentPath.slice(),
  };
}

function drawStroke(event) {
  const { x, y } = getMousePos(canvas, event);

  if (brushType === 0) { //circle
    ctx.lineTo(x, y);
    ctx.stroke();
  } 
  else if (brushType === 1) { //sqaure
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  currentPath.push({ x, y });
  currentStroke.path = currentPath.slice();
}

function endStroke() {
  drawnContent.push(currentStroke);
  console.log("stroke end");
}

canvas.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    isDrawing = true;
    startStroke(event);
    drawStroke(event);
  }
});

canvas.addEventListener("mouseup", (event) => {
  if (event.button === 0) {
    isDrawing = false;
    endStroke();
  }
});

canvas.addEventListener("mousemove", (event) => {
  if (isDrawing) {
    drawStroke(event);
  }
});