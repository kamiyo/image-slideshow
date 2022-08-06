import { RenderParams, Slideshow } from './Slideshow'
import * as React from 'react';
import { CSSTransition, SwitchTransition, Transition } from 'react-transition-group';
import gsap from 'gsap';
import { Popover, Grid, Switch, Divider, Slider } from '@mantine/core';
import { ExitFullScreen, FullScreen, Github, Pause, Play, Settings } from './SVGIcons';
import { storageAvailable } from '../utils/localStorage';

const formatBounds = (bounds: Pick<RenderParams, 'sx' | 'sy' | 'sw' | 'sh'>) => {
    const { sx, sy, sw, sh } = bounds;
    return `(${sx}, ${sy}), (${sx + sw}, ${sy + sh})`;
};

export const App: React.FC<{}> = () => {
    const [mouseMoved, setMouseMoved] = React.useState(true);
    const [currentImageName, setCurrentImageName] = React.useState('');
    const [v, setV] = React.useState(0);        // Force child rerendering
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const timerId = React.useRef(0);
    const [isPlaying, setIsPlaying] = React.useState(true);
    const [bounds, setBounds] = React.useState<Pick<RenderParams, 'sx' | 'sy' | 'sw' | 'sh'>>();
    const [slideshowInterval, setSlideShowInterval] = React.useState(
        storageAvailable() ? parseInt(window.localStorage.getItem('interval') || '10') : 10
    );
    const [settingsOpened, setSettingsOpened] = React.useState(false);
    const [zoomActivated, setZoomActivated] = React.useState(
        storageAvailable() ? window.localStorage.getItem('zoom') === 'true' : false
    );
    const [isCover, setIsCover] = React.useState(
        storageAvailable() ? window.localStorage.getItem('cover') === 'true' : false
    );
    const [hideInfo, setHideInfo] = React.useState(
        storageAvailable() ? window.localStorage.getItem('hideInfo') === 'true' : false
    );
    const gearRef = React.useRef<SVGSVGElement | null>(null);

    React.useEffect(() => {
        window.localStorage.setItem(
            'zoom',
            zoomActivated.toString()
        );
    }, [zoomActivated]);

    React.useEffect(() => {
        window.localStorage.setItem(
            'cover',
            isCover.toString()
        );
    }, [isCover]);

    React.useEffect(() => {
        window.localStorage.setItem(
            'hideInfo',
            hideInfo.toString()
        );
    }, [hideInfo]);

    React.useEffect(() => {
        window.localStorage.setItem(
            'zoom',
            zoomActivated.toString()
        );
    }, [zoomActivated]);

    React.useEffect(() => {
        window.localStorage.setItem(
            'interval',
            slideshowInterval.toFixed(0)
        );
    }, [slideshowInterval]);

    React.useEffect(() => {
        if (settingsOpened) {
            gsap.to(gearRef.current, {
                rotate: 360,
                duration: 1,
            });
        } else {
            gsap.to(gearRef.current, {
                rotate: 0,
                duration: 1,
            });
        }
    }, [settingsOpened]);

    React.useEffect(() => {
        timerId.current = setTimeout(() => {
            setMouseMoved(false);
            setSettingsOpened(false);
        }, 5000);
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
                    setSettingsOpened(false);
                    clearTimeout(timerId.current);
                }, 5000);
            }
        }
        function onFullscreenChange(_ev: Event) {
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
                <div id="ui" className="absolute w-full h-full z-40 ui-gradient">
                    <div
                        className="w-full absolute bottom-0 pb-4 z-50"
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
                                            await document.exitFullscreen();
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
                                            await document.getElementById('app')!.requestFullscreen();
                                        } catch (e) {
                                            console.log('Cannot activate fullscreen!');
                                        }
                                    }}
                                />
                        }
                    </div>
                    <div className="m-2 text-4xl font-thin absolute z-20 text-white-glow">
                        JWST Slideshow
                    </div>
                    <div className="m-4 absolute z-20 right-0 top-0 flex flex-row">
                    <Popover
                        width={400}
                        position="left-start"
                        withArrow
                        shadow="md"
                        arrowOffset={12}
                        arrowSize={10}
                        opened={settingsOpened}
                        onChange={setSettingsOpened}
                    >
                        <Popover.Target>
                            <div
                                className="mx-2"
                                onMouseOver={() => {
                                    setTimeout(() => clearTimeout(timerId.current), 150);
                                }}
                                onClick={() => {
                                    setSettingsOpened((o) => !o);
                                }}
                            >
                                <Settings
                                    ref={gearRef}
                                    className="settings-button"
                                    stroke="white"
                                    fill="transparent"
                                    width="32"
                                    height="32"
                                />
                            </div>
                        </Popover.Target>
                        <Popover.Dropdown
                            className="border border-white text-white settings"
                        >
                            <div className="opacity-80">
                                <Grid columns={16}>
                                    <Grid.Col span={16}>
                                        Settings
                                    </Grid.Col>
                                    <Grid.Col span={16}>
                                        <Divider className="!m-0" />
                                    </Grid.Col>
                                    <Grid.Col span={16} className="flex items-center">
                                        Slideshow Interval:
                                    </Grid.Col>
                                    <Grid.Col span={16} className="">
                                        <Slider
                                            value={slideshowInterval}
                                            onChange={setSlideShowInterval}
                                            min={5}
                                            max={60}
                                            label={(value: number) => value.toFixed(1)}
                                            step={1}
                                            classNames={{
                                                bar: 'bg-white',
                                                track: 'before:bg-transparent before:border-white before:border',
                                                thumb: 'border-white bg-black border-2',
                                                root: 'outline-none'
                                            }}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        Zoom
                                    </Grid.Col>
                                    <Grid.Col span={3} className="font-thin text-right">
                                        Off
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <div className="flex justify-center">
                                            <Switch
                                                classNames={{
                                                    input: 'switch-input'
                                                }}
                                                className="hover:cursor-pointer"
                                                size="md"
                                                checked={zoomActivated}
                                                onChange={(ev: React.FormEvent<HTMLInputElement>) => setZoomActivated(ev.currentTarget?.checked)} />
                                        </div>
                                    </Grid.Col>
                                    <Grid.Col span={3} className="font-thin text-left">
                                        On
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        Image Fit
                                    </Grid.Col>
                                    <Grid.Col span={3} className="font-thin text-right">
                                        Contain
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <div className="flex justify-center">
                                            <Switch
                                                classNames={{
                                                    input: 'switch-input'
                                                }}
                                                className="hover:cursor-pointer"
                                                size="md"
                                                checked={isCover}
                                                onChange={(ev: React.FormEvent<HTMLInputElement>) => setIsCover(ev.currentTarget?.checked)} />
                                        </div>
                                    </Grid.Col>
                                    <Grid.Col span={3} className="font-thin text-left">
                                        Cover
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        Auto-Hide Info
                                    </Grid.Col>
                                    <Grid.Col span={3} className="font-thin text-right">
                                        Off
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <div className="flex justify-center">
                                            <Switch
                                                classNames={{
                                                    input: 'switch-input'
                                                }}
                                                className="hover:cursor-pointer"
                                                size="md"
                                                checked={hideInfo}
                                                onChange={(ev: React.FormEvent<HTMLInputElement>) => setHideInfo(ev.currentTarget?.checked)} />
                                        </div>
                                    </Grid.Col>
                                    <Grid.Col span={3} className="font-thin text-left">
                                        On
                                        </Grid.Col>
                                    </Grid>
                                </div>
                            </Popover.Dropdown>
                        </Popover>
                        <a href="https://github.com/kamiyo/image-slideshow" target="_blank" rel="noopener">
                            <Github
                                className="mx-2 settings-button"
                                fill="white"
                                stroke="none"
                                width="32"
                                height="32" />
                        </a>
                    </div>
                </div>
            </CSSTransition>
            <CSSTransition
                in={mouseMoved || !hideInfo}
                timeout={500}
                classNames="ui-layer"
            >
                <div className="m-4 absolute z-40 bottom-0 left-0">
                    <SwitchTransition mode={'out-in'}>
                        <Transition
                            key={currentImageName}
                            timeout={600}
                            onEnter={(el: HTMLElement) => {
                                gsap.fromTo(
                                    el,
                                    { autoAlpha: 0 },
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
                            <div className="text-sm font-thin bottom-0 left-0 text-white-glow">
                                <div>
                                    {currentImageName}
                                </div>
                                <div>
                                    {bounds ? formatBounds(bounds) : '\u200b'}
                                </div>
                            </div>
                        </Transition>
                    </SwitchTransition>
                </div>
            </CSSTransition>
            <Slideshow
                v={v}
                setV={setV}
                setCurrentImageName={setCurrentImageName}
                isPlaying={isPlaying}
                setBounds={setBounds}
                slideshowInterval={slideshowInterval}
                zoomActivated={zoomActivated}
                isCover={isCover}
            />
        </>
    );
};