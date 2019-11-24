import express from 'express';
const app = express();
import {printMsg} from 'threeml';
const port = 3000;

app.get('/', (req, res) => res.send(printMsg()));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
