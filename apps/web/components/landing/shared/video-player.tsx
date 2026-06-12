"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faStop,
  faVolumeHigh,
  faVolumeXmark,
  faExpand,
  faCompress,
  faBackwardStep,
  faForwardStep,
} from "@fortawesome/free-solid-svg-icons";

const videoPlayerVariants = cva(
  "relative w-full aspect-video bg-black rounded-card overflow-hidden group",
  {
    variants: {
      size: {
        sm: "max-w-md",
        default: "max-w-2xl",
        lg: "max-w-4xl",
        full: "w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface VideoPlayerProps
  extends React.VideoHTMLAttributes<HTMLVideoElement>,
  VariantProps<typeof videoPlayerVariants> {
  src: string;
  poster?: string;
  showControls?: boolean;
  autoHide?: boolean;
  className?: string;
}

const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      className,
      size,
      src,
      poster,
      showControls = true,
      autoHide = true,
      autoPlay,
      muted,
      ...props
    },
    ref,
  ) => {
    const [isPlaying, setIsPlaying] = React.useState(!!autoPlay);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(!!muted);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [showControlsState, setShowControlsState] = React.useState(!autoPlay);

    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const hideControlsTimeoutRef =
      React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useImperativeHandle(ref, () => videoRef.current!, []);

    const isFiniteTime = (t: number) => Number.isFinite(t) && t >= 0;

    const formatTime = (time: number) => {
      if (!isFiniteTime(time)) return "--:--";
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);
      return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        : `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const hasFiniteDuration = isFiniteTime(duration) && duration > 0;
    const safeProgressPct = hasFiniteDuration
      ? Math.min(100, (currentTime / duration) * 100)
      : 0;

    const togglePlay = () => {
      const v = videoRef.current;
      if (!v) return;
      if (isPlaying) {
        v.pause();
      } else {
        void v.play();
      }
    };

    const stopPlayback = () => {
      const v = videoRef.current;
      if (!v) return;
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* no-op */
      }
      setCurrentTime(0);
      setIsPlaying(false);
      setShowControlsState(true);
    };

    const toggleMute = () => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = !isMuted;
      setIsMuted(v.muted);
    };

    const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      const v = videoRef.current;
      if (v) {
        v.volume = newVolume;
        if (newVolume > 0 && v.muted) v.muted = false;
      }
      setIsMuted(newVolume === 0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = videoRef.current;
      if (!v) return;
      const newTime = parseFloat(e.target.value);
      const clamped = hasFiniteDuration
        ? Math.max(0, Math.min(duration, newTime))
        : 0;
      setCurrentTime(clamped);
      v.currentTime = clamped;
    };

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        void containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        void document.exitFullscreen();
        setIsFullscreen(false);
      }
    };

    const skip = (seconds: number) => {
      const v = videoRef.current;
      if (!v) return;
      const target = (hasFiniteDuration ? currentTime : v.currentTime) + seconds;
      const clamped = hasFiniteDuration
        ? Math.max(0, Math.min(duration, target))
        : Math.max(0, target);
      v.currentTime = clamped;
      setCurrentTime(clamped);
    };

    const resetHideControlsTimeout = () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (autoHide && isPlaying) {
        hideControlsTimeoutRef.current = setTimeout(() => {
          setShowControlsState(false);
        }, 3000);
      }
    };

    const handleMouseMove = () => {
      setShowControlsState(true);
      resetHideControlsTimeout();
    };

    React.useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      const pickDuration = () => {
        let d = v.duration;
        if (!Number.isFinite(d)) {
          if (v.seekable && v.seekable.length > 0) {
            d = v.seekable.end(v.seekable.length - 1);
          }
        }
        setDuration(Number.isFinite(d) ? d : 0);
      };

      const onLoadedMetadata = () => pickDuration();
      const onDurationChange  = () => pickDuration();
      const onLoadedData      = () => pickDuration();
      const onTimeUpdate      = () => setCurrentTime(v.currentTime);
      const onPlay = () => {
        setIsPlaying(true);
        resetHideControlsTimeout();
      };
      const onPause = () => {
        setIsPlaying(false);
        setShowControlsState(true);
        if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      };
      const onEnded = () => {
        setIsPlaying(false);
        setShowControlsState(true);
      };
      const onVolumeChange = () => {
        setVolume(v.volume);
        setIsMuted(v.muted || v.volume === 0);
      };

      v.addEventListener("loadedmetadata", onLoadedMetadata);
      v.addEventListener("durationchange",  onDurationChange);
      v.addEventListener("loadeddata",      onLoadedData);
      v.addEventListener("timeupdate",      onTimeUpdate);
      v.addEventListener("play",            onPlay);
      v.addEventListener("pause",           onPause);
      v.addEventListener("ended",           onEnded);
      v.addEventListener("volumechange",    onVolumeChange);

      pickDuration();

      return () => {
        v.removeEventListener("loadedmetadata", onLoadedMetadata);
        v.removeEventListener("durationchange",  onDurationChange);
        v.removeEventListener("loadeddata",      onLoadedData);
        v.removeEventListener("timeupdate",      onTimeUpdate);
        v.removeEventListener("play",            onPlay);
        v.removeEventListener("pause",           onPause);
        v.removeEventListener("ended",           onEnded);
        v.removeEventListener("volumechange",    onVolumeChange);
        if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoHide]);

    React.useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      v.volume = Math.max(0, Math.min(1, volume));
      if (volume > 0 && v.muted) v.muted = false;
    }, [volume]);

    React.useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = isMuted;
    }, [isMuted]);

    React.useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      if (autoPlay) {
        v.muted = true;
        void v.play().catch((err) => {
          console.warn("Autoplay blocked or failed:", err);
        });
      }
    }, [autoPlay, src]);

    React.useEffect(() => {
      const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", onFsChange);
      return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!containerRef.current?.contains(document.activeElement)) return;
        switch (e.key) {
          case " ":
          case "k":
            e.preventDefault(); togglePlay(); break;
          case "m":
            e.preventDefault(); toggleMute(); break;
          case "f":
            e.preventDefault(); toggleFullscreen(); break;
          case "s":
          case "Home":
            e.preventDefault(); stopPlayback(); break;
          case "End":
            e.preventDefault();
            if (hasFiniteDuration) {
              const v = videoRef.current;
              if (v) { v.currentTime = duration; setCurrentTime(duration); }
            }
            break;
          case "ArrowLeft":  e.preventDefault(); skip(-10); break;
          case "ArrowRight": e.preventDefault(); skip(10);  break;
          case "ArrowUp":
            e.preventDefault();
            setVolume((prev) => Math.min(1, +(prev + 0.1).toFixed(2))); break;
          case "ArrowDown":
            e.preventDefault();
            setVolume((prev) => Math.max(0, +(prev - 0.1).toFixed(2))); break;
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTime, duration, hasFiniteDuration, isPlaying]);

    // Inline style helpers — using CSS custom properties so they resolve correctly
    // in both light and dark contexts, always using the primary teal token.
    const sliderStyle = (pct: number): React.CSSProperties => ({
      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, oklch(0.906 0.009 86 / 0.25) ${pct}%, oklch(0.906 0.009 86 / 0.25) 100%)`,
    });

    return (
      <div
        ref={containerRef}
        className={cn(videoPlayerVariants({ size }), className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => autoHide && isPlaying && setShowControlsState(false)}
        tabIndex={0}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="metadata"
          autoPlay={autoPlay}
          muted={muted}
          playsInline
          className="w-full h-full object-cover"
          onClick={togglePlay}
          {...props}
        />

        {showControls && (
          <>
            {/* ── Centre play / pause overlay ──────────────────────────────── */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300",
                !isPlaying || showControlsState ? "opacity-100" : "opacity-0",
              )}
            >
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="
                  pointer-events-auto
                  flex h-16 w-16 items-center justify-center rounded-full
                  bg-primary text-primary-foreground
                  shadow-[0_0_32px_4px_var(--color-primary)] ring-2 ring-primary/40
                  transition-all duration-200
                  hover:scale-110 hover:shadow-[0_0_48px_8px_var(--color-primary)]
                  active:scale-95
                "
              >
                <FontAwesomeIcon
                  icon={isPlaying ? faPause : faPlay}
                  className={cn("h-5 w-5", !isPlaying && "ms-1 rtl:-scale-x-100")}
                />
              </button>
            </div>

            {/* ── Bottom controls bar ───────────────────────────────────────── */}
            <div
              className={cn(
                "absolute bottom-0 start-0 end-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none",
                showControlsState ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="p-4 space-y-3 pointer-events-auto">

                {/* Seek bar */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="min-w-0 text-xs font-mono text-white/70">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative group/progress">
                    <input
                      type="range"
                      min={0}
                      max={hasFiniteDuration ? duration : 0}
                      value={hasFiniteDuration ? currentTime : 0}
                      disabled={!hasFiniteDuration}
                      onChange={(e) => { e.stopPropagation(); handleSeek(e); }}
                      style={sliderStyle(safeProgressPct)}
                      className="
                        w-full h-1.5 rounded-full appearance-none cursor-pointer
                        transition-all duration-150
                        group-hover/progress:h-2
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-0
                        [&::-webkit-slider-thumb]:h-0
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:duration-150
                        group-hover/progress:[&::-webkit-slider-thumb]:w-3.5
                        group-hover/progress:[&::-webkit-slider-thumb]:h-3.5
                        group-hover/progress:[&::-webkit-slider-thumb]:shadow-[0_0_8px_2px_var(--color-primary)]
                        disabled:cursor-not-allowed
                      "
                      aria-label="Seek"
                    />
                  </div>
                  <span className="min-w-0 text-xs font-mono text-white/70">
                    {hasFiniteDuration ? formatTime(duration) : "--:--"}
                  </span>
                </div>

                {/* Button row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">

                    <button
                      onClick={(e) => { e.stopPropagation(); skip(-10); }}
                      aria-label="Rewind 10 seconds"
                      className="p-2 text-white/70 hover:text-primary hover:bg-primary/15 rounded-lg transition-all duration-150"
                    >
                      <FontAwesomeIcon icon={faBackwardStep} className="h-4 w-4 rtl:-scale-x-100" />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      className="p-2 text-primary hover:bg-primary/15 rounded-lg transition-all duration-150"
                    >
                      <FontAwesomeIcon
                        icon={isPlaying ? faPause : faPlay}
                        className={cn("h-4 w-4", !isPlaying && "ms-0.5 rtl:-scale-x-100")}
                      />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); stopPlayback(); }}
                      aria-label="Stop"
                      className="p-2 text-white/70 hover:text-primary hover:bg-primary/15 rounded-lg transition-all duration-150"
                    >
                      <FontAwesomeIcon icon={faStop} className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); skip(10); }}
                      aria-label="Forward 10 seconds"
                      className="p-2 text-white/70 hover:text-primary hover:bg-primary/15 rounded-lg transition-all duration-150"
                    >
                      <FontAwesomeIcon icon={faForwardStep} className="h-4 w-4 rtl:-scale-x-100" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-1.5 group/volume">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                        aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                        className="p-2 text-white/70 hover:text-primary hover:bg-primary/15 rounded-lg transition-all duration-150"
                      >
                        <FontAwesomeIcon
                          icon={isMuted || volume === 0 ? faVolumeXmark : faVolumeHigh}
                          className="h-4 w-4"
                        />
                      </button>
                      <div className="w-0 group-hover/volume:w-20 transition-all duration-200 overflow-hidden">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => { e.stopPropagation(); handleVolumeSlider(e); }}
                          style={sliderStyle((isMuted ? 0 : volume) * 100)}
                          className="
                            w-full h-1.5 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-2.5
                            [&::-webkit-slider-thumb]:h-2.5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-primary
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:shadow-[0_0_6px_1px_var(--color-primary)]
                          "
                          aria-label="Volume"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    className="p-2 text-white/70 hover:text-primary hover:bg-primary/15 rounded-lg transition-all duration-150"
                  >
                    <FontAwesomeIcon
                      icon={isFullscreen ? faCompress : faExpand}
                      className="h-4 w-4"
                    />
                  </button>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer, videoPlayerVariants };