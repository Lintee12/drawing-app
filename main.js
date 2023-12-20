const drawButton = document.getElementById("draw");
const eraseButton = document.getElementById("erase");

const drawSizeSlider = document.getElementById("draw-size");
const drawSizeBind = document.getElementById("draw-size-bind");

drawSizeSlider.value = 18;
drawSizeSlider.value = localStorage.getItem("drawSize");
let drawSize = localStorage.getItem("drawSize");
drawSizeBind.innerHTML = drawSizeSlider.value;

const blurSizeSlider = document.getElementById("blur-size");
const blurSizeBind = document.getElementById("blur-size-bind");

blurSizeSlider.value = 0;
blurSizeSlider.value = localStorage.getItem("blurSize");
let blurSize = localStorage.getItem("blurSize");
blurSizeBind.innerHTML = blurSizeSlider.value;

const canvas = document.getElementById("canvas");

let draw = true;

let backgroundColor = [255, 255, 255];
let drawColor = [0, 0, 0];
let brushType = 0;

let blobs = 0;

const defaultCanvas = [512, 512];

//MAKE BACKGROUND FILL WITH WHITE IF ALPHA MODE NOT ON IF ALPHA MODE ON LEAVE AS IS AND MAKE ERASE SET BACKGROUUND TO TRASNPARENT
//MAKE TOOLBAR SCROLL

//NEXT: undo feature and background color change

function hexTorgb(hex) { //convert hex to rgb value
  return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
}

//load values from storage
window.onload = () => {
    canvas.setAttribute("style", `width:${defaultCanvas[0]}px; height:${defaultCanvas[1]}px;`)
    document.getElementById("canvas-size-width").value = defaultCanvas[0];
    document.getElementById("canvas-size-height").value = defaultCanvas[1];
    canvas.width = defaultCanvas[0];
    canvas.height = defaultCanvas[1];

    if(localStorage.getItem("drawColor") == null) {localStorage.setItem("drawColor", '#000000');}
    document.getElementById("draw-color").value = localStorage.getItem("drawColor");
    drawColor = hexTorgb(localStorage.getItem("drawColor"));
    console.log(drawColor);


    if(localStorage.getItem("draw") == null) localStorage.setItem("draw", true);
    if(localStorage.getItem("draw") == 'true') handleButtonInput(document.getElementById("draw"));
    if(localStorage.getItem("draw") == 'false') handleButtonInput(document.getElementById("erase"));

    if(localStorage.getItem("brushType") == null) localStorage.setItem("brushType", 1);
    if(localStorage.getItem("brushType") == 0) handleButtonInput(document.getElementById("circle-type"));
    if(localStorage.getItem("brushType") == 1) handleButtonInput(document.getElementById("square-type"));
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

//validate and handle number inputs
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
    //number input events
    if(input.dataset.action === "canvas-size") {
      if(input.id === "canvas-size-width") {
        canvas.setAttribute("style", `width:${input.value}px; height:${canvas.style.height};`);
        canvas.width = input.value;
      }
      if(input.id === "canvas-size-height") {
        canvas.setAttribute("style", `width:${canvas.style.width}; height:${input.value}px;`);
        canvas.height = input.value;
      }
    }
}

function handleColorInput(input) {
  if(input.dataset.action === 'draw-color') {
    drawColor = hexTorgb(input.value);
    localStorage.setItem("drawColor", input.value);
  }
}
  
//start canvas logic
const ctx = canvas.getContext("2d");

const devicePixelRatio = window.devicePixelRatio || 1;
const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                          ctx.mozBackingStorePixelRatio ||
                          ctx.msBackingStorePixelRatio ||
                          ctx.oBackingStorePixelRatio ||
                          ctx.backingStorePixelRatio || 1;
const ratio = devicePixelRatio / backingStoreRatio;

canvas.width = canvas.clientWidth * ratio;
canvas.height = canvas.clientHeight * ratio;
ctx.scale(ratio, ratio);

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
  switch (brushType) {
    case 0:
      ctx.arc(locationX, locationY, drawSize / 2, 0, Math.PI * 2); //this draws a circle
      break;
    case 1:
      ctx.rect(locationX, locationY, drawSize, drawSize); //this draw a sqare
    default:
      break;
  }
  ctx.fill();
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
    ctx.fillStyle = `rgb(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]})`;
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
  
canvas.addEventListener("mousemove", (event) => {
    if (event.buttons === 1) {
      updateDisplay(event);
    }
});
//end canvas logic
