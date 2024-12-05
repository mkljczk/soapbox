import clsx from 'clsx';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Blurhash from 'pl-fe/components/blurhash';
import Icon from 'pl-fe/components/icon';
import { isPanoramic, isPortrait, minimumAspectRatio, maximumAspectRatio } from 'pl-fe/utils/media-aspect-ratio';

import { isFullscreen, requestFullscreen, exitFullscreen } from '../ui/util/fullscreen';

const DEFAULT_HEIGHT = 300;

type Position = { x: number; y: number };

const messages = defineMessages({
  play: { id: 'video.play', defaultMessage: 'Play' },
  pause: { id: 'video.pause', defaultMessage: 'Pause' },
  mute: { id: 'video.mute', defaultMessage: 'Mute sound' },
  unmute: { id: 'video.unmute', defaultMessage: 'Unmute sound' },
  fullscreen: { id: 'video.fullscreen', defaultMessage: 'Full screen' },
  exit_fullscreen: { id: 'video.exit_fullscreen', defaultMessage: 'Exit full screen' },
});

const formatTime = (secondsNum: number): string => {
  let hours: number | string = Math.floor(secondsNum / 3600);
  let minutes: number | string = Math.floor((secondsNum - (hours * 3600)) / 60);
  let seconds: number | string = secondsNum - (hours * 3600) - (minutes * 60);

  if (hours   < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;

  return (hours === '00' ? '' : `${hours}:`) + `${minutes}:${seconds}`;
};

const findElementPosition = (el: HTMLElement) => {
  let box;

  if (el.getBoundingClientRect && el.parentNode) {
    box = el.getBoundingClientRect();
  }

  if (!box) {
    return {
      left: 0,
      top: 0,
    };
  }

  const docEl = document.documentElement;
  const body = document.body;

  const clientLeft = docEl.clientLeft || body.clientLeft || 0;
  const scrollLeft = window.pageXOffset || body.scrollLeft;
  const left = (box.left + scrollLeft) - clientLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const scrollTop = window.pageYOffset || body.scrollTop;
  const top = (box.top + scrollTop) - clientTop;

  return {
    left: Math.round(left),
    top: Math.round(top),
  };
};

const getPointerPosition = (el: HTMLElement, event: MouseEvent & TouchEvent): Position => {
  const box = findElementPosition(el);
  const boxW = el.offsetWidth;
  const boxH = el.offsetHeight;
  const boxY = box.top;
  const boxX = box.left;

  let pageY = event.pageY;
  let pageX = event.pageX;

  if (event.changedTouches) {
    pageX = event.changedTouches[0].pageX;
    pageY = event.changedTouches[0].pageY;
  }

  return {
    y: Math.max(0, Math.min(1, (pageY - boxY) / boxH)),
    x: Math.max(0, Math.min(1, (pageX - boxX) / boxW)),
  };
};

interface IVideo {
  preview?: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  startTime?: number;
  detailed?: boolean;
  autoFocus?: boolean;
  inline?: boolean;
  cacheWidth?: (width: number) => void;
  visible?: boolean;
  blurhash?: string | null;
  link?: React.ReactNode;
  aspectRatio?: number;
  displayMedia?: string;
}

const Video: React.FC<IVideo> = ({
  width,
  visible = false,
  detailed = false,
  autoFocus = false,
  cacheWidth,
  startTime,
  src,
  height,
  alt,
  inline,
  aspectRatio = 16 / 9,
  link,
  blurhash,
}) => {
  const intl = useIntl();

  const player = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const seek = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [paused, setPaused] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(width);
  const [fullscreen, setFullscreen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffer, setBuffer] = useState(0);

  const setDimensions = () => {
    if (player.current) {
      const { offsetWidth } = player.current;

      if (cacheWidth) {
        cacheWidth(offsetWidth);
      }

      setContainerWidth(offsetWidth);
    }
  };

  useLayoutEffect(() => {
    setDimensions();
  }, [player.current]);

  useEffect(() => {
    if (video.current) {
      setVolume(video.current.volume);
      setMuted(video.current.muted);
    }
  }, [video.current]);

  const handleClickRoot: React.MouseEventHandler = e => e.stopPropagation();

  const handlePlay = () => {
    setPaused(false);
  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleTimeUpdate = () => {
    if (video.current) {
      setCurrentTime(Math.floor(video.current.currentTime));
      setDuration(Math.floor(video.current.duration));
    }
  };

  const handleVolumeMouseDown: React.MouseEventHandler = e => {
    document.addEventListener('mousemove', handleMouseVolSlide, true);
    document.addEventListener('mouseup', handleVolumeMouseUp, true);
    document.addEventListener('touchmove', handleMouseVolSlide, true);
    document.addEventListener('touchend', handleVolumeMouseUp, true);

    handleMouseVolSlide(e);

    e.preventDefault();
    e.stopPropagation();
  };

  const handleVolumeMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseVolSlide, true);
    document.removeEventListener('mouseup', handleVolumeMouseUp, true);
    document.removeEventListener('touchmove', handleMouseVolSlide, true);
    document.removeEventListener('touchend', handleVolumeMouseUp, true);
  };

  const handleMouseVolSlide = throttle(e => {
    if (slider.current) {
      const { x } = getPointerPosition(slider.current, e);

      if (!isNaN(x)) {
        let slideamt = x;

        if (x > 1) {
          slideamt = 1;
        } else if (x < 0) {
          slideamt = 0;
        }

        if (video.current) {
          video.current.volume = slideamt;
        }

        setVolume(slideamt);
      }
    }
  }, 60);

  const handleMouseDown: React.MouseEventHandler = e => {
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('touchmove', handleMouseMove, true);
    document.addEventListener('touchend', handleMouseUp, true);

    setDragging(true);
    video.current?.pause();
    handleMouseMove(e);

    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('mouseup', handleMouseUp, true);
    document.removeEventListener('touchmove', handleMouseMove, true);
    document.removeEventListener('touchend', handleMouseUp, true);

    setDragging(false);
    video.current?.play();
  };

  const handleMouseMove = throttle(e => {
    if (seek.current && video.current) {
      const { x } = getPointerPosition(seek.current, e);
      const currentTime = Math.floor(video.current.duration * x);

      if (!isNaN(currentTime)) {
        video.current.currentTime = currentTime;
        setCurrentTime(currentTime);
      }
    }
  }, 60);

  const seekBy = (time: number) => {
    if (video.current) {
      const currentTime = video.current.currentTime + time;

      if (!isNaN(currentTime)) {
        setCurrentTime(currentTime);
        video.current.currentTime = currentTime;
      }
    }
  };

  const handleVideoKeyDown: React.KeyboardEventHandler = e => {
    // On the video element or the seek bar, we can safely use the space bar
    // for playback control because there are no buttons to press

    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      togglePlay();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = e => {
    const frameTime = 1 / 25;

    switch (e.key) {
      case 'k':
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
        break;
      case 'm':
        e.preventDefault();
        e.stopPropagation();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        e.stopPropagation();
        toggleFullscreen();
        break;
      case 'j':
        e.preventDefault();
        e.stopPropagation();
        seekBy(-10);
        break;
      case 'l':
        e.preventDefault();
        e.stopPropagation();
        seekBy(10);
        break;
      case ',':
        e.preventDefault();
        e.stopPropagation();
        seekBy(-frameTime);
        break;
      case '.':
        e.preventDefault();
        e.stopPropagation();
        seekBy(frameTime);
        break;
    }

    // If we are in fullscreen mode, we don't want any hotkeys
    // interacting with the UI that's not visible
    if (fullscreen) {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        exitFullscreen();
      }
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    setPaused(!paused);

    if (paused) {
      video.current?.play();
    } else {
      video.current?.pause();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else if (player.current) {
      requestFullscreen(player.current);
    }
  };

  const handleResize = useCallback(debounce(() => {
    setDimensions();
  }, 250, {
    trailing: true,
  }), [player.current, cacheWidth]);

  const handleScroll = useCallback(throttle(() => {
    if (!video.current) return;

    const { top, height } = video.current.getBoundingClientRect();
    const inView = (top <= (window.innerHeight || document.documentElement.clientHeight)) && (top + height >= 0);

    if (!paused && !inView) {
      setPaused(true);
      video.current.pause();
    }
  }, 150, { trailing: true }), [video.current, paused]);

  const handleFullscreenChange = useCallback(() => {
    setFullscreen(isFullscreen());
  }, []);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const toggleMute = () => {
    if (video.current) {
      const muted = !video.current.muted;
      setMuted(!muted);
      video.current.muted = muted;
    }
  };

  const handleLoadedData = () => {
    if (video.current && startTime) {
      video.current.currentTime = startTime;
      video.current.play();
    }
  };

  const handleProgress = () => {
    if (video.current && video.current.buffered.length > 0) {
      setBuffer(video.current.buffered.end(0) / video.current.duration * 100);
    }
  };

  const handleVolumeChange = () => {
    if (video.current) {
      setVolume(video.current.volume);
      setMuted(video.current.muted);
    }
  };

  const progress = (currentTime / duration) * 100;
  const playerStyle: React.CSSProperties = {};

  if (inline && containerWidth) {
    width = containerWidth;
    const minSize = containerWidth / (16 / 9);

    if (isPanoramic(aspectRatio)) {
      height = Math.max(Math.floor(containerWidth / maximumAspectRatio), minSize);
    } else if (isPortrait(aspectRatio)) {
      height = Math.max(Math.floor(containerWidth / minimumAspectRatio), minSize);
    } else {
      height = Math.floor(containerWidth / aspectRatio);
    }

    playerStyle.height = height || DEFAULT_HEIGHT;
  }

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange, true);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange, true);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange, true);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange, true);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      document.removeEventListener('fullscreenchange', handleFullscreenChange, true);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange, true);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange, true);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange, true);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      video.current?.pause();
    }
  }, [visible]);

  return (
    <div
      role='menuitem'
      className={clsx('video-player relative box-border max-h-screen max-w-full overflow-hidden rounded-[10px] bg-black text-white [direction:ltr] focus:outline-0', { 'h-full w-full m-0': fullscreen })}
      style={playerStyle}
      ref={player}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClickRoot}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {!fullscreen && (
        <Blurhash hash={blurhash} className='media-gallery__preview' />
      )}

      <video
        className={clsx('relative z-[1] block h-full max-h-full', {
          'object-contain': inline && !fullscreen,
          'w-full outline-0 !max-h-full !max-w-full': fullscreen,
        })}
        ref={video}
        src={src}
        loop
        role='button'
        tabIndex={0}
        aria-label={alt}
        title={alt}
        width={width}
        height={height || DEFAULT_HEIGHT}
        onClick={togglePlay}
        onKeyDown={handleVideoKeyDown}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onProgress={handleProgress}
        onVolumeChange={handleVolumeChange}
      />

      <div className={clsx('video-player__controls absolute inset-x-0 bottom-0 z-[2] box-border px-4 py-0 opacity-0 ring-0 transition-opacity duration-100 ease-in-out', { 'opacity-100': paused || hovered })}>
        <div className='video-player__seek' onMouseDown={handleMouseDown} ref={seek}>
          <div className='absolute top-3.5 block h-1 rounded bg-white/20' style={{ width: `${buffer}%` }} />
          <div className='bg-accent-500 absolute top-3.5 block h-1 rounded' style={{ width: `${progress}%` }} />

          <span
            className={clsx('video-player__seek__handle', { 'opacity-100': dragging })}
            tabIndex={0}
            style={{ left: `${progress}%` }}
            onKeyDown={handleVideoKeyDown}
          />
        </div>

        <div className='mx-[-5px] my-0 flex justify-between pb-2'>
          <div className='video-player__buttons left'>
            <button
              type='button'
              title={intl.formatMessage(paused ? messages.play : messages.pause)}
              aria-label={intl.formatMessage(paused ? messages.play : messages.pause)}
              className={clsx('player-button', detailed || fullscreen && 'py-2.5')}
              onClick={togglePlay}
              autoFocus={autoFocus}
            >
              <Icon src={paused ? require('@tabler/icons/outline/player-play.svg') : require('@tabler/icons/outline/player-pause.svg')} />
            </button>

            <button
              type='button'
              title={intl.formatMessage(muted ? messages.unmute : messages.mute)}
              aria-label={intl.formatMessage(muted ? messages.unmute : messages.mute)}
              className={clsx('player-button', detailed || fullscreen && 'py-2.5')}
              onClick={toggleMute}
            >
              <Icon src={muted ? require('@tabler/icons/outline/volume-3.svg') : require('@tabler/icons/outline/volume.svg')} />
            </button>

            <div className={clsx('video-player__volume', { 'overflow-visible w-12 mr-4': hovered })} onMouseDown={handleVolumeMouseDown} ref={slider}>
              <div className='video-player__volume__current' style={{ width: `${volume * 100}%` }} />
              <span
                className={clsx('video-player__volume__handle', { 'opacity-100': dragging || hovered })}
                tabIndex={0}
                style={{ left: `${volume * 100}%` }}
              />
            </div>

            {(detailed || fullscreen) && (
              <span>
                <span className='text-sm font-medium text-white'>{formatTime(currentTime)}</span>
                <span className='mx-1.5 my-0 inline-block text-sm font-medium text-white'>/</span>
                <span className='text-sm font-medium'>{formatTime(duration)}</span>
              </span>
            )}

            {link && (
              <span className='video-player__link px-2.5 py-0.5'>{link}</span>
            )}
          </div>

          <div className='video-player__buttons right'>
            <button
              type='button'
              title={intl.formatMessage(fullscreen ? messages.exit_fullscreen : messages.fullscreen)}
              aria-label={intl.formatMessage(fullscreen ? messages.exit_fullscreen : messages.fullscreen)}
              className={clsx('player-button', detailed || fullscreen && 'py-2.5')}
              onClick={toggleFullscreen}
            >
              <Icon src={fullscreen ? require('@tabler/icons/outline/arrows-minimize.svg') : require('@tabler/icons/outline/arrows-maximize.svg')} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export {
  formatTime,
  getPointerPosition,
  Video as default,
};
