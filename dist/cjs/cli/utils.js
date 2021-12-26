"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.exit = void 0;
const chalk_1 = __importDefault(require("chalk"));
let hasError = false;
const exit = () => {
    process.exit(hasError ? -1 : 0);
};
exports.exit = exit;
const logError = (msg) => {
    hasError = true;
    console.error(chalk_1.default.red(msg));
};
exports.logError = logError;
