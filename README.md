&nbsp;

<p align="center">
  <img src="./public/icon/128.png" alt="Neo2DB Logo">
</p>
&nbsp;

# Neo2DB

Auto-fill Douban Music submissions from NeoDB, and quickly search between Douban and NeoDB with direct page navigation.

## Installation

1. Clone and extract this project
2. Find the `AccessToken` variable in the `entrypoints/content.tsx` file and fill in your NeoDB Access Token
   - Visit https://neodb.social/developer/ to get an Access Token
3. Install dependencies and build the extension:
   ```bash
   pnpm install
   pnpm build
   ```
4. Open `chrome://extensions/` in your browser and enable Developer Mode
5. Click "Load unpacked" and select the `.output/chrome-mv3` directory from the project

## Usage

1. On a NeoDB album page, click the ➕ button next to the cover:

   - Automatically transfers album information to the Douban Music submission form
   - Automatically downloads the album cover image to your computer
   - Automatically opens the Douban Music submission page and fills in the information

2. On NeoDB album/movie/TV/book pages, click the 🔍 button next to the cover:

   - Search for the corresponding entry on Douban

3. On Douban music/movie/book pages, click the NeoDB logo button at the top of the right sidebar:
   - Search for the corresponding entry on NeoDB

## License

MIT
