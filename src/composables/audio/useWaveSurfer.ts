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
      cursorColor: "white",
      cursorWidth: 8,
      height: 100,
      fillParent: true,
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
        const playPromise = wavesurfer.value.play();
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

  const adjustStartTime = (delta: number) => {
    const newStart = Math.max(
      0,
      Math.min(region.value[0] + delta, region.value[1] - 0.1)
    );
    const regions = regionsPlugin.value.getRegions();
    if (regions.length > 0) {
      const r = regions[0];
      r.setOptions({ start: newStart, end: region.value[1] });
      updateExportRegion({ start: newStart, end: region.value[1] });
    }
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
      updateExportRegion({ start: region.value[0], end: newEnd });
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
      });

      newRegion.on("update-end", () => {
        updateExportRegion({ start: newRegion.start, end: newRegion.end });
      });
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
    adjustStartTime,
    adjustEndTime,
    resetRegion,
  };
}
