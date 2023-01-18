# Holy Grails
Tools for processing Grails media assets

![image](https://user-images.githubusercontent.com/35775/213267338-bd09abe7-3ac7-4e06-b6f4-a50744eff48d.png)

## Prerequisites
* [Node.js](https://nodejs.org/en/) required for executing the holy-grails script(s)
* [Homebrew](https://homebrew.sh/) (optional) used for installing Node.js


## Installation
1. Clone this repository.
   ```sh
   $ git clone https://github.com/proofxyz/holy-grails.git
   ```
2. Install source dependencies.
   ```sh
   $ cd path/to/holy-grails
   $ npm install
   ```

## Usage
1. Create a nested source directory.
   ```sh
   $ cd path/to/holy-grails
   $ mkdir -p assets/source
   ```
3. Place media assets in the `assets/source` directory.
4. Start the application to process the media assets.
   ```sh
   $ npm start
   ```

Processed media assets will be present in `assets/clean`.

The application will log output as it processes the media assets and report its results when it is finished.

```
1/11/2023, 11:54:10 AM (0.0s) 🤓 Reading 2 files from ./assets/source…
1/11/2023, 11:54:10 AM (0.1s) 🟢 (1/2) PXL_20230110_181601256.jpg
1/11/2023, 11:54:10 AM (0.3s) 🟢 (2/2) PXL_20230110_194822305.mp4
1/11/2023, 11:54:10 AM (0.3s) ------------------------------------
1/11/2023, 11:54:10 AM (0.3s) 🙌 Done! All files processed successfully.
```

Errors will be logged and reported.

```
1/11/2023, 11:55:03 AM (0.0s) 🤓 Processing 3 files from ./assets/source…
1/11/2023, 11:55:03 AM (0.1s) 🔴 (1/3) Error: Not a valid PNG (looks more like a JPEG) - /tmp/grails/6edb2517-69e0-4683-b0a0-cf2e8cd26105.png
1/11/2023, 11:55:03 AM (0.2s) 🟢 (2/3) PXL_20230110_181601256.jpg
1/11/2023, 11:55:03 AM (0.4s) 🟢 (3/3) PXL_20230110_194822305.mp4
1/11/2023, 11:55:03 AM (0.4s) ------------------------------------
1/11/2023, 11:55:03 AM (0.4s) ✋ Done. Encountered 1 error.
```
