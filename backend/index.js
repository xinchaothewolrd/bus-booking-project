require('dotenv').config(); // nap file .env vao process.env

const { app } = require('./src/app'); // app.js la file chính của project

const port = Number(process.env.PORT) || 3000; // port la port cua server ( tu file .env) neu k co thi mac dinh la 3000

app.listen(port, () => { // listen port cua server va chay server
  console.log(`Server listening on http://localhost:${port}`); // log ra port cua server
});
