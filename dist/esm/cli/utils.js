var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from 'chalk';
let hasError = false;
export const exit = () => {
    process.exit(hasError ? -1 : 0);
};
export const log = (msg) => {
    console.log(chalk.white(msg));
};
export const logError = (msg) => {
    hasError = true;
    console.error(chalk.red(msg));
};
export const tryCatch = (title, fn) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk.cyan(`${title} >`));
    const ret = yield fn();
    console.log(chalk.cyan(`< ${title}`));
    return ret;
});
