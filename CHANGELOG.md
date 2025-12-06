# Changelog
## 1.0.7
- Switched flashing to use [WebSerial_ESPTool](https://github.com/Jason2866/WebSerial_ESPTool/tree/development) by Jason2866
- Added higher baud rate selection, proposed in ([issue #46](https://github.com/thelastoutpostworkshop/ESPConnect/issues/46)).
## 1.0.6
- Replaced esptool.js for [WebSerial_ESPTool](https://github.com/Jason2866/WebSerial_ESPTool/tree/development) by Jason2866
- LittleFS now supports folder and navigation, proposed in ([issue #31](https://github.com/thelastoutpostworkshop/ESPConnect/issues/31)).
- Fixed Peripherals section under Device Info has overlapping text ([issue #32](https://github.com/thelastoutpostworkshop/ESPConnect/issues/32)).

## 1.0.5
- Added PWM/LEDC capabilities to Device Info with tooltip context; values are based on chip family lookups. Proposed in ([issue #16](https://github.com/thelastoutpostworkshop/ESPConnect/issues/16)).
- Flush serial input before handshake and partition reads to avoid stale data when swapping boards.
- Added a Dockerfile proposed in ([issue #30](https://github.com/thelastoutpostworkshop/ESPConnect/issues/30)).
- Partition map now falls back to parsing the flash size label to show unused space when byte size isn’t available.

## 1.0.4
- Serial monitor now supports filtering output live via a search box ([issue #12](https://github.com/thelastoutpostworkshop/ESPConnect/issues/12)).
- Partition map keeps very small partitions visible with normalized minimum widths ([issue #20](https://github.com/thelastoutpostworkshop/ESPConnect/issues/20)).
- Device info fact cards now use a packed grid layout to remove excessive gaps.

## 1.0.3
- Added a port-busy warning dialog when the serial device is in use, instead of showing bootloader tips.
- Skipping partition table read for ESP8266 (not supported).
- Improved flash size detection and messaging: when detection fails, the UI now shows "Flash size not detected" instead of "Unknown".
- esptool-js is now embedded directly in the ESPConnect codebase, providing tighter integration, better control over the bootloader workflow, and easier maintenance.

## 1.0.2
- Fix LittleFS not detected ([issue #10](https://github.com/thelastoutpostworkshop/ESPConnect/issues/10)). Many thanks to Jason2866 for the PR.
- Add delayed connection progress dialog (shows after 1s during connect) to improve user feedback.

## 1.0.1
- Fix octal flash size detection (map 0x30-0x3F RDID capacity codes when OCTAL feature present).
