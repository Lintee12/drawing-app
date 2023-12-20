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

document.addEventListener('contextmenu', event => event.preventDefault()); //sorry, this will be optional later...

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
  const ease = .95; // Adjust this value for momentum speed

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
