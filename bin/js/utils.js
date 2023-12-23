"use strict";
const hexTorgb = (hex) => ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];

function importImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', function() {
        const file = input.files[0];
        
        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const imgElement = new Image();
                imgElement.onload = function() {
                    const canvas = document.getElementById("canvas");
                    const ctx = canvas.getContext('2d');

                    canvas.style.width = `${imgElement.width}px`;
                    canvas.width = imgElement.width;
                    gridCanvas.style.width = `${imgElement.width}px`;
                    gridCanvas.width = imgElement.width;

                    canvas.style.height = `${imgElement.height}px`;
                    canvas.height = imgElement.height;
                    gridCanvas.style.height = `${imgElement.height}px`;
                    gridCanvas.height = imgElement.height;
                    document.getElementById("canvas-size-width").value = imgElement.width;
                    document.getElementById("canvas-size-height").value = imgElement.height;
                    redrawGrid();
                    initCanvas();

                    // Draw the image onto the canvas
                    ctx.drawImage(imgElement, 0, 0);
                };
                imgElement.src = event.target.result;
            };

            reader.readAsDataURL(file);
        }
    });

    input.click();
}
