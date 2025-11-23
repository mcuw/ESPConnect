[<img src="https://github.com/thelastoutpostworkshop/images/blob/main/ESPConnect-github.png">](https://youtu.be/-nhDKzBxHiI)
# ESPConnect

ESPConnect is a browser-based control center for ESP32- and ESP8266-class boards. It runs entirely inside a modern Chromium browser so you can inspect hardware details, manage SPIFFS files, back up flash, and deploy firmware without installing desktop software.
- [Tutorial](https://youtu.be/-nhDKzBxHiI)
- [Web application] (https://thelastoutpostworkshop.github.io/microcontroller_devkit/espconnect/)

## What You Need
- Chrome, Edge, Brave, Arc, or another Chromium browser based on version 89 or newer.  
- An ESP32, ESP32-C3, ESP32-S2, ESP32-S3, ESP32-C6, ESP32-H2, ESP32-C5, ESP32-P4, or ESP8266 board connected over USB.  
- A USB cable with data lines. If your board lacks automatic reset wiring, the app walks you through entering the bootloader manually.

## Quick Start
1. Open ESPConnect (either the hosted version or a local copy served over `https://` or `http://localhost`).  
2. Click **Connect** and choose your device when the browser asks for permission.  
3. After the handshake completes, the navigation drawer unlocks every tool: Device Info, Partitions, SPIFFS, Apps, Flash, Console, and Logs.  
4. Use **Disconnect** whenever you want to free the USB port for another application.

### LittleFS WASM module
- If you build custom LittleFS tooling, drop the vendor `index.js`, `index.d.ts`, and `littlefs.wasm` into `public/wasm/littlefs/`.  
- Those filenames are ignored by Git, so they stay local while the README inside that folder explains the expected layout.

## Feature Overview

### Device & flash awareness
- **Device Info tab** – live summary of chip family, revision, MAC address, flash size, crystal frequency, capabilities, and curated fact groups. A “No device connected” card appears automatically when nothing is attached.  
- **Partitions tab** – graphical map plus a detailed table of every partition entry, including sizes, offsets, and unused flash so you can double-check layout decisions before flashing.

### SPIFFS file manager
- Browse the active SPIFFS partition with instant text filtering, pagination controls, and a running “X of Y files” indicator.  
- Upload by file picker or drag-and-drop; the app checks available space and blocks oversized files before they transfer.  
- Run full SPIFFS backups, restore an image, or format the partition (after confirming you have a backup).  
- Stage edits locally, then push them down with **Save to Flash** once you are satisfied.  
- Preview UTF‑8 text (JSON, HTML, logs, etc.), render images inline, and listen to audio formats such as MP3, WAV, OGG/Opus, AAC/M4A, FLAC, and WebM—all without leaving the browser.  
- Download or delete individual files, and keep an eye on usage gauges that show used, free, and total bytes.

### OTA slot insights
- **Apps tab** – inspect application slots/OTA partitions. See which slot is active along with build metadata, sizes, and other identifying details so you always know what firmware is currently running and what is staged next.

### Flash & maintenance workspace
- **Flash Firmware** – load any `.bin`, pick from common offset presets, optionally erase the entire chip, and watch progress through detailed dialogs.  
- **Backups & downloads** – capture individual partitions, the whole partition table, only the used areas of flash, or arbitrary regions you specify.  
- **Integrity checks** – supply an offset and length to compute MD5 hashes for quick validation of what is stored on the device.  
- **Register access** – read or write hardware registers directly using the integrated guide of addresses and descriptions.  
- **Control actions** – cancel long transfers, stop backups, erase flash, or save staged SPIFFS changes with clear confirmations and progress indicators.

### Live monitoring & history
- **Serial Monitor tab** – stream UART output, send commands, clear the console, change baud rate, or reset the board right from the browser.  
- **Session Log tab** – chronological ledger of connects, flashes, downloads, and warnings. Clear it whenever you want a clean slate.

## Tips & Troubleshooting
- If automatic boot entry fails, hold **BOOT**, tap **RESET**, keep holding **BOOT** while clicking **Connect**, then release when you see the ESP-ROM banner.  
- Only one application can use the USB serial bridge at a time. Close Arduino IDE, PlatformIO, or other tools before connecting.  
- You can change baud rate even after connecting. If transfers stall, drop to 460800 or 115200 bps.  
- Cancelling a flash or download pauses safely. Simply run it again when you’re ready.  
- Clear the SPIFFS filter field to show every file again; the table automatically resets to the first page.

## Privacy & Security
ESPConnect talks to your hardware entirely inside the browser. Firmware files, backups, and diagnostics stay on your machine unless you choose to share them. Always flash firmware from trusted sources.

## License
ESPConnect is released under the MIT License. See [LICENSE](LICENSE) for the full text.
