"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructGatewayUrl = exports.tryCatch = exports.logError = exports.log = exports.exit = void 0;
const chalk_1 = __importDefault(require("chalk"));
let hasError = false;
const exit = () => {
    process.exit(hasError ? -1 : 0);
};
exports.exit = exit;
const log = (msg) => {
    console.log(chalk_1.default.white(msg));
};
exports.log = log;
const logError = (msg) => {
    hasError = true;
    console.error(chalk_1.default.red(msg));
};
exports.logError = logError;
const tryCatch = (title, fn) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk_1.default.cyan(`${title} >`));
    const ret = yield fn();
    console.log(chalk_1.default.cyan(`< ${title}`));
    return ret;
});
exports.tryCatch = tryCatch;
const constructGatewayUrl = (gatewayBaseUrl, cid) => {
    if (gatewayBaseUrl.charAt(gatewayBaseUrl.length - 1) !== '/') {
        gatewayBaseUrl += '/';
    }
    return `${gatewayBaseUrl}${cid}`;
};
exports.constructGatewayUrl = constructGatewayUrl;
