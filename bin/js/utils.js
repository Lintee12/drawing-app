"use strict";
const hexTorgb = (hex) => ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);