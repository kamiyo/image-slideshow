import * as React from 'react';
import * as Bluebird from 'bluebird';
import { PuffLoader } from 'react-spinners';
import { CSSTransition, Transition } from 'react-transition-group';
import gsap from 'gsap';

interface LinkShape {
    name: string;
    url: string;
}
type Canvases = 0 | 1;

/** Util Functions */

const getRandomInt = (from: number, to: number) =>
    Math.floor(Math.random() * (to - from) + from);

const incrementMod2 = (value: Canvases): Canvases =>
    ((value + 1) % 2) as Canvases;

/** End Util Functions */

interface drawImageParams {
    image: HTMLImageElement | undefined;
    canvas: HTMLCanvasElement | null;
    renderParams: RenderParams | null;
    opacity?: number;
}

const drawImage = (params: drawImageParams) => {
    const {
        image,
        canvas,
        renderParams,
        opacity = 1.0
    } = params;
    if (canvas && image && renderParams) {
        // store offset dimensions in temps
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const {
            sx, sy, sw, sh,
            dx, dy, dw, dh
        } = renderParams;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, width, height)
            ctx.globalAlpha = opacity;
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(
                image,
                sx, sy, sw, sh,
                dx, dy, dw, dh
            );
        }
    }
};

export interface RenderParams {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    dx: number;
    dy: number;
    dw: number;
    dh: number;
}

interface RenderParamsArgs {
    imageKey: number;
    canvasNumber: Canvases;
    refresh?: boolean;
    randomZoom?: boolean;
    objectFit?: 'cover' | 'contain';
}

type RerenderParams = Omit<RenderParams, 'sw'>;

interface SlideshowProps {
    setCurrentImageName: React.Dispatch<React.SetStateAction<string>>;
    v: number;
    setV: React.Dispatch<React.SetStateAction<number>>;
    isPlaying: boolean;
    setBounds: React.Dispatch<React.SetStateAction<Pick<RenderParams, 'sx' | 'sy' | 'sw' | 'sh'> | undefined>>;
    slideshowInterval: number;
}

export const Slideshow: React.FC<SlideshowProps> = ({ setCurrentImageName, v, setV, isPlaying, setBounds, slideshowInterval }) => {
    const imageMap = React.useRef<HTMLImageElement[]>([]);
    const resolvers = React.useRef<(() => void)[]>([]);
    const promises = React.useRef<Bluebird<void>[]>([]);
    const canvases = React.useRef<(HTMLCanvasElement | null)[]>([null, null]);
    const images = React.useRef<number[]>([]);
    const [firstImageLoaded, setFirstImageLoaded] = React.useState(false);
    const [currentCanvas, setCurrentCanvas] = React.useState<Canvases>(0);
    const currentCanvasRef = React.useRef<Canvases>(0);
    const fade1 = React.useRef<{ t: number }>({ t: 1 });
    const timerIds = React.useRef<number[]>([]);
    const renderParams = React.useRef<(RenderParams | null)[]>([null, null]);
    const rerenderParams = React.useRef<(RerenderParams | null)[]>([null, null]);
    const [imageSources, setImageSources] = React.useState<LinkShape[]>([]);
    const imageSourcesRef = React.useRef<LinkShape[]>([]);

    // First thing, get the list of images
    React.useEffect(() => {
        const asyncFetch = async () => {
            const response = await fetch('/assets/imagelist.json');
            const data: LinkShape[] = await response.json();
            setImageSources(data);
            // Set Ref so we don't have to worry about stale state in render fn
            imageSourcesRef.current = data;
        }
        asyncFetch();
    }, []);

    React.useEffect(() => {
        // if there are timerIds, then it has been playing
        if (timerIds.current.length !== 0) {
            // clear all timers
            timerIds.current.forEach((timerId) => clearTimeout(timerId));
            timerIds.current = [];
        } else {
            // don't activate timers unless we actually have images (was playing previous to pausing)
            imageSources.length && timerIds.current.push(
                setTimeout(() => {
                    timerIds.current.splice(0, 1);
                    timerFn();
                }, slideshowInterval * 1000)
            );
        }
    }, [isPlaying, imageSources]);

    // Setup and populate map of promises/resolvers as well as first two images
    React.useEffect(() => {
        images.current = [
            getRandomInt(0, imageSources.length),
            getRandomInt(0, imageSources.length)
        ];
        for (let i = 0; i < imageSources.length; i++) {
            promises.current[i] = new Bluebird<void>((res) => {
                resolvers.current[i] = res;
            });
        }
    }, [imageSources]);

    // generate the bounds of source and dest
    const generateRenderParams = React.useCallback(async (params: RenderParamsArgs) => {
        const {
            imageKey,
            canvasNumber,
            refresh = false,
            randomZoom = false,
            objectFit = 'cover',
        } = params;
        const canvas = canvases.current[canvasNumber];
        const image = imageMap.current[imageKey];
        if (canvas && image) {
            // store offset dimensions in temps
            let width = canvas.offsetWidth;
            let height = canvas.offsetHeight;

            // assign offset dims to canvas
            canvas.width = width;
            canvas.height = height;

            const destRatio = width / height;               // ratio of canvas
            const srcRatio = image.width / image.height;    // ratio of source image

            // If image is smaller in either dimension than canvas
            if (image.width <= width || image.height <= height || randomZoom === false) {
                let sw = image.width;
                let sh = image.height;

                let dx = 0,
                    dy = 0,
                    dw = width,
                    dh = height,
                    out: RenderParams;

                if (objectFit === 'cover') {
                    // the factor that the canvas needs to be scaled to fit the source
                    // for calculating sx and sy
                    const scaleFactor = Math.min(
                        sw / dw,
                        sh / dh
                    );
                    const windowW = width * scaleFactor;
                    const windowH = height * scaleFactor;
                    out = {
                        sx: Math.max(0, Math.round((sw - windowW) / 2)),
                        sy: Math.max(0, Math.round((sh - windowH) / 2)),
                        sw: Math.round(windowW), sh: Math.round(windowH),
                        dx, dy, dw, dh
                    };
                } else {
                    const scaleFactor = Math.min(
                        dw / sw,
                        dh / sh
                    );
                    dw = Math.round(sw * scaleFactor);
                    dh = Math.round(sh * scaleFactor);
                    dx = Math.round((width - dw) / 2);
                    dy = Math.round((height - dh) / 2);
                    out = {
                        sx: 0, sy: 0, sw, sh,
                        dx, dy, dw, dh
                    }
                }
                rerenderParams.current[canvasNumber] = out;
                renderParams.current[canvasNumber] = out;
                return;
            }

            const sx = refresh ?
                (rerenderParams.current[canvasNumber]?.sx || getRandomInt(0, image.width - width))
                : getRandomInt(0, image.width - width);
            const sy = refresh ?
                (rerenderParams.current[canvasNumber]?.sy || getRandomInt(0, image.height - height))
                : getRandomInt(0, image.height - height);
            let sh = refresh ?
                (rerenderParams.current[canvasNumber]?.sh || getRandomInt(height, image.height - sy))
                : getRandomInt(height, image.height - sy);
            let sw = Math.round(sh * destRatio);
            if (sw + sx > image.width) {
                sw = image.width - sx;
                sh = Math.round(sw / destRatio);
            }

            rerenderParams.current[canvasNumber] = {
                sx,
                sy,
                sh,
                dx: 0, dy: 0, dw: width, dh: height,
            };

            const out = {
                sx,
                sy,
                sw,
                sh,
                dx: 0, dy: 0, dw: width, dh: height,
            };
            renderParams.current[canvasNumber] = out;
        }
    }, []);

    // Store state into ref (maybe we don't need this)
    React.useEffect(() => {
        currentCanvasRef.current = currentCanvas;
        imageSources.length && setCurrentImageName(imageSources[images.current[currentCanvas]].name);
        setBounds(renderParams.current[currentCanvas] ?? undefined);
    }, [currentCanvas, imageSources]);

    // I think we have to use refs here because timerFn doesn't have a chance to be updated by hooks
    // Main timer loop
    const timerFn = React.useCallback(() => {
        const lastCanvas = currentCanvasRef.current;
        // swap buffers
        setCurrentCanvas((prev) => incrementMod2(prev));
        // update UI image name
        timerIds.current.push(
            setTimeout(() => {
                timerIds.current.splice(0, 1);
                const nextImage = getRandomInt(0, imageSourcesRef.current.length);
                images.current[lastCanvas] = nextImage;
                canvases.current[lastCanvas] && loadAndDrawImage(nextImage, lastCanvas, true, fade1.current.t);
            }, 1000)
        );
        timerIds.current.push(
            setTimeout(async () => {
                timerIds.current.splice(0, 1);
                const nextImage = images.current[lastCanvas];
                await promises.current?.[nextImage];
                timerFn();
            }, slideshowInterval * 1000)
        );
    }, [slideshowInterval, setCurrentCanvas]);

    React.useEffect(() => {
        // reset loading
        setFirstImageLoaded(false);
        // reset timerIds
        timerIds.current.forEach((timerId) => {
            clearTimeout(timerId);
        });
        timerIds.current = [];

        const asyncInner = async () => {
            const currentImage = images.current[0];
            loadAndDrawImage(currentImage, 0, true, fade1.current.t);
            await promises.current?.[currentImage];
            timerIds.current.push(
                setTimeout(() => {
                    setFirstImageLoaded(true);
                    setBounds(renderParams.current[0] ?? undefined);
                    setCurrentImageName(imageSources[currentImage].name);
                    timerIds.current.splice(0, 1);
                    timerIds.current.push(
                        setTimeout(() => {
                            timerIds.current.splice(0, 1);
                            timerFn();
                        }, slideshowInterval * 1000)
                    );
                }, 3000)
            );
            const nextImage = images.current[1];
            loadAndDrawImage(nextImage, 1, true);
        };

        imageSources.length && asyncInner();
    }, [v, imageSources]);

    const wrappedDraw = React.useCallback(async () => {
        setV((prev) => prev + 1);
    }, []);

    React.useEffect(() => {
        window.addEventListener('resize', wrappedDraw);
        return () => {
            window.removeEventListener('resize', wrappedDraw);
        };
    }, [wrappedDraw]);

    const loadAndDrawImage = React.useCallback((linkNumber: number, canvasNumber: Canvases, generateParams = false, opacity = 1.0) => {
        if (imageMap.current[linkNumber] === undefined) {
            imageMap.current[linkNumber] = new Image();
            imageMap.current[linkNumber]!.addEventListener('load', () => {
                generateParams && generateRenderParams({
                    imageKey: linkNumber,
                    canvasNumber
                });
                drawImage({
                    image: imageMap.current[linkNumber]!,
                    canvas: canvases.current[canvasNumber],
                    renderParams: renderParams.current[canvasNumber],
                    opacity
                });
                resolvers.current?.[linkNumber]!();
            }, false);
            imageMap.current[linkNumber]!.src = imageSourcesRef.current[linkNumber].url;
        } else {
            promises.current?.[linkNumber]!.then(() => {
                generateParams && generateRenderParams({
                    imageKey: linkNumber,
                    canvasNumber
                });
                drawImage({
                    image: imageMap.current[linkNumber]!,
                    canvas: canvases.current[canvasNumber],
                    renderParams: renderParams.current[canvasNumber],
                    opacity
                });
            });
        }
    }, []);

    const drawCanvas = React.useCallback((canvasNumber: Canvases) => () => {
        const canvas = canvases.current[canvasNumber];
        drawImage({
            image: imageMap.current[images.current[canvasNumber]]!,
            canvas,
            renderParams: renderParams.current[canvasNumber],
            opacity: (canvasNumber === 0) ? fade1.current.t : undefined
        });
    }, []);

    const drawCanvas1 = React.useCallback(drawCanvas(0), []);

    return (
        <div className="w-full h-full bg-black">
            <CSSTransition
                in={!firstImageLoaded}
                timeout={250}
                classNames='loading'
                unmountOnExit={true}
            >
                <div className="absolute w-full h-full z-20 flex items-center justify-center bg-black">
                    <PuffLoader color="#FFFFFF" />
                </div>
            </CSSTransition>
            <Transition
                in={currentCanvas === 0}
                timeout={600}
                onEnter={() => {
                    const ctx = canvases.current[0]?.getContext('2d');
                    if (!canvases.current[0] || !ctx) return;
                    gsap.ticker.add(drawCanvas1);

                    gsap.to(fade1.current, {
                        duration: 0.5,
                        delay: 0.1,
                        t: 1.0,
                        onComplete: () => {
                            gsap.ticker.remove(drawCanvas1);
                            fade1.current.t = 1.0;
                        }
                    });
                }}
                onExit={() => {
                    const ctx = canvases.current[0]?.getContext('2d');
                    if (!canvases.current[0] || !ctx) return;
                    gsap.ticker.add(drawCanvas1);

                    gsap.to(fade1.current, {
                        duration: 0.5,
                        delay: 0.1,
                        t: 0.0,
                        onComplete: () => {
                            gsap.ticker.remove(drawCanvas1);
                            fade1.current.t = 0.0;
                        }
                    });
                }}
            >
                <canvas
                    id="canvas1"
                    ref={(el) => {
                        canvases.current[0] = el;
                        const _ctx = el?.getContext('2d');
                        _ctx && (_ctx.imageSmoothingEnabled = false);
                    }}
                    className="w-full h-full absolute top-0 left-0 z-10"
                />
            </Transition>
            <canvas
                id="canvas2"
                ref={(el) => {
                    canvases.current[1] = el;
                    const _ctx = el?.getContext('2d', { alpha: false });
                    _ctx && (_ctx.imageSmoothingEnabled = false);
                }}
                className="w-full h-full absolute top-0 left-0"
            />
        </div>
    )
};