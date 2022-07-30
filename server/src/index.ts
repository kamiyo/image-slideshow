import * as express from 'express';
import * as morgan from 'morgan';
import * as rootPath from 'app-root-path';
import * as path from 'path';
// import imageProcessor from './processImage';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.PORT) {
    throw new Error('No port number specified in environmental variables');
}

const port = parseInt(process.env.PORT, 10);

const app = express();
app.use(morgan('dev'));
app.get('favicon.ico', (_, res) => res.sendStatus(404));
app.use(express.static(path.resolve(rootPath.toString(), 'app/build')));
app.use(/\/assets/, express.static(path.resolve(rootPath.toString(), 'app/assets')));

// app.get(/\//, imageProcessor);
// app.get(/\//, (_req, res) => {
//     res.sendFile('index.html');
// })
app.listen(port, '127.0.0.1', () =>
    console.log(`App listening on port ${port}.`)
);
