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