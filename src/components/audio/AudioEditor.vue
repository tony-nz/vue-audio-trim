<template>
  <div class="flex flex-col w-full flex-nowrap">
    <div
      class="action-tabs flex justify-center items-center gap-4 shadow-md p-8"
    >
      <BaseButton
        v-for="action in actions"
        :key="action.key"
        :class="{ 'shadow-lg': selectedAction === action.key }"
        :color="selectedAction === action.key ? 'primary' : 'blue-grey-7'"
        :tooltip="action.tooltip"
        :flat="selectedAction !== action.key"
        @click="selectAction(action.key)"
      >
        <i :class="`pi pi-${action.icon}`" class="text-lg" />
      </BaseButton>
      <BaseButton
        color="blue-grey-7"
        tooltip="Close"
        flat
        @click="showCloseAudioDialog"
      >
        <i class="pi pi-times text-lg" />
      </BaseButton>
    </div>

    <div class="waveform-wrapper">
      <div id="waveform" class="waveform" />

      <div
        class="waveform__time flex justify-center items-center text-blue-500 text-base font-medium"
      >
        {{ formatTime(region[0]) }}
        —
        {{ formatTime(region[1]) }}
      </div>
    </div>

    <div
      class="bottom-section flex flex-col items-center gap-16 py-12 shadow-md"
    >
      <BaseButton
        class="shadow-14"
        color="primary"
        size="20px"
        padding="sm xl"
        tabindex="0"
        unelevated
        @click="handlePlayPause"
      >
        <transition name="zoom" mode="out-in">
          <i v-if="isPlaying" class="pi pi-pause play-icon" />
          <i v-else class="pi pi-play play-icon" />
        </transition>
      </BaseButton>

      <div v-show="selectedAction === 'volume'">
        <AudioEditorSliderVolume
          :model-value="volume"
          label="Browser volume"
          @update:model-value="setVolume"
        />
        <AudioEditorSliderVolume
          v-model="exportedVolume"
          label="Export volume"
        />
      </div>
      <div v-show="selectedAction === 'speed'">
        <div class="text-subtitle2 text-center">
          Average BPM ~{{
            musicInfo?.tempo
              ? Math.round(musicInfo?.tempo * (speed / 100))
              : "Undefined"
          }}
        </div>
        <AudioEditorSlider
          :model-value="speed"
          label="Speed"
          :label-value="speed / 100"
          :min="10"
          :max="300"
          :step="10"
          @update:model-value="setSpeed"
        />
      </div>
      <div v-show="selectedAction === 'bitrate'">
        <AudioEditorSlider
          v-model="bitrate"
          label="Export bitrate"
          :min="16"
          :max="320"
        />
      </div>
      <div v-show="selectedAction === 'equalizer'" class="flex flex-row gap-4">
        <div class="flex flex-row gap-2">
          <AudioEditorSlider
            v-for="(item, index) in equalizer"
            :key="item.f"
            :model-value="item.value"
            :label="item.f.toString()"
            :min="-12"
            :max="12"
            vertical
            reverse
            @update:model-value="updateEqualizer($event, index)"
          />
        </div>
        <BaseButton
          class="self-center"
          style="margin-bottom: 28px"
          icon="restart_alt"
          tooltip="Reset EQ"
          @click="resetEqualizer"
        />
      </div>
      <BaseButton
        class="shadow-14"
        label="Export"
        color="primary"
        padding="sm xl"
        unelevated
        @click="exportAudio"
      />
    </div>

    <BaseDialog
      title="Finding song BPM"
      confirm-text="Confirm"
      confirm-classes="full-width"
      :confirm-loading="isTempoLoading"
      :model-value="dialog.openedName.value === 'findBPM'"
      hide-close-button
      hide-close-icon
    >
      Please wait 5-20 seconds
    </BaseDialog>
    <BaseDialog
      type="delete"
      title="Close current audio"
      confirm-text="Confirm"
      :model-value="dialog.openedName.value === 'closeConfirm'"
      @close="dialog.close"
      @confirm="$emit('close')"
    >
      Are you sure you want to close this file?
    </BaseDialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  nextTick,
} from "vue";

import AudioEditorSliderVolume from "./AudioEditorSliderVolume.vue";

import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
// @ts-ignore
import lamejs from 'lamejs';
import MusicTempo from "music-tempo";

import AudioEditorSlider from "./AudioEditorSlider.vue";
import BaseButton from "../common/BaseButton.vue";
import BaseDialog from "../common/BaseDialog.vue";
import useDialog from "../../composables/common/useDialog";

interface EventTargetWithResult extends EventTarget {
  result: string;
}

interface MusicTempoData {
  tempo?: number;
}

interface EqItem {
  f: number;
  type: BiquadFilterType;
  value: number;
}

export default defineComponent({
  name: "AudioEditor",

  components: {
    AudioEditorSlider,
    AudioEditorSliderVolume,
    BaseButton,
    BaseDialog,
  },

  props: {
    rawAudio: {
      type: File,
      default: null,
    },
    rawAudioDuration: {
      type: Number,
      default: null,
    },
  },

  emits: ["close"],

  setup(props) {
    const dialog = useDialog();

    const wavesurfer = ref<any>(null);
    const regionsPlugin = ref<any>(null);
    const isPlaying = ref(false);
    function formatTime(v: number) {
      const minutes = Math.floor(v / 60);
      const formattedMinutes = Number(minutes) < 10 ? `0${minutes}` : minutes;

      const seconds = Math.floor(v % 60);
      const formattedSeconds = Number(seconds) < 10 ? `0${seconds}` : seconds;

      const ms = String(v.toFixed(1)).split(".")[1];
      return `${formattedMinutes}:${formattedSeconds}.${ms}`;
    }

    function decodeAndSetMusicInfo() {
      isTempoLoading.value = true;

      const context = new AudioContext();
      const reader = new FileReader();
      reader.onload = async ($event) => {
        const target = $event.target as EventTargetWithResult;
        const result = target.result as unknown as ArrayBuffer;
        await context.decodeAudioData(result, (buffer: AudioBuffer) => {
          let audioData: number[] | Float32Array = [];
          // average of the two channels
          if (buffer.numberOfChannels == 2) {
            let channel1Data = buffer.getChannelData(0);
            let channel2Data = buffer.getChannelData(1);
            let length = channel1Data.length;
            for (let i = 0; i < length; i++) {
              audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
            }
          } else {
            audioData = buffer.getChannelData(0);
          }

          try {
            // TODO
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            musicInfo.value = new MusicTempo(audioData) as MusicTempoData;
          } finally {
            isTempoLoading.value = false;
            dialog.close();
          }
        });
      };
      reader.readAsArrayBuffer(props.rawAudio);
    }
    const isTempoLoading = ref(false);
    const musicInfo = ref<MusicTempoData | null>(null);

    const volume = ref(10);
    const exportedVolume = ref(100);
    function setVolume(v = 10) {
      volume.value = v;
      wavesurfer.value?.setVolume(volume.value / 100);
    }

    const speed = ref(100);
    function setSpeed(v: number) {
      speed.value = v;
      wavesurfer.value?.setPlaybackRate(speed.value / 100);
    }

    // TODO: set current audio bitrate and limit slider max?
    // didn't found how to get bitrate in js, only duration, size and samplerate
    const bitrate = ref(192);

    const equalizer = ref<EqItem[]>([
      {
        f: 32,
        type: "lowshelf",
        value: 0,
      },
      {
        f: 64,
        type: "peaking",
        value: 0,
      },
      {
        f: 125,
        type: "peaking",
        value: 0,
      },
      {
        f: 250,
        type: "peaking",
        value: 0,
      },
      {
        f: 500,
        type: "peaking",
        value: 0,
      },
      {
        f: 1000,
        type: "peaking",
        value: 0,
      },
      {
        f: 2000,
        type: "peaking",
        value: 0,
      },
      {
        f: 4000,
        type: "peaking",
        value: 0,
      },
      {
        f: 8000,
        type: "peaking",
        value: 0,
      },
      {
        f: 16000,
        type: "highshelf",
        value: 0,
      },
    ]);
    const wavesurferFilters = ref<BiquadFilterNode[] | null>(null);
    function updateEqualizer(v: number, index: number) {
      equalizer.value[index].value = v;
    }
    function resetEqualizer() {
      equalizer.value?.forEach((f) => (f.value = 0));
    }

    function initializeEqualizer() {
      if (!wavesurfer.value) return;

      try {
        // Create a basic AudioContext for EQ settings storage
        // We'll apply these settings during export instead of real-time
        console.log("Equalizer settings ready for export");
      } catch (error) {
        console.error("Failed to initialize equalizer:", error);
      }
    }

    onMounted(async () => {
      try {
        // Wait for next tick to ensure DOM is ready
        await nextTick();

        // Check if container exists
        const container = document.querySelector("#waveform");
        if (!container) {
          console.error("WaveSurfer container not found");
          return;
        }

        // Create regions plugin instance
        regionsPlugin.value = RegionsPlugin.create();

        // Initialize WaveSurfer with proper configuration
        wavesurfer.value = WaveSurfer.create({
          container: container as HTMLElement,
          waveColor: "rgb(207,217,237)",
          progressColor: "#60A5FA",
          normalize: true,
          backend: "WebAudio",
          interact: true,
          barWidth: 2,
          barRadius: 3,
          cursorWidth: 1,
          height: 128,
          barGap: 3,
          plugins: [regionsPlugin.value],
        });

        // Listen to ready event before loading
        wavesurfer.value.on("ready", () => {
          console.log("WaveSurfer is ready");

          // Initialize equalizer filters
          initializeEqualizer();

          // Add a region
          const region = regionsPlugin.value.addRegion({
            start: 0,
            end: props.rawAudioDuration,
            loop: true,
            color: "rgba(96, 165, 250, 0.2)",
            drag: true,
            resize: true,
          });

          // Listen to region events
          region.on("update-end", () => {
            updateExportRegion({ start: region.start, end: region.end });
          });
        });

        // Listen to play/pause events
        wavesurfer.value.on("play", () => {
          isPlaying.value = true;
        });

        wavesurfer.value.on("pause", () => {
          isPlaying.value = false;
        });

        // Handle errors
        wavesurfer.value.on("error", (error: any) => {
          console.error("WaveSurfer error:", error);
        });

        // Load the audio file
        await wavesurfer.value.loadBlob(props.rawAudio);
        setVolume();

        // TODO: event don't handle sometimes cuz we have focus on button
        addEventListener("keydown", handleKeyPress);
      } catch (error) {
        console.error("Failed to initialize WaveSurfer:", error);
      }
    });
    onBeforeUnmount(() => {
      removeEventListener("keydown", handleKeyPress);

      // Clean up WaveSurfer instance
      if (wavesurfer.value) {
        wavesurfer.value.destroy();
        wavesurfer.value = null;
      }
    });
    async function handlePlayPause() {
      if (!wavesurfer.value) {
        console.warn("WaveSurfer instance not available");
        return;
      }

      try {
        if (isPlaying.value) {
          wavesurfer.value.pause();
        } else {
          // Create a user interaction first to satisfy browser autoplay policies
          const playPromise = wavesurfer.value.play();
          if (playPromise && typeof playPromise.catch === "function") {
            await playPromise.catch((error: any) => {
              console.error("Playback failed:", error);
              // Reset playing state if play fails
              isPlaying.value = false;
            });
          }
        }
      } catch (error) {
        console.error("Error playing/pausing audio:", error);
        isPlaying.value = false;
      }
    }

    function handleKeyPress($event: KeyboardEvent) {
      const code = $event.code;
      if (code === "Space") {
        handlePlayPause();
        $event.preventDefault();
      } else if (code === "ArrowLeft") {
        wavesurfer.value?.skip(-3);
        $event.preventDefault();
      } else if (code === "ArrowRight") {
        wavesurfer.value?.skip(3);
        $event.preventDefault();
      }
    }

    const region = ref([0, props.rawAudioDuration]);
    function updateExportRegion(updatedRegion: { start: number; end: number }) {
      if (updatedRegion.start !== region.value[0])
        wavesurfer.value?.play(updatedRegion.start, updatedRegion.end);
      region.value = [updatedRegion.start, updatedRegion.end];
    }

    async function exportAudio() {
      try {
        console.log("Starting audio export...");

        // Create new audio context for processing
        const audioContext = new AudioContext();
        const buffer = await new Response(props.rawAudio).arrayBuffer();
        const decodedData = await audioContext.decodeAudioData(buffer);

        console.log("Original audio:", {
          duration: decodedData.duration,
          channels: decodedData.numberOfChannels,
          sampleRate: decodedData.sampleRate,
        });

        // Calculate the region to export (cutting)
        const startTime = region.value[0];
        const endTime = region.value[1];
        const startSample = Math.floor(startTime * decodedData.sampleRate);
        const endSample = Math.floor(endTime * decodedData.sampleRate);
        const exportLength = endSample - startSample;

        console.log("Export region:", {
          startTime,
          endTime,
          startSample,
          endSample,
          exportLength,
        });

        // Create new buffer for the exported audio with speed adjustment
        const speedMultiplier = speed.value / 100;
        const newLength = Math.floor(exportLength / speedMultiplier);
        const newBuffer = audioContext.createBuffer(
          decodedData.numberOfChannels,
          newLength,
          decodedData.sampleRate
        );

        console.log("Processing audio data...");

        // Process each channel with chunked processing for better performance
        const chunkSize = 44100; // Process 1 second at a time
        const volumeMultiplier = exportedVolume.value / 100;

        for (
          let channel = 0;
          channel < decodedData.numberOfChannels;
          channel++
        ) {
          const originalChannelData = decodedData.getChannelData(channel);
          const newChannelData = newBuffer.getChannelData(channel);

          // Process in chunks to avoid blocking the main thread
          for (let chunkStart = 0; chunkStart < newLength; chunkStart += chunkSize) {
            const chunkEnd = Math.min(chunkStart + chunkSize, newLength);
            
            // Apply cutting, speed change, and volume in one pass
            for (let i = chunkStart; i < chunkEnd; i++) {
              const originalIndex = startSample + Math.floor(i * speedMultiplier);
              if (
                originalIndex < endSample &&
                originalIndex < originalChannelData.length
              ) {
                newChannelData[i] = originalChannelData[originalIndex] * volumeMultiplier;
              }
            }
            
            // Yield control back to the browser occasionally
            if (chunkStart % (chunkSize * 10) === 0) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }
        }

        console.log("Processed audio:", {
          duration: newBuffer.duration,
          channels: newBuffer.numberOfChannels,
          sampleRate: newBuffer.sampleRate,
          speedMultiplier,
          volumeMultiplier,
        });

        // Check if any EQ settings are applied
        const hasEqChanges = equalizer.value.some(eq => eq.value !== 0);

        if (hasEqChanges) {
          console.log("Applying equalizer settings...");
          const offlineContext = new OfflineAudioContext(
            newBuffer.numberOfChannels,
            newBuffer.length,
            newBuffer.sampleRate
          );

          const source = offlineContext.createBufferSource();
          source.buffer = newBuffer;

          let currentNode: AudioNode = source;

          // Create and connect filters
          equalizer.value.forEach((eq) => {
            if (eq.value !== 0) { // Only apply filters that have changes
              const newFilter = offlineContext.createBiquadFilter();
              newFilter.type = eq.type;
              newFilter.frequency.value = eq.f;
              newFilter.gain.value = eq.value;

              // Set Q value for peaking filters
              if (eq.type === "peaking") {
                newFilter.Q.value = 1;
              }

              currentNode.connect(newFilter);
              currentNode = newFilter;
            }
          });

          currentNode.connect(offlineContext.destination);
          source.start();

          console.log("Rendering with equalizer...");
          const renderedBuffer = await offlineContext.startRendering();

          // Convert to MP3 and trigger download
          await downloadAsMp3(renderedBuffer);
        } else {
          // No EQ changes, just convert to MP3
          await downloadAsMp3(newBuffer);
        }
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed. Please try again.");
      }
    }

    async function downloadAsMp3(audioBuffer: AudioBuffer) {
      console.log("Converting to MP3...");
      
      try {
        // Convert AudioBuffer to MP3
        const mp3Blob = await audioBufferToMp3(audioBuffer);

        // Create download link
        const url = URL.createObjectURL(mp3Blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${props.rawAudio.name.replace(
          /\.[^/.]+$/,
          ""
        )}_edited.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log("Export completed successfully!");
      } catch (error) {
        console.error("MP3 conversion failed:", error);
        alert("MP3 conversion failed. Please try again.");
      }
    }

    async function audioBufferToMp3(buffer: AudioBuffer): Promise<Blob> {
      console.log("Converting to MP3 format...");
      
      const sampleRate = buffer.sampleRate;
      const numberOfChannels = buffer.numberOfChannels;
      const length = buffer.length;
      
      // Get the selected bitrate or default to 192
      const kbps = bitrate.value || 192;
      
      console.log(`MP3 encoding: ${numberOfChannels} channels, ${sampleRate}Hz, ${kbps}kbps`);
      
      // Debug lamejs import
      console.log("lamejs object:", lamejs);
      console.log("lamejs type:", typeof lamejs);
      console.log("lamejs keys:", lamejs ? Object.keys(lamejs).slice(0, 10) : 'null');
      
      // Initialize MP3 encoder
      let mp3encoder;
      try {
        // Try different ways to access Mp3Encoder
        if (lamejs && lamejs.Mp3Encoder) {
          console.log("Using lamejs.Mp3Encoder");
          mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, kbps);
        } else if ((window as any).lamejs) {
          console.log("Using window.lamejs.Mp3Encoder");
          mp3encoder = new (window as any).lamejs.Mp3Encoder(numberOfChannels, sampleRate, kbps);
        } else if (lamejs && typeof lamejs === 'function') {
          console.log("lamejs is a function, trying to use it as constructor");
          mp3encoder = new lamejs(numberOfChannels, sampleRate, kbps);
        } else {
          // Fallback: try direct constructor
          const Mp3Encoder = (lamejs as any).Mp3Encoder || (lamejs as any).default?.Mp3Encoder || lamejs;
          console.log("Using fallback Mp3Encoder:", Mp3Encoder);
          mp3encoder = new Mp3Encoder(numberOfChannels, sampleRate, kbps);
        }
      } catch (e) {
        console.error("Failed to initialize Mp3Encoder:", e);
        console.error("lamejs structure:", lamejs);
        throw new Error("MP3 encoder initialization failed. The library may not be loaded correctly.");
      }
      
      // Prepare samples
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;
      
      // Convert float samples to 16-bit PCM
      const sampleBlockSize = 1152; // Must be a multiple of 576 for encoder
      const mp3Data: ArrayBuffer[] = [];
      
      // Process in chunks
      for (let i = 0; i < length; i += sampleBlockSize) {
        const leftChunk = new Int16Array(sampleBlockSize);
        const rightChunk = new Int16Array(sampleBlockSize);
        
        const chunkSize = Math.min(sampleBlockSize, length - i);
        
        // Convert float32 to int16
        for (let j = 0; j < chunkSize; j++) {
          const leftSample = Math.max(-1, Math.min(1, leftChannel[i + j] || 0));
          const rightSample = Math.max(-1, Math.min(1, rightChannel[i + j] || 0));
          
          leftChunk[j] = leftSample * 0x7FFF;
          rightChunk[j] = rightSample * 0x7FFF;
        }
        
        // Encode chunk
        const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(new Uint8Array(mp3buf).buffer);
        }
        
        // Yield control occasionally for large files
        if (i % (sampleBlockSize * 100) === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
          console.log(`MP3 encoding progress: ${Math.round(i / length * 100)}%`);
        }
      }
      
      // Flush remaining data
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf).buffer);
      }
      
      console.log("MP3 conversion completed");
      return new Blob(mp3Data, { type: "audio/mp3" });
    }

    const actions = [
      {
        tooltip: "Volume",
        key: "volume",
        icon: "volume_up",
      },
      {
        tooltip: "Speed",
        key: "speed",
        icon: "speed",
      },
      {
        tooltip: "Bitrate",
        key: "bitrate",
        icon: "grain",
      },
      {
        tooltip: "Equalizer",
        key: "equalizer",
        icon: "equalizer",
      },
    ];
    function selectAction(key: string) {
      selectedAction.value = key;
      if (key === "speed") {
        wavesurfer.value?.pause();
        dialog.open("findBPM");
        decodeAndSetMusicInfo();
      }
    }
    const selectedAction = ref("volume");

    function showCloseAudioDialog() {
      wavesurfer.value?.pause();
      dialog.open("closeConfirm");
    }

    return {
      dialog,

      wavesurfer,
      regionsPlugin,
      isPlaying,
      handlePlayPause,
      formatTime,
      isTempoLoading,
      musicInfo,

      volume,
      exportedVolume,
      setVolume,

      speed,
      setSpeed,

      bitrate,

      equalizer,
      wavesurferFilters,
      updateEqualizer,
      resetEqualizer,

      region,
      exportAudio,

      actions,
      selectAction,
      selectedAction,

      showCloseAudioDialog,
    };
  },
});
</script>

<style scoped>
.waveform-wrapper {
  padding: 64px 32px 0 32px;
  background: #d4dded2e;
}

.waveform__time {
  padding: 20px 0;
}

.waveform-wrapper :deep(.waveform > wave) {
  border-radius: 12px;
}

.waveform-wrapper :deep(.waveform > wave > wave) {
  border-right-color: #ff2a6f !important;
}

.waveform-wrapper :deep(.wavesurfer-region) {
  background-color: rgba(96, 165, 250, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: rgba(147, 197, 253, 1) 0 0 32px 7px, #738caa7a 0 0 0 10000px;
}

.waveform-wrapper :deep(.wavesurfer-handle) {
  background-color: #2563eb !important;
  width: 16px !important;
  cursor: grab !important;
}

.waveform-wrapper :deep(.wavesurfer-handle:hover) {
  background-color: #1d4ed8 !important;
}

.waveform-wrapper :deep(.wavesurfer-handle:active) {
  cursor: grabbing !important;
  background-color: #1e40af !important;
}

.waveform-wrapper :deep(.wavesurfer-handle-start) {
  border-radius: 12px 0 0 12px !important;
}

.waveform-wrapper :deep(.wavesurfer-handle-end) {
  border-radius: 0 12px 12px 0 !important;
}

.action-tabs {
  padding: 32px 16px;
}

.bottom-section {
  padding-left: 32px;
  padding-right: 32px;
  height: 100%;
}

.play-icon {
  font-size: 20px;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.05s;
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0);
}
</style>
