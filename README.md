&nbsp;

<p align="center">
  <img src="./public/icon/128.png" alt="Neo2DB Logo">
  <h1 align="center">Neo2DB</h1>
</p>

  <p align="center">
    Auto-fill Douban Music submissions from NeoDB<br>
    Quickly search between Douban and NeoDB with direct page navigation
  </p>

## Installation

1. Clone and extract this project
2. Set up your NeoDB Access Token:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and replace `your_token_here` with your token from https://neodb.social/developer/
3. Install [Vite+](https://viteplus.dev/guide/), then install dependencies and build the extension. Vite+ manages the Node.js and pnpm versions declared in `package.json` under `devEngines`:
   ```bash
   vp install
   vp run build
   ```
4. Open `chrome://extensions/` in your browser and enable Developer Mode
5. Click "Load unpacked" and select the `.output/chrome-mv3` directory from the project

## Development

WXT manages extension entrypoints, the manifest, React integration, and browser-specific builds in `wxt.config.ts`. Vite+ supplies the Vite engine and the lint/format configuration in `vite.config.ts`.

Use `vp run` to execute the WXT scripts. The built-in `vp dev` and `vp build` commands run Vite directly and do not build this extension.

| Command                | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `vp run dev`           | Start Chrome extension development            |
| `vp run dev:firefox`   | Start Firefox extension development           |
| `vp run check`         | Check formatting, lint, and TypeScript types  |
| `vp run typecheck`     | Run TypeScript checks only                    |
| `vp fmt`               | Format the project                            |
| `vp run build`         | Build Chrome MV3 into `.output/chrome-mv3/`   |
| `vp run build:firefox` | Build Firefox MV2 into `.output/firefox-mv2/` |
| `vp run zip`           | Build and package the Chrome extension        |
| `vp run zip:firefox`   | Build and package the Firefox extension       |

`vp run check` combines Vite+'s format/lint checks with `tsc --noEmit`, preserving the existing lint rules and WXT-generated TypeScript configuration. Run `vp install` before checking a fresh checkout so `wxt prepare` generates `.wxt/`.

## Usage

1. On a NeoDB album page, click the ➕ button next to the cover:
   - Automatically transfers album information to the Douban Music submission form
   - Automatically downloads the album cover image to your computer
   - Automatically opens the Douban Music submission page and fills in the information

2. On NeoDB album/movie/TV/book pages, click the 🔍 button next to the cover:
   - Search for the corresponding entry on Douban

3. On Douban music/movie/book pages, click the NeoDB logo button at the top of the right sidebar:
   - Search for the corresponding entry on NeoDB

## Demos

https://github.com/user-attachments/assets/14ab46b2-ebe2-408d-9803-c646b27274b4

<p align="center">Auto-fill Douban submissions from NeoDB</p>

https://github.com/user-attachments/assets/4c36eb2b-062e-4791-a424-ba19ea6fd8cb

<p align="center">Search NeoDB from Douban</p>

## License

MIT
