# Holy Grails
Tools for processing Grails media assets

## Installation
```sh
$ git clone https://github.com/proofxyz/holy-grails.git
```

## Usage
1. Place media assets in `source` directory.
2. In a terminal application:
   ```sh
   $ yarn start
   ```

```
1/11/2023, 11:54:10 AM (0.0s) 🤓 Reading 2 files from ./assets/source…
1/11/2023, 11:54:10 AM (0.1s) 🟢 (1/2) PXL_20230110_181601256.jpg
1/11/2023, 11:54:10 AM (0.3s) 🟢 (2/2) PXL_20230110_194822305.mp4
1/11/2023, 11:54:10 AM (0.3s) ------------------------------------
1/11/2023, 11:54:10 AM (0.3s) 🙌 Done! All files processed successfully.
```

```
1/11/2023, 11:55:03 AM (0.0s) 🤓 Processing 3 files from ./assets/source…
1/11/2023, 11:55:03 AM (0.1s) 🔴 (1/3) Error: Not a valid PNG (looks more like a JPEG) - /tmp/grails/6edb2517-69e0-4683-b0a0-cf2e8cd26105.png
1/11/2023, 11:55:03 AM (0.2s) 🟢 (2/3) PXL_20230110_181601256.jpg
1/11/2023, 11:55:03 AM (0.4s) 🟢 (3/3) PXL_20230110_194822305.mp4
1/11/2023, 11:55:03 AM (0.4s) ------------------------------------
1/11/2023, 11:55:03 AM (0.4s) ✋ Done. Encountered 1 error.
```
