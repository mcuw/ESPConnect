import { ESP8266ROM } from "../targets/esp8266";
import { BaseFirmwareImage } from "./base";
export declare class ESP8266ROMFirmwareImage extends BaseFirmwareImage {
    version: number;
    ROM_LOADER: ESP8266ROM;
    constructor(rom: ESP8266ROM, loadFile?: string | null);
    loadFromFile(file: string): void;
    defaultOutputName(inputFile: string): string;
}
export declare class ESP8266V2FirmwareImage extends BaseFirmwareImage {
    static readonly IMAGE_V2_MAGIC = 234;
    static readonly IMAGE_V2_SEGMENT = 4;
    version: number;
    ROM_LOADER: ESP8266ROM;
    constructor(rom: ESP8266ROM, loadFile?: string | null);
    loadFromFile(fileStr: string): Promise<void>;
    defaultOutputName(inputFile: string): string;
}
