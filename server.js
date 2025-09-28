const express = require('express');

const port = 8090;

const app = express();

app.use(express.static(`${__dirname}/public`));

app.use(/(.*)/, (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});


app.listen(process.env.PORT || 8090, () => {
    console.log(`Express server is listening on :${port}`);
});
