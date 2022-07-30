import * as Promise from 'bluebird';
import * as express from 'express';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as arp from 'app-root-path';
import * as path from 'path';

// import { OutgoingHttpHeaders } from 'http';

const root = arp.toString();
const statAsync = Promise.promisify(fs.stat);

const imageProcessor = express();
const IMG_PATH = path.resolve(root, 'images');

imageProcessor.get('/*', async (req: express.Request<string, any, any, { width: string; height: string; zoom?: boolean; }>, res) => {
    try {
        const image = req.params[0];
        if (!image) {
            res.status(404).end();
        }

        const requestedWidth = parseInt(req.query.width, 10);
        const requestedHeight = parseInt(req.query.height, 10);

        const imagePath = path.resolve(IMG_PATH, image);

        await statAsync(imagePath);

        // const sendFileAsync = Promise.promisify<Promise<void>, string, OutgoingHttpHeaders>(res.sendFile);

        let imageObject = sharp(imagePath);
        const metadata = await imageObject.metadata();
        const originalWidth = metadata.width!;
        const originalHeight = metadata.height!;

        if (req.query.zoom) {
            const minimumWidthRatio = requestedWidth / originalWidth;
            const minimumHeightRatio = requestedHeight / originalHeight;
            const minZoomRatio = Math.max(minimumHeightRatio, minimumWidthRatio);

            const randomZoom = Math.random() * (1.0 - minZoomRatio) + minZoomRatio;

            imageObject = imageObject.resize(Math.floor(originalWidth * randomZoom));
        }

        imageObject.toBuffer().then((buffer) => {
            res.send(buffer);
        }).catch((error) => {
            throw Error(error);
        });

    } catch (error) {
        console.error(error);
    }
});

export default imageProcessor;