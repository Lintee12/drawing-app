"use strict";
/* drag scroll */
let isRightButtonPressed = false;
let lastX = 0;
let lastY = 0;
let momentumX = 0;
let momentumY = 0;
let animationFrameId = null;
const scrollableDiv = document.getElementById('scrollableDiv');
document.addEventListener('mousedown', function(event) {
	if (event.button === 2) {
		isRightButtonPressed = true;
		lastX = event.clientX;
		lastY = event.clientY;
		momentumX = 0;
		momentumY = 0;
		event.preventDefault();
	}
});
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('mouseup', function(event) {
	if (event.button === 2) {
		isRightButtonPressed = false;
		startMomentumScroll();
	}
});
document.addEventListener('mousemove', function(event) {
	if (isRightButtonPressed) {
		const deltaX = event.clientX - lastX;
		const deltaY = event.clientY - lastY;
		lastX = event.clientX;
		lastY = event.clientY;
		scrollableDiv.scrollLeft += -deltaX;
		scrollableDiv.scrollTop += -deltaY;
		momentumX = -deltaX;
		momentumY = -deltaY;
	}
});

function startMomentumScroll() {
	const ease = .95;

	function animateScroll() {
		if (!isRightButtonPressed && (Math.abs(momentumX) > 0.1 || Math.abs(momentumY) > 0.1)) {
			scrollableDiv.scrollLeft += momentumX;
			scrollableDiv.scrollTop += momentumY;
			momentumX *= ease;
			momentumY *= ease;
			animationFrameId = requestAnimationFrame(animateScroll);
		} else {
			cancelAnimationFrame(animationFrameId);
		}
	}
	animateScroll();
}
/* end drag scroll */

/* canvas zoom */
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
    zoomTimeout = setTimeout(zoomIn, 100); //zoomTimeout = setTimeout(zoomOut, 100); //this is causing issue when zooming with buttons
	applyZoom();
}

function zoomOut() {
    if (scaleFactor > zoomIncrement) {
        scaleFactor -= zoomIncrement;
        applyZoom();
        zoomTimeout = setTimeout(zoomOut, 100); //this is causing issue when zooming with buttons
    }
	applyZoom();
}

function stopZoom() {
    clearTimeout(zoomTimeout); //this is causing issue when zooming with buttons
}

function applyZoom() {
    canvas.style.transform = `scale(${clamp(scaleFactor, 0.1, 100)})`;
    gridCanvas.style.transform = `scale(${clamp(scaleFactor, 0.1, 100)})`;
	document.getElementsByClassName("zoom-value")[0].innerHTML = `${clamp(Math.round(scaleFactor * 100), 10, 999999)}%`;
}
document.getElementsByClassName("zoom-value")[0].innerHTML = `${clamp(Math.round(scaleFactor * 100), 10, 999999)}%`;
/* end canvas zoom */