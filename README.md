# image-slideshow

This repository allows you to serve a website that is an image slideshow. This was originally inspired by the release of the James Webb Space Telescope images. You can choose in the settings how long each slide goes, whether to zoom in (up to unity scale), how the image fills the page, and whether the image info auto-hides or not. Written in Typescript using React framework, TailwindCSS, some Mantine.dev components, and ViteJS.

[Live Page]('https://jwst.seanchenpiano.com')

## Production

Build with `yarn build`, and then serve the output dist statically.

You will need to serve a JSON of the images with type
```
{
    name: string;
    url?: string;
    urls?: {
        hires: string;
        normal: string;
    };
}[]
```
the resource of which is currently hardcoded in the app.

## Settings

In the app, there are four settings.
* Slideshow interval - 5-60 seconds
* Random Zoom - Chooses whether the slideshow will zoom in on random portions of the image, up to unity scale
* Image Fit - Similar to css `background-size` or `object-fit`. If set to `cover`, will go beyond unity scale.
* Auto-Hide Info - The UI goes away after a period of inactivity of the mouse. Toggling this off will keep the image information and bounds persisting.

## Development
```
yarn dev
```

## License

[MIT](LICENSE)

## Like this utility? Support my hobby!

[PayPal donation link](https://paypal.me/seanchenpiano?locale.x=en_US)