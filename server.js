const express = require('express');
const path = require('path');
const fs = require('fs');
const { apiServise } = require("@/data.js");
const { getValidImage, playsParser } = require("@/parsers.js");

const port = 8090;

const app = express();

app.use(express.static(`${__dirname}/public`));

app.get(/^\/artist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, async (req, res) => {
  const id = req.params[0];

  let artistData;
  try {
    artistData = await apiServise.getArtistPageData(id);
  } catch (err) {
    console.error(err);
    return res.sendFile(path.join(__dirname, 'public/index.html'));
  }

  const indexHtml = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');

  const ogTags = `
    <meta property="og:title" content="${artistData.artist.name}" />
    <meta property="og:description" content="Артист • ${playsParser(artistData.artist.play_count) || 0}" />
    <meta property="og:image" content="${getValidImage('artists/' + artistData.artist.avatar_url, 'default-artist.png')}" />
  `;

  const htmlWithOG = indexHtml.replace('</head>', `${ogTags}\n</head>`);

  res.send(htmlWithOG);
});

app.use(/(.*)/, (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

app.listen(process.env.PORT || 8090, () => {
  console.log(`Express server is listening on http://localhost:${port}`);
});
