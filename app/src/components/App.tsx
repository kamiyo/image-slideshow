import { RenderParams, Slideshow } from 'src/components/Slideshow';
import * as React from 'react';
import { CSSTransition, SwitchTransition, Transition } from 'react-transition-group';
import gsap from 'gsap';
import * as Bluebird from 'bluebird';
import { SegmentedControl } from '@mantine/core';
import { ExitFullScreen, FullScreen, Pause, Play } from 'src/components/SVGIcons';

const formatBounds = (bounds: Pick<RenderParams, 'sx' | 'sy' | 'sw' | 'sh'>) => {
    const { sx, sy, sw, sh } = bounds;
    return `(${sx}, ${sy}), (${sx + sw}, ${sy + sh})`;
};

const speedChoices = [
    { value: '10', label: 'Fast (10s)' },
    { value: '30', label: 'Medium (30s)' },
    { value: '60', label: 'Slow (60s)' },
];

export const App: React.FC<{}> = () => {
    const [mouseMoved, setMouseMoved] = React.useState(true);
    const [currentImageName, setCurrentImageName] = React.useState('');
    const [v, setV] = React.useState(0);        // Force child rerendering
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const timerId = React.useRef(0);
    const [isPlaying, setIsPlaying] = React.useState(true);
    const [bounds, setBounds] = React.useState<Pick<RenderParams, 'sx' | 'sy' | 'sw' | 'sh'>>();
    const [slideshowInterval, setSlideShowInterval] = React.useState(10);

    React.useEffect(() => {
        timerId.current = setTimeout(() => setMouseMoved(false), 5000);
        function onMouseMove(ev: MouseEvent) {
            setMouseMoved(true);
            document.getElementById('app')!.style.cursor = 'unset';
            clearTimeout(timerId.current);
            if ((ev.target as HTMLElement).id === 'ui') {
                timerId.current = setTimeout(() => {
                    if (document.fullscreenElement) {
                        document.getElementById('app')!.style.cursor = 'none';
                    }
                    setMouseMoved(false);
                    clearTimeout(timerId.current);
                }, 5000);
            }
        }
        function onFullscreenChange(ev: Event) {
            if (document.fullscreenElement) {
                setIsFullScreen(true);
            } else {
                setIsFullScreen(false);
            }
        }
        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return function cleanup() {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            clearTimeout(timerId.current);
        };
    }, []);

    return (
        <>
            <CSSTransition
                in={mouseMoved}
                timeout={500}
                classNames="ui-layer"
            >
                <div id="ui" className="absolute w-full h-full z-50 ui-gradient">
                    <div
                        className="w-full absolute bottom-0 pb-4"
                        onMouseOver={() => {
                            setTimeout(() => clearTimeout(timerId.current), 150);
                        }}
                    >
                        {
                            isPlaying ?
                                <Pause
                                    className="play-pause-button"
                                    stroke="white"
                                    fill="transparent"
                                    width="40"
                                    height="40"
                                    onClick={() => {
                                        setIsPlaying(false);
                                    }}
                                />
                                : <Play
                                    className="play-pause-button"
                                    stroke="white"
                                    fill="transparent"
                                    width="40"
                                    height="40"
                                    onClick={() => {
                                        setIsPlaying(true);
                                    }}
                                />
                        }
                        {
                            isFullScreen ?
                                <ExitFullScreen
                                    className="fullscreen-button"
                                    stroke="white"
                                    fill="transparent"
                                    width="32"
                                    height="32"
                                    onClick={async () => {
                                        try {
                                            setV((prev) => prev + 1);
                                            await new Bluebird((res) => {
                                                setTimeout(() => res(), 500);
                                            });
                                            await document.exitFullscreen();
                                            // setIsFullScreen(false);
                                        } catch (e) {
                                            console.log('Cannot exit fullscreen!');
                                        }
                                    }}
                                />
                                : <FullScreen
                                    className="fullscreen-button"
                                    stroke="white"
                                    fill="transparent"
                                    width="32"
                                    height="32"
                                    onClick={async () => {
                                        try {
                                            setV((prev) => prev + 1);
                                            await new Bluebird((res) => {
                                                setTimeout(() => res(), 500);
                                            });
                                            await document.getElementById('app')!.requestFullscreen();
                                        } catch (e) {
                                            console.log('Cannot activate fullscreen!');
                                        }
                                    }}
                                />
                        }
                    </div>
                    <div className="m-2 text-4xl font-thin absolute z-20 text-white-glow">
                        JWST Images Slideshow
                    </div>
                    <SwitchTransition mode={'out-in'}>
                        <Transition
                            key={currentImageName}
                            timeout={600}
                            onEnter={(el: HTMLElement) => {
                                gsap.to(
                                    el,
                                    { autoAlpha: 1, duration: 0.5, delay: 0.1 }
                                );
                            }}
                            onExit={(el: HTMLElement) => {
                                gsap.to(
                                    el,
                                    { autoAlpha: 0, duration: 0.5, delay: 0.1 }
                                );
                            }}
                            unmountOnExit={true}
                            mountOnEnter={true}
                        >
                            <div className="m-4 text-sm font-thin absolute z-20 bottom-0 left-0 text-white-glow">
                                <div>
                                    {currentImageName}
                                </div>
                                <div>
                                    {bounds ? formatBounds(bounds) : '\u200b'}
                                </div>
                            </div>
                        </Transition>
                    </SwitchTransition>
                    <div className="absolute z-20 bottom-0 left-1/2 translate-x-10 m-4 bg-transparent text-white-glow font-thin flex flex-row items-center">
                        <div className="flex-auto h-fit">
                            Slideshow Speed:
                        </div>
                        <SegmentedControl
                            color="white"
                            styles={{
                                root: { borderWidth: '0.5px' }
                            }}
                            classNames={{
                                label: ['text-white-glow', 'font-thin', 'font-sans', 'hover:text-white-hover'],
                                labelActive: ['text-black', 'font-light', 'font-sans', 'hover:segmented-active-hover']
                            }}
                            className="rounded-md border-white bg-transparent mx-4 flex-auto"
                            data={speedChoices}
                            value={slideshowInterval.toString()}
                            onChange={(val: string) => {
                                setSlideShowInterval(parseInt(val));
                            }}
                        />
                    </div>
                </div>
            </CSSTransition>
            <Slideshow
                v={v}
                setV={setV}
                setCurrentImageName={setCurrentImageName}
                isPlaying={isPlaying}
                setBounds={setBounds}
                slideshowInterval={slideshowInterval}
            />
        </>
    );
};