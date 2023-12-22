//let transactionHistory = []; // Array to save transaction history
let redoHistory = []; // Array to save undone transactions

function undo() {
  if (drawnContent.length > 0) {
    redoHistory.push(drawnContent.pop());
    initCanvas();
  } else {
    console.log("Nothing to undo");
  }
}

function redo() {
  if (redoHistory.length > 0) {
    drawnContent.push(redoHistory.pop());
    initCanvas();
  } else {
    console.log("Nothing to redo");
  }
}