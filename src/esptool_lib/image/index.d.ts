import { ROM } from "../targets/rom";
import { BaseFirmwareImage } from "./base";
/**
 * Function to load a firmware image from a string (from FileReader)
 * @param {ROM} rom - The ROM object representing the target device
 * @param imageData Image data as a string
 * @returns {Promise<BaseFirmwareImage>} - A promise that resolves to the loaded firmware image
 */
export declare function loadFirmwareImage(rom: ROM, imageData: string): Promise<BaseFirmwareImage>;
