import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

/**
 * Composable for managing WaveSurfer instance, region selection, and playback controls
 * @param rawAudio - The audio file to load
 * @param rawAudioDuration - Duration of the audio file in seconds
 * @returns Object containing wavesurfer instance, playback controls, region management functions
 */
export function useWaveSurfer(rawAudio: File, rawAudioDuration: number) {
  const wavesurfer = ref<any>(null);
  const regionsPlugin = ref<any>(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const cursorPosition = ref(-1);
  const cursorTime = ref(0);
  const region = ref([0, rawAudioDuration]);
  const isLoading = ref(true);

  // Fade effect state
  const fadeInEnabled = ref(false);
  const fadeOutEnabled = ref(false);
  const fadeInDuration = ref(3.0); // Increased default from 1.0 to 3.0 seconds
  const fadeOutDuration = ref(3.0); // Increased default from 1.0 to 3.0 seconds
  const baseVolume = ref(1.0); // Store the base volume for fade calculations

  // Calculate fade volume based on current time and fade settings
  const calculateFadeVolume = (currentTime: number): number => {
    // Only apply fade effects if we're within the selected region
    if (currentTime < region.value[0] || currentTime > region.value[1]) {
      return baseVolume.value;
    }

    let fadeMultiplier = 1.0;
    const regionStart = region.value[0];
    const regionEnd = region.value[1];

    // Apply fade in effect
    if (fadeInEnabled.value && currentTime >= regionStart) {
      const fadeInEnd = regionStart + fadeInDuration.value;
      if (currentTime <= fadeInEnd) {
        const fadeProgress = (currentTime - regionStart) / fadeInDuration.value;
        // Use exponential curve for natural fade
        fadeMultiplier = Math.min(fadeMultiplier, 1 - Math.exp(-3 * fadeProgress));
      }
    }

    // Apply fade out effect
    if (fadeOutEnabled.value && currentTime <= regionEnd) {
      const fadeOutStart = regionEnd - fadeOutDuration.value;
      if (currentTime >= fadeOutStart) {
        const fadeProgress = (currentTime - fadeOutStart) / fadeOutDuration.value;
        // Use exponential curve for natural fade
        fadeMultiplier = Math.min(fadeMultiplier, Math.exp(-3 * fadeProgress));
      }
    }

    return baseVolume.value * Math.max(0, fadeMultiplier);
  };

  // Custom renderer function for fade effects
  const customRenderer = (
    peaks: (number[] | Float32Array)[],
    ctx: CanvasRenderingContext2D
  ) => {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);

    const channel = peaks[0];
    const length = channel.length;
    const barWidth = width / length;
    const totalDuration = rawAudioDuration;

    // Calculate region positions in pixels
    const regionStartPixel = (region.value[0] / totalDuration) * width;
    const regionEndPixel = (region.value[1] / totalDuration) * width;

    // Calculate fade areas in pixels relative to the region
    const fadeInPixels = fadeInEnabled.value
      ? (fadeInDuration.value / totalDuration) * width
      : 0;
    const fadeOutPixels = fadeOutEnabled.value
      ? (fadeOutDuration.value / totalDuration) * width
      : 0;

    // Fade in starts at region start
    const fadeInEndPixel = regionStartPixel + fadeInPixels;
    // Fade out ends at region end
    const fadeOutStartPixel = regionEndPixel - fadeOutPixels;

    for (let i = 0; i < length; i++) {
      const x = i * barWidth;
      const sample = Math.abs(channel[i]);
      const barHeight = sample * height;

      // Calculate fade multiplier for bar height
      let fadeMultiplier = 1;
      let color = "#10b981"; // Default green

      // Apply fade in effect (from region start)
      if (fadeInEnabled.value && x >= regionStartPixel && x <= fadeInEndPixel) {
        const fadeProgress = (x - regionStartPixel) / fadeInPixels;
        fadeMultiplier = Math.max(0.1, fadeProgress);
      }

      // Apply fade out effect (to region end)
      if (fadeOutEnabled.value && x >= fadeOutStartPixel && x <= regionEndPixel) {
        const fadeProgress = (x - fadeOutStartPixel) / fadeOutPixels;
        fadeMultiplier = Math.min(fadeMultiplier, Math.max(0.1, 1 - fadeProgress));
      }

      // Apply fade to bar height
      const fadedBarHeight = barHeight * fadeMultiplier;
      const fadedY = (height - fadedBarHeight) / 2;

      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.fillRect(x, fadedY, Math.max(1, barWidth), fadedBarHeight);
    }

    ctx.globalAlpha = 1;
  };

  const initializeWaveSurfer = async () => {
    await nextTick();

    const container = document.querySelector("#waveform");
    if (!container) {
      console.error("WaveSurfer container not found");
      return;
    }

    regionsPlugin.value = RegionsPlugin.create();

    wavesurfer.value = WaveSurfer.create({
      container: container as HTMLElement,
      waveColor: "#10b981",
      progressColor: "#059669",
      normalize: true,
      backend: "WebAudio",
      interact: true,
      cursorColor: "transparent",
      cursorWidth: 0,
      height: 100,
      fillParent: true,
      renderFunction: customRenderer,
      plugins: [
        regionsPlugin.value,
        TimelinePlugin.create({
          container: "#wave-timeline",
        }),
      ],
    });

    // Event listeners
    wavesurfer.value.on("ready", () => {
      const regionInstance = regionsPlugin.value.addRegion({
        start: 0,
        end: rawAudioDuration,
        loop: true,
        color: "rgba(0, 0, 0, 0)",
        drag: true,
        resize: true,
      });

      regionInstance.on("update-end", () => {
        updateExportRegion({
          start: regionInstance.start,
          end: regionInstance.end,
        });
      });

      // Track is ready, stop loading
      isLoading.value = false;
    });

    wavesurfer.value.on("play", () => {
      isPlaying.value = true;
    });

    wavesurfer.value.on("pause", () => {
      isPlaying.value = false;
    });

    wavesurfer.value.on("timeupdate", (time: number) => {
      currentTime.value = time;

      // Apply real-time fade volume during playback
      if (isPlaying.value) {
        const fadeVolume = calculateFadeVolume(time);
        wavesurfer.value.setVolume(fadeVolume);
      }

      // Stop playback if we've reached the region end
      if (isPlaying.value && time >= region.value[1]) {
        wavesurfer.value.pause();
        isPlaying.value = false;
      }
    });

    // Mouse tracking
    const waveformEl = container as HTMLElement;
    waveformEl.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = waveformEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      cursorPosition.value = x;

      const duration = wavesurfer.value.getDuration();
      const progress = x / rect.width;
      cursorTime.value = duration * progress;
    });

    waveformEl.addEventListener("mouseleave", () => {
      cursorPosition.value = -1;
    });

    wavesurfer.value.on("error", (error: any) => {
      console.error("WaveSurfer error:", error);
    });

    isLoading.value = true;
    await wavesurfer.value.loadBlob(rawAudio);
  };

  const updateExportRegion = (updatedRegion: {
    start: number;
    end: number;
  }) => {
    if (updatedRegion.start !== region.value[0]) {
      wavesurfer.value?.play(updatedRegion.start, updatedRegion.end);
    }
    region.value = [updatedRegion.start, updatedRegion.end];
    
    // Redraw waveform if fade effects are enabled to update their positions
    if ((fadeInEnabled.value || fadeOutEnabled.value) && wavesurfer.value && !isLoading.value) {
      wavesurfer.value.setOptions({
        renderFunction: customRenderer,
      });
    }
  };

  const handlePlayPause = async () => {
    if (!wavesurfer.value) {
      console.warn("WaveSurfer instance not available");
      return;
    }

    try {
      if (isPlaying.value) {
        wavesurfer.value.pause();
      } else {
        // If current time is before region start or after region end, seek to region start
        const currentPos = wavesurfer.value.getCurrentTime();
        if (currentPos < region.value[0] || currentPos >= region.value[1]) {
          wavesurfer.value.seekTo(
            region.value[0] / wavesurfer.value.getDuration()
          );
        }

        // Play from current position to region end
        const playPromise = wavesurfer.value.play(undefined, region.value[1]);
        if (playPromise && typeof playPromise.catch === "function") {
          await playPromise.catch((error: any) => {
            console.error("Playback failed:", error);
            isPlaying.value = false;
          });
        }
      }
    } catch (error) {
      console.error("Error playing/pausing audio:", error);
      isPlaying.value = false;
    }
  };

  const handleStop = () => {
    if (!wavesurfer.value) {
      console.warn("WaveSurfer instance not available");
      return;
    }

    wavesurfer.value.pause();
    wavesurfer.value.seekTo(region.value[0] / wavesurfer.value.getDuration());
    isPlaying.value = false;
  };

  const adjustStartTime = (delta: number) => {
    const newStart = Math.max(
      0,
      Math.min(region.value[0] + delta, region.value[1] - 0.1)
    );
    const regions = regionsPlugin.value.getRegions();
    if (regions.length > 0) {
      const r = regions[0];
      r.setOptions({ start: newStart, end: region.value[1] });
    }
    // Always update the reactive region value for overlays
    updateExportRegion({ start: newStart, end: region.value[1] });
  };

  const adjustEndTime = (delta: number) => {
    const newEnd = Math.max(
      region.value[0] + 0.1,
      Math.min(region.value[1] + delta, rawAudioDuration)
    );
    const regions = regionsPlugin.value.getRegions();
    if (regions.length > 0) {
      const r = regions[0];
      r.setOptions({ start: region.value[0], end: newEnd });
    }
    // Always update the reactive region value for overlays
    updateExportRegion({ start: region.value[0], end: newEnd });
  };

  const setStartTime = (time: number) => {
    const newStart = Math.max(0, Math.min(time, region.value[1] - 0.1));
    const regions = regionsPlugin.value.getRegions();
    if (regions.length > 0) {
      const r = regions[0];
      r.setOptions({ start: newStart, end: region.value[1] });
    }
    updateExportRegion({ start: newStart, end: region.value[1] });
  };

  const setEndTime = (time: number) => {
    const newEnd = Math.max(
      region.value[0] + 0.1,
      Math.min(time, rawAudioDuration)
    );
    const regions = regionsPlugin.value.getRegions();
    if (regions.length > 0) {
      const r = regions[0];
      r.setOptions({ start: region.value[0], end: newEnd });
    }
    updateExportRegion({ start: region.value[0], end: newEnd });
  };

  // Update base volume when volume changes
  const updateBaseVolume = (volume: number) => {
    baseVolume.value = volume;
    // If not playing, apply volume immediately
    if (!isPlaying.value && wavesurfer.value) {
      wavesurfer.value.setVolume(volume);
    }
  };

  // Fade effect functions
  const updateFadeIn = (enabled: boolean, duration: number = 1.0) => {
    fadeInEnabled.value = enabled;
    fadeInDuration.value = duration;
    if (wavesurfer.value && !isLoading.value) {
      // Use setOptions to trigger redraw with updated renderer
      wavesurfer.value.setOptions({
        renderFunction: customRenderer,
      });
      
      // If playing, update volume immediately with fade calculation
      if (isPlaying.value) {
        const fadeVolume = calculateFadeVolume(currentTime.value);
        wavesurfer.value.setVolume(fadeVolume);
      }
    }
  };

  const updateFadeOut = (enabled: boolean, duration: number = 1.0) => {
    fadeOutEnabled.value = enabled;
    fadeOutDuration.value = duration;
    if (wavesurfer.value && !isLoading.value) {
      // Use setOptions to trigger redraw with updated renderer
      wavesurfer.value.setOptions({
        renderFunction: customRenderer,
      });
      
      // If playing, update volume immediately with fade calculation
      if (isPlaying.value) {
        const fadeVolume = calculateFadeVolume(currentTime.value);
        wavesurfer.value.setVolume(fadeVolume);
      }
    }
  };

  const resetRegion = () => {
    if (regionsPlugin.value) {
      const regions = regionsPlugin.value.getRegions();
      regions.forEach((r: any) => r.remove());

      const newRegion = regionsPlugin.value.addRegion({
        start: 0,
        end: rawAudioDuration,
        loop: true,
        color: "rgba(0, 0, 0, 0)",
        drag: true,
        resize: true,
        width: 20,
      });

      newRegion.on("update-end", () => {
        updateExportRegion({ start: newRegion.start, end: newRegion.end });
      });

      // Update the reactive region value to remove overlays
      updateExportRegion({ start: 0, end: rawAudioDuration });
    }
    wavesurfer.value?.seekTo(0);
  };

  onMounted(initializeWaveSurfer);

  onBeforeUnmount(() => {
    if (wavesurfer.value) {
      wavesurfer.value.destroy();
      wavesurfer.value = null;
    }
  });

  return {
    wavesurfer,
    regionsPlugin,
    isPlaying,
    currentTime,
    cursorPosition,
    cursorTime,
    region,
    isLoading,
    updateExportRegion,
    handlePlayPause,
    handleStop,
    adjustStartTime,
    adjustEndTime,
    setStartTime,
    setEndTime,
    resetRegion,
    updateFadeIn,
    updateFadeOut,
    updateBaseVolume,
    fadeInEnabled,
    fadeOutEnabled,
    fadeInDuration,
    fadeOutDuration,
  };
}
