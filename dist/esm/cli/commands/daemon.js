var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import execa from 'execa';
import path from 'path';
const PATH_TO_CONFIG_FILE = path.join(__dirname, '..', '..', '..', '..', 'data', 'ipfs-local-config.json');
export const getMeta = () => ({
    summary: 'Run local IPFS daemon.',
});
export const execute = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield execa('ipfs', ['config', 'replace', PATH_TO_CONFIG_FILE]);
    const proc = execa('ipfs', ['daemon']);
    (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
    yield proc;
});
