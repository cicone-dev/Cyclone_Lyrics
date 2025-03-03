# LyricsFinder React App

This is a React version of the LyricsFinder application, which allows users to search for song lyrics, view artist information, and translate lyrics.

## Features

- Search for songs and artists
- View top global hits
- Browse music by genre
- View song lyrics
- Watch music videos
- Learn about artists and their albums
- Translate lyrics
- Dark/light mode toggle

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## API Keys

The application uses the following APIs:

- Last.fm API - For fetching song, artist, and album information
- YouTube Data API - For fetching music videos
- Lyrics.ovh API - For fetching song lyrics
- LibreTranslate API - For translating lyrics

## Building for Production

To build the app for production, run:

```bash
npm run build
```

This will create a `build` folder with the production-ready application.

## License

This project is licensed under the MIT License.