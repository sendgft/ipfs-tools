"use strict";
/* eslint-disable import/no-dynamic-require */
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
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const utils_1 = require("./utils");
// load commands
const COMMANDS = glob_1.default.sync(path_1.default.join(__dirname, 'commands', '*.js')).reduce((m, file) => {
    m[path_1.default.basename(file, '.js')] = require(file);
    return m;
}, {});
const renderParams = (params) => {
    return (params || []).reduce((m, { name, typeLabel }) => {
        m.push(`--${name} ${typeLabel || ''}`);
        return m;
    }, []).join(' ');
};
// show usage guide
function helpCommand(comm) {
    if (comm) {
        if (!COMMANDS[comm]) {
            (0, utils_1.logError)(`Unrecognized command: ${comm}`);
        }
        else {
            const { summary, params, options } = COMMANDS[comm].getMeta();
            const sections = [
                {
                    header: `ipfs-tools: ${comm}`,
                    content: summary,
                },
                {
                    header: 'Usage',
                    content: `ipfs-tools ${comm} ${renderParams(params)} ${options ? '[options]' : ''}`
                },
                ...(params ? [{
                        header: 'Parameters',
                        optionList: params,
                    }] : []),
                ...(options ? [{
                        header: 'Options',
                        optionList: options,
                    }] : []),
            ];
            console.log((0, command_line_usage_1.default)(sections));
            (0, utils_1.exit)();
        }
    }
    const sections = [
        {
            header: 'ipfs-tools',
            content: ''
        },
        {
            header: 'Usage',
            content: '$ ipfs-tools <command> [options]'
        },
        {
            header: 'Commands',
            content: Object.entries(COMMANDS).map(([name, { getMeta }]) => ({
                name,
                summary: getMeta().summary,
            })).concat({
                name: 'help',
                summary: 'Print this usage guide. Use "help <command>" for help on a specific command.'
            }),
        }
    ];
    console.log((0, command_line_usage_1.default)(sections));
    (0, utils_1.exit)();
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const { command, _unknown: argv = [] } = (0, command_line_args_1.default)([
            { name: 'command', defaultOption: true }
        ], {
            stopAtFirstUnknown: true
        });
        if ('help' === command) {
            const { commandForHelp } = (0, command_line_args_1.default)([
                { name: 'commandForHelp', defaultOption: true }
            ], { argv });
            helpCommand(commandForHelp);
        }
        if (!COMMANDS[command]) {
            helpCommand(command);
        }
        // command is valid so let's continue
        const { params = [], options = [] } = COMMANDS[command].getMeta();
        let args;
        try {
            const defs = params.concat(options);
            args = defs.length
                ? (0, command_line_args_1.default)(defs, { argv, stopAtFirstUnknown: true })
                : {};
            // invalid args?
            if (args._unknown) {
                throw new Error(`Invalid argument: ${args._unknown}`);
            }
            // check that all param values are provided
            params.forEach(({ name }) => {
                if (undefined === args[name]) {
                    throw new Error(`Missing parameter: ${name}`);
                }
            });
        }
        catch (err) {
            (0, utils_1.logError)(err.message);
            helpCommand(command);
        }
        // execute
        yield COMMANDS[command].execute(args);
    });
}
main().catch(err => {
    (0, utils_1.logError)(err.message);
    if (err.details) {
        (0, utils_1.logError)(Array.isArray(err.details) ? err.details.join('\n') : err.details);
    }
}).finally(() => (0, utils_1.exit)());
