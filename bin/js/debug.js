const logStorage = () => {
    var _lsTotal = 0,
	_xLen, _x;
    for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) {
            continue;
        }
        _xLen = ((localStorage[_x].length + _x.length) * 2);
        _lsTotal += _xLen;
        console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
    };
    console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
}

function storageSizeBytes() {
    let totalSize = 0;

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += ((localStorage[key].length + key.length) * 2);
        }
    }return totalSize;
}

function storageSizeKilobytes() {
    let totalSize = 0;

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += ((localStorage[key].length + key.length) * 2);
        }
    }return totalSize / 1000;
}

function storageSizeMegabytes() {
    let totalSize = 0;

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += ((localStorage[key].length + key.length) * 2);
        }
    }return totalSize / (1000 * 1000);
}
