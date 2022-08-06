import { RenderParams, Slideshow } from './Slideshow'
import * as React from 'react';
import useMedia from 'use-media';
import { CSSTransition, SwitchTransition, Transition } from 'react-transition-group';
import gsap from 'gsap';
import { Popover, Grid, Switch, Divider, Slider, Modal, Button, Space } from '@mantine/core';
import { ExitFullScreen, FullScreen, Github, Minus, Pause, Play, Plus, Settings } from './SVGIcons';
import { storageAvailable } from '../utils/localStorage';

const formatBounds = (bounds: Pick<RenderParams, 'sx' | 'sy' | 'sw' | 'sh'>) => {
    const { sx, sy, sw, sh } = bounds;
    return `(${sx}, ${sy}), (${sx + sw}, ${sy + sh})`;
};

export const App: React.FC<{}> = () => {
    const isCompact = useMedia({ maxWidth: '62rem' });
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
    const [maxQuality, setMaxQuality] = React.useState(
        storageAvailable() ? (
            window.localStorage.getItem('maxQuality') === null ?
                undefined
                : window.localStorage.getItem('maxQuality') === 'true'
        ) : undefined
    );
    const gearRef = React.useRef<SVGSVGElement | null>(null);
    const settingsOpenedRef = React.useRef(false);

    React.useEffect(() => {
        (maxQuality !== undefined) && window.localStorage.setItem(
            'maxQuality',
            maxQuality.toString()
        );
    }, [maxQuality]);

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
        settingsOpenedRef.current = settingsOpened;
        clearTimeout(timerId.current);
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
            if ((ev.target as HTMLElement).id === 'ui' && !settingsOpenedRef.current) {
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
            <Modal
                opened={maxQuality === undefined}
                withCloseButton={false}
                onClose={() => { }}
                centered
                classNames={{
                    modal: 'border border-white bg-transparent'
                }}
            >
                <div className="text-white">Select Image Quality</div>
                <Divider />
                <Space h="md" />
                <div className="my-2 flex flex-row justify-evenly">
                    <Button
                        className="quality-button"
                        onClick={() => setMaxQuality(false)}
                    >Standard</Button>
                    <Button
                        className="quality-button"
                        onClick={() => setMaxQuality(true)}
                    >Maximum</Button>
                </div>
                <Space h="md" />
                <div className="text-white font-light">
                    Maximum requires high bandwidth and memory requirements.
                    Choose Standard if on a mobile device.
                    You can adjust this later in the settings.
                </div>
            </Modal>
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
                    <div className="mt-2 ml-4 text-4xl font-thin absolute z-20 text-white-glow">
                        JWST Slideshow
                    </div>
                    <div className="m-4 absolute z-20 right-0 top-0 flex flex-row">
                        <Popover
                            width={isCompact ? '100vw' : '400px'}
                            position={isCompact ? 'bottom-end' : 'left-start'}
                            withArrow
                            shadow="md"
                            arrowOffset={isCompact ? 82 : 12}
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
                                            Slideshow Interval: {slideshowInterval}s
                                        </Grid.Col>
                                        <Grid.Col span={16} className="flex items-center justify-between">
                                            <div
                                                className="hover:cursor-pointer settings-button"
                                                onClick={() => setSlideShowInterval((p) => p - 1)}
                                            >
                                                <Minus height="16" width="16" stroke="white" fill="none" />
                                            </div>
                                            <div className="w-4/5">
                                                <Slider
                                                    value={slideshowInterval}
                                                    onChange={setSlideShowInterval}
                                                    min={5}
                                                    max={60}
                                                    label={null}
                                                    step={1}
                                                    classNames={{
                                                        bar: 'bg-white',
                                                        track: 'before:bg-transparent before:border-white before:border',
                                                        thumb: 'border-white bg-black border-2',
                                                        root: 'outline-none'
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className="hover:cursor-pointer settings-button"
                                                onClick={() => setSlideShowInterval((p) => p + 1)}
                                            >
                                                <Plus height="16" width="16" stroke="white" fill="none" />
                                            </div>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            Random Zoom
                                        </Grid.Col>
                                        <Grid.Col span={3} className="font-thin text-right">
                                            Off
                                        </Grid.Col>
                                        <Grid.Col span={3}>
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
                                        <Grid.Col span={4} className="font-thin text-left">
                                            On
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            Image Fit
                                        </Grid.Col>
                                        <Grid.Col span={3} className="font-thin text-right">
                                            Contain
                                        </Grid.Col>
                                        <Grid.Col span={3}>
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
                                        <Grid.Col span={4} className="font-thin text-left">
                                            Cover
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            Auto-Hide Info
                                        </Grid.Col>
                                        <Grid.Col span={3} className="font-thin text-right">
                                            Off
                                        </Grid.Col>
                                        <Grid.Col span={3}>
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
                                        <Grid.Col span={4} className="font-thin text-left">
                                            On
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            Image Quality
                                        </Grid.Col>
                                        <Grid.Col span={3} className="font-thin text-right">
                                            Standard
                                        </Grid.Col>
                                        <Grid.Col span={3}>
                                            <div className="flex justify-center">
                                                <Switch
                                                    classNames={{
                                                        input: 'switch-input'
                                                    }}
                                                    className="hover:cursor-pointer"
                                                    size="md"
                                                    checked={maxQuality}
                                                    onChange={(ev: React.FormEvent<HTMLInputElement>) => setMaxQuality(ev.currentTarget?.checked)} />
                                            </div>
                                        </Grid.Col>
                                        <Grid.Col span={4} className="font-thin text-left">
                                            Maximum
                                        </Grid.Col>
                                        <Grid.Col span={16}>
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
                maxQuality={maxQuality}
            />
        </>
    );
};