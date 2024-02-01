const http = require('http');
const fs = require('fs');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */

    // Your code here
    // GET /artists
    if (req.method === 'GET' && req.url === '/artists') {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(artists));
    }

    // GET /artists/:artistId
    if (req.method === 'GET' && req.url.match(/^\/artists\/\d+$/)) {
      const artistId = req.url.split('/')[2];
      const artist = artists[artistId];
      if (artist) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(artist));
      }
    }

    // POST /artists
    if (req.method === 'POST' && req.url === '/artists') {
      const { name } = req.body;
      const artistId = getNewArtistId();
      const artist = { artistId, name };
      artists[artistId] = artist;

      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(artist));
    }

    // PATCH or PUT /artists/:artistId
    if ((req.method === 'PATCH' || req.method === 'PUT') && req.url.match(/^\/artists\/\d+$/)) {
      const { name } = req.body;
      const artistId = req.url.split('/')[2];
      const artist = artists[artistId];
      if (artist) {
        const updArtist = { artistId, name: name || artist.name };
        artists[artistId] = updArtist;

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(updArtist));
      }
    }

    // DELETE /artists/:artistId
    if (req.method === 'DELETE' && req.url.match(/^\/artists\/\d+$/)) {
      const artistId = req.url.split('/')[2];
      if (artists.hasOwnProperty(artistId)) {
        delete artists[artistId];
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        message: 'Successfully deleted'
      }));
    }

    // GET /artists/:artistId/albums
    if (req.method === 'GET' && req.url.match(/^\/artists\/\d+\/albums$/)) {
      const artistId = req.url.split('/')[2];
      const artist = artists[artistId];

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(artist.albums || {}));
    }

    // GET /albums/:albumId
    if (req.method === 'GET' && req.url.match(/^\/albums\/\d+$/)) {
      const albumId = req.url.split('/')[2];
      const album = albums[albumId];
      if (album) {

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(album || {}));
      }
    }

    // POST /artists/:artistId/albums
    if (req.method === 'POST' && req.url.match(/^\/artists\/\d+\/albums$/)) {
      const artistId = req.url.split('/')[2];
      const artist = artists[artistId];

      if (artist) {
        const { name, artistId } = req.body;
        const albumId = getNewAlbumId();
        const album = { albumId, name, artistId }
        albums[albumId] = album;

        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(album || {}));
      }
    }

    // PUT or PATCH /albums/:albumId
    if ((req.method === "PUT" || req.method === "PATCH") && req.url.match(/^\/albums\/\d+$/)) {
      const albumId = req.url.split('/')[2];
      const album = albums[albumId]

      if (album) {
        const { name, artistId } = req.body;
        const updAlbum = { albumId: album.albumId, name: name || album.name, artistId: artistId || album.artistId };
        albums[albumId] = updAlbum;

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(updAlbum || {}));
      }
    }

    // DELETE /albums/:albumId
    if (req.method === 'DELETE' && req.url.match(/^\/albums\/\d+$/)) {
      const albumId = req.url.split('/')[2];
      const album = albums[albumId];

      if (albums.hasOwnProperty(albumId)) {
        delete albums[albumId];

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: 'Successfully deleted album' }));
      }
    }

    // GET /artists/:artistId/songs
    if (req.method === 'GET' && req.url.match(/^\/artists\/\d+\/songs/)) {
      const artistId = req.url.split('/')[2];
      const artistSongs = songs[artistId];

      if (artistSongs) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(artistSongs || {}));
      }
    }

    // Get /albums/:albumId/songs
    if (req.method === 'GET' && req.url.match(/^\/albums\/\d+\/songs$/)) {
      const albumId = req.url.split('/')[2];
      const albumSongs = songs[albumId];

      if (albumSongs) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(albumSongs || {}));
      }
    }

    // GET /trackNumbers/:trackNumber/songs
    if (req.method === 'GET' && req.url.match(/^\/trackNumbers\/\d+\/songs/)) {
      const trackNumber = req.url.split('/')[2];
      const track = songs[trackNumber];
      if (track) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(track));
      }
    }

    // GET /songs/:songId
    if (req.method === 'GET' && req.url.match(/^\/songs\/\d+$/)) {
      const songId = req.url.split('/')[2];
      const song = {
        ...songs[songId],
        album: albums[songId],
        artist: artists[songId]
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(song));
    }

    // POST /albums/:albumId
    if (req.method === 'POST' && req.url.match(/^\/albums\/\d+$/)) {
      const { name, lyrics, trackNumber } = req.body;
      const songId = getNewSongId();
      const song = {
        songId,
        name,
        trackNumber,
        albumId: getNewAlbumId(),
        lyrics
      };
      songs[songId] = song;

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(song));
    }

    // PUT or PATCH /songs/:songId
    if ((req.method === 'PUT' || req.method === 'PATCH') && req.url.match(/^\/songs\/\d+$/)) {
      const songId = req.url.split('/')[2];
      const { name, lyrics } = req.body;
      const song = songs[songId]
      
      const updSong = {
        name: name || song.name,
        lyrics: lyrics || song.lyrics,
        trackNumber: song.trackNumber,
        songId: song.songId,
        albumId: song.albumId,
        album: albums[songId],
        artist: artists[songId]
      }
      songs[songId] = updSong;

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(updSong));
    }

      // DELETE /songs/:songId
      if (req.method === 'DELETE' && req.url.match(/^\/songs\/\d+$/)) {
	  const songId = req.url.split('/')[2];
	  if (songs.hasOwnProperty(songId)) {
	      delete songs[songId];

	      res.writeHead(200, { "Content-Type": "application/json" });
	      return res.end(JSON.stringify({message: "Successfully deleted song"}));
	  }
      }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end();
  });
});

const port = 5000;

server.listen(port, () => console.log('Server is listening on port', port));
