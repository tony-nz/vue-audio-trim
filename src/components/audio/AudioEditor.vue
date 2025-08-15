<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="player-bg rounded-lg shadow-2xl max-w-5xl w-full">
      <!-- Header Controls -->
      <div
        class="flex items-center justify-between p-4 border-b border-slate-600"
      >
        <div class="flex items-center">
          <button
            v-for="action in actions"
            :key="action.key"
            :class="[
              'text-gray-300 hover:text-white p-2 mr-2',
              selectedAction === action.key ? 'text-white' : '',
            ]"
            :title="action.tooltip"
            @click="selectAction(action.key)"
          >
            <i :class="`fas fa-${action.icon}`"></i>
          </button>
        </div>

        <div class="flex items-center">
          <button
            class="text-gray-300 hover:text-white flex items-center p-2"
            @click="resetAll"
          >
            <i class="fas fa-undo mr-2"></i>
            <span>Reset</span>
          </button>
          <button
            class="text-gray-300 hover:text-white p-2 ml-2"
            @click="showCloseAudioDialog"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Main Player Area -->
      <div class="p-6">
        <!-- Time display in corner -->
        <div class="relative mb-4">
          <div
            class="absolute top-0 left-0 bg-white text-slate-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ formatTime(currentTime) }}
          </div>
        </div>

        <!-- Track Title -->
        <div class="text-center text-gray-300 text-sm mb-4 mt-8">
          {{ rawAudio?.name || "No file loaded" }}
        </div>

        <!-- Waveform Area -->
        <div class="waveform-container rounded p-4 mb-6">
          <div class="relative">
            <div class="flex justify-between text-xs text-gray-400 mb-2">
              <span>{{ formatTime(region[0]) }}</span>
              <span>{{ formatTime(region[1]) }}</span>
            </div>
            <div class="relative">
              <div id="waveform" class="relative h-[200px]"></div>
              <!-- Cursor time marker -->
              <div
                v-if="cursorPosition > -1"
                class="absolute top-0 pointer-events-none"
                :style="{
                  left: cursorPosition + 'px',
                  transform: 'translateX(-50%)',
                }"
              >
                <div class="relative">
                  <div
                    class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                  >
                    {{ formatTime(cursorTime) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center text-gray-400 text-sm mt-2">
              {{ formatTime(region[1] - region[0]) }}
            </div>
          </div>
        </div>

        <!-- Effects Panel (shown based on selected action) -->
        <div
          v-if="selectedAction"
          class="mb-6 bg-slate-700 bg-opacity-50 rounded p-4"
        >
          <div v-show="selectedAction === 'volume'" class="space-y-4">
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
          <div v-show="selectedAction === 'speed'" class="space-y-4">
            <div class="text-center text-gray-300">
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
          <div v-show="selectedAction === 'bitrate'" class="space-y-4">
            <AudioEditorSlider
              v-model="bitrate"
              label="Export bitrate"
              :min="16"
              :max="320"
            />
          </div>
          <div
            v-show="selectedAction === 'equalizer'"
            class="flex flex-row gap-4"
          >
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
            <button
              class="self-center text-gray-300 hover:text-white p-2"
              style="margin-bottom: 28px"
              title="Reset EQ"
              @click="resetEqualizer"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>

        <!-- Bottom Controls -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 w-full">
            <!-- Play Button -->
            <button
              class="text-gray-300 hover:text-white p-2 bg-slate-800 rounded-2xl transition-colors p-3 px-10"
              @click="handlePlayPause"
            >
              <i v-if="isPlaying" class="fas fa-pause text-xl"></i>
              <i v-else class="fas fa-play text-xl"></i>
            </button>

            <!-- Fade In Control -->
            <div class="flex items-center">
              <div class="flex items-center">
                <button
                  class="transition-all bg-slate-800 rounded-l-2xl p-4 pl-4 pr-2"
                  :class="
                    fadeInEnabled
                      ? 'bg-slate-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-900'
                  "
                  @click="toggleFadeIn"
                  title="Fade In"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="20"
                    fill="none"
                  >
                    <path
                      opacity=".1"
                      d="M1 20c-.552 0-1-.446-1-.998v-4.215a1 1 0 0 1 1-1h.294c2.74.005 4.094-.163 5.705-.937 1.931-.927 3.601-2.653 5.035-5.476 1.37-2.697 2.882-4.55 4.583-5.718C18.64.267 20.274-.014 23.547.001H24a1 1 0 0 1 1 1V19.01c0 .552-.448.99-1 .99H1Z"
                      fill="#fff"
                    />
                    <path
                      d="M1 15.787a1 1 0 1 1 0-2h.294c2.74.005 4.094-.163 5.705-.937 1.931-.927 3.601-2.653 5.035-5.476 1.37-2.697 2.882-4.55 4.583-5.718C18.64.267 20.274-.014 23.547.001H24a1 1 0 1 1 0 2h-.462c-2.893-.013-4.197.211-5.79 1.304-1.402.962-2.702 2.558-3.93 4.975-1.626 3.199-3.607 5.247-5.953 6.373-1.962.942-3.55 1.14-6.574 1.134H1Z"
                      fill="#fff"
                    />
                  </svg>
                </button>
                <button
                  class="transition-all bg-slate-800 rounded-r-2xl p-4 pl-2 pr-4"
                  :class="
                    fadeOutEnabled
                      ? 'bg-slate-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-900'
                  "
                  @click="toggleFadeOut"
                  title="Fade Out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="20"
                    fill="none"
                  >
                    <path
                      opacity=".1"
                      d="M24 20c.552 0 1-.446 1-.998v-4.215a1 1 0 0 0-1-1h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 0 0-1 1V19.01c0 .552.448.99 1 .99h23Z"
                      fill="#fff"
                    />
                    <path
                      d="M24 15.787a1 1 0 1 0 0-2h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 1 0 0 2h.462c2.893-.013 4.197.211 5.79 1.304 1.402.962 2.702 2.558 3.93 4.975 1.626 3.199 3.607 5.247 5.953 6.373 1.962.942 3.55 1.14 6.574 1.134H24Z"
                      fill="#fff"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Trim/Cut Toggle -->
            <button
              class="text-gray-300 hover:text-white p-2"
              :class="{ 'text-white': isTrimMode }"
              @click="toggleTrimMode"
              title="Toggle Trim/Cut Mode"
            >
              <i class="fas fa-cut"></i>
            </button>

            <!-- Start Time with Arrows -->
            <div class="flex">
              <div
                class="flex items-center space-x-2 bg-slate-800 p-2 pl-6 rounded-l-2xl"
              >
                <span class="text-white font-bold text-sm">{{
                  formatTime(region[0])
                }}</span>
                <div class="flex flex-col">
                  <button
                    class="text-gray-500 hover:text-white leading-none"
                    @click="adjustStartTime(0.1)"
                  >
                    <i class="fas fa-caret-up text-sm"></i>
                  </button>
                  <button
                    class="text-gray-500 hover:text-white leading-none"
                    @click="adjustStartTime(-0.1)"
                  >
                    <i class="fas fa-caret-down text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- End Time with Arrows -->
              <div
                class="flex items-center space-x-2 bg-slate-800 p-2 pr-6 rounded-r-2xl"
              >
                <span class="text-white font-bold text-sm">{{
                  formatTime(region[1])
                }}</span>
                <div class="flex flex-col">
                  <button
                    class="text-gray-500 hover:text-white leading-none"
                    @click="adjustEndTime(0.1)"
                  >
                    <i class="fas fa-caret-up text-xs"></i>
                  </button>
                  <button
                    class="text-gray-500 hover:text-white leading-none"
                    @click="adjustEndTime(-0.1)"
                  >
                    <i class="fas fa-caret-down text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Format Dropdown -->
            <select
              v-model="exportFormat"
              class="bg-slate-800 rounded-2xl text-white font-bold px-8 py-3 text-center cursor-pointer hover:bg-slate-600 focus:outline-none"
            >
              <option value="mp3">mp3</option>
              <option value="wav">wav</option>
              <option value="flac">flac</option>
              <option value="ogg">ogg</option>
            </select>

            <button
              class="bg-white text-slate-800 px-6 py-3 rounded-2xl font-medium hover:bg-gray-100"
              @click="exportAudio"
            >
              Save
            </button>
          </div>
        </div>
      </div>
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
  watch,
} from "vue";

import AudioEditorSliderVolume from "./AudioEditorSliderVolume.vue";

import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import EnvelopePlugin from "wavesurfer.js/dist/plugins/envelope.esm.js";
// @ts-ignore
import lamejs from "lamejs";
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
    const envelopePlugin = ref<any>(null);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const exportFormat = ref("mp3");
    const cursorPosition = ref(-1);
    const cursorTime = ref(0);

    // New controls for fade in/out and trim mode
    const fadeInEnabled = ref(false);
    const fadeInDuration = ref(3.0); // Default 3 seconds for longer fade
    const fadeOutEnabled = ref(false);
    const fadeOutDuration = ref(3.0); // Default 3 seconds for longer fade
    const isTrimMode = ref(true);

    // Watch for fade duration changes
    watch([fadeInDuration, fadeOutDuration], () => {
      updateEnvelopePoints();
    });

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

    const volume = ref(100);
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

        // Create envelope plugin instance with initial points
        envelopePlugin.value = EnvelopePlugin.create({
          points: [
            { time: 0, volume: 1 },
            { time: 1, volume: 1 },
          ],
          lineColor: "rgba(255, 255, 255, 0.7)",
          lineWidth: 2,
          dragPointSize: 8,
          dragPointFill: "rgba(255, 255, 255, 0.9)",
          dragPointStroke: "rgba(255, 255, 255, 1)",
        });

        // Initialize WaveSurfer with proper configuration
        wavesurfer.value = WaveSurfer.create({
          container: container as HTMLElement,
          waveColor: "#10b981", // Green color matching screenshot
          progressColor: "#059669", // Darker green for played portion
          normalize: true,
          backend: "WebAudio",
          interact: true,
          // barWidth: 2,
          // barRadius: 3,
          cursorColor: "white",
          cursorWidth: 8,
          height: 150,
          // barGap: s1,
          fillParent: true,
          // plugins: [regionsPlugin.value, envelopePlugin.value],
          plugins: [regionsPlugin.value],
        });

        // Listen to ready event before loading
        wavesurfer.value.on("ready", () => {
          console.log("WaveSurfer is ready");

          // Initialize equalizer filters
          initializeEqualizer();

          // Initialize envelope with proper duration
          updateEnvelopePoints();

          // Add a region
          const region = regionsPlugin.value.addRegion({
            start: 0,
            end: props.rawAudioDuration,
            loop: true,
            color: "rgba(0, 0, 0, 0)", // Transparent
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

        // Track current time
        wavesurfer.value.on("timeupdate", (time: number) => {
          currentTime.value = time;
        });

        // Track cursor position on hover
        const waveformEl = container as HTMLElement;
        waveformEl.addEventListener("mousemove", (e: MouseEvent) => {
          const rect = waveformEl.getBoundingClientRect();
          const x = e.clientX - rect.left;
          cursorPosition.value = x;

          // Calculate time at cursor position
          const duration = wavesurfer.value.getDuration();
          const progress = x / rect.width;
          cursorTime.value = duration * progress;
        });

        waveformEl.addEventListener("mouseleave", () => {
          cursorPosition.value = -1;
        });

        // Handle errors
        wavesurfer.value.on("error", (error: any) => {
          console.error("WaveSurfer error:", error);
        });

        // Load the audio file
        await wavesurfer.value.loadBlob(props.rawAudio);
        setVolume(100);

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
      // Update envelope when region changes
      updateEnvelopePoints();
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
          for (
            let chunkStart = 0;
            chunkStart < newLength;
            chunkStart += chunkSize
          ) {
            const chunkEnd = Math.min(chunkStart + chunkSize, newLength);

            // Apply cutting, speed change, volume, and envelope in one pass
            for (let i = chunkStart; i < chunkEnd; i++) {
              const originalIndex =
                startSample + Math.floor(i * speedMultiplier);
              if (
                originalIndex < endSample &&
                originalIndex < originalChannelData.length
              ) {
                let sample =
                  originalChannelData[originalIndex] * volumeMultiplier;

                // Apply envelope volume (fade in/out)
                if (envelopePlugin.value) {
                  const timePosition = i / decodedData.sampleRate;
                  const envelopeVolume = getEnvelopeVolumeAtTime(timePosition);
                  sample *= envelopeVolume;
                }

                newChannelData[i] = sample;
              }
            }

            // Yield control back to the browser occasionally
            if (chunkStart % (chunkSize * 10) === 0) {
              await new Promise((resolve) => setTimeout(resolve, 0));
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
        const hasEqChanges = equalizer.value.some((eq) => eq.value !== 0);

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
            if (eq.value !== 0) {
              // Only apply filters that have changes
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

      // Initialize MP3 encoder
      let mp3encoder;
      try {
        // Try different ways to access Mp3Encoder
        if (lamejs && lamejs.Mp3Encoder) {
          console.log("Using lamejs.Mp3Encoder");
          mp3encoder = new lamejs.Mp3Encoder(
            numberOfChannels,
            sampleRate,
            kbps
          );
        } else if ((window as any).lamejs) {
          console.log("Using window.lamejs.Mp3Encoder");
          mp3encoder = new (window as any).lamejs.Mp3Encoder(
            numberOfChannels,
            sampleRate,
            kbps
          );
        } else if (lamejs && typeof lamejs === "function") {
          console.log("lamejs is a function, trying to use it as constructor");
          mp3encoder = new lamejs(numberOfChannels, sampleRate, kbps);
        } else {
          // Fallback: try direct constructor
          const Mp3Encoder =
            (lamejs as any).Mp3Encoder ||
            (lamejs as any).default?.Mp3Encoder ||
            lamejs;
          console.log("Using fallback Mp3Encoder:", Mp3Encoder);
          mp3encoder = new Mp3Encoder(numberOfChannels, sampleRate, kbps);
        }
      } catch (e) {
        console.error("Failed to initialize Mp3Encoder:", e);
        console.error("lamejs structure:", lamejs);
        throw new Error(
          "MP3 encoder initialization failed. The library may not be loaded correctly."
        );
      }

      // Prepare samples
      const leftChannel = buffer.getChannelData(0);
      const rightChannel =
        numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;

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
          const rightSample = Math.max(
            -1,
            Math.min(1, rightChannel[i + j] || 0)
          );

          leftChunk[j] = leftSample * 0x7fff;
          rightChunk[j] = rightSample * 0x7fff;
        }

        // Encode chunk
        const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(new Uint8Array(mp3buf).buffer);
        }

        // Yield control occasionally for large files
        if (i % (sampleBlockSize * 100) === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
          console.log(
            `MP3 encoding progress: ${Math.round((i / length) * 100)}%`
          );
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
        icon: "volume-up",
      },
      {
        tooltip: "Speed",
        key: "speed",
        icon: "tachometer-alt",
      },
      {
        tooltip: "Bitrate",
        key: "bitrate",
        icon: "wave-square",
      },
      {
        tooltip: "Equalizer",
        key: "equalizer",
        icon: "sliders-h",
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

    function updateEnvelopePoints() {
      if (!envelopePlugin.value || !wavesurfer.value) return;

      const fullDuration = wavesurfer.value.getDuration();
      const regionStart = region.value[0];
      const regionEnd = region.value[1];
      const regionDuration = regionEnd - regionStart;

      const points = [];

      // Smooth exponential fade curve function - much more gradual
      const exponentialFade = (t: number, fadeIn: boolean = true): number => {
        if (fadeIn) {
          // Very gentle fade in curve - slower approach
          return 1 - Math.exp(-2 * t); // Slower exponential approach to 1
        } else {
          // Very gentle fade out curve - slower decay
          return Math.exp(-2 * t); // Slower exponential decay from 1
        }
      };

      // Start with full volume before region
      if (regionStart > 0) {
        points.push({ time: 0, volume: 1 });
        points.push({ time: regionStart, volume: 1 });
      }

      // Create fade in curve within the region - use full duration requested
      if (fadeInEnabled.value) {
        const fadeInEndTime = regionStart + fadeInDuration.value;
        const numPoints = 30; // More points for smoother curve

        for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints;
          const time = regionStart + t * fadeInDuration.value;
          const volume = exponentialFade(t, true);
          if (time <= regionEnd) {
            points.push({ time, volume });
          }
        }
      } else {
        points.push({ time: regionStart, volume: 1 });
      }

      // Add sustain section if there's space between fades
      const fadeInEnd = fadeInEnabled.value
        ? regionStart + fadeInDuration.value
        : regionStart;
      const fadeOutStart = fadeOutEnabled.value
        ? regionEnd - fadeOutDuration.value
        : regionEnd;

      if (fadeInEnd < fadeOutStart) {
        points.push({ time: fadeInEnd, volume: 1 });
        points.push({ time: fadeOutStart, volume: 1 });
      }

      // Create fade out curve within the region - use full duration requested
      if (fadeOutEnabled.value) {
        const fadeOutStartTime = regionEnd - fadeOutDuration.value;
        const numPoints = 30; // More points for smoother curve

        for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints;
          const time = fadeOutStartTime + t * fadeOutDuration.value;
          const volume = exponentialFade(t, false);
          if (time >= regionStart) {
            points.push({ time, volume });
          }
        }
      } else {
        points.push({ time: regionEnd, volume: 1 });
      }

      // Continue with full volume after region
      if (regionEnd < fullDuration) {
        points.push({ time: regionEnd, volume: 1 });
        points.push({ time: fullDuration, volume: 1 });
      }

      // Update the envelope plugin with new points
      envelopePlugin.value.setPoints(points);
    }

    function getEnvelopeVolumeAtTime(time: number): number {
      if (!envelopePlugin.value) return 1;

      const points = envelopePlugin.value.getPoints();
      if (!points || points.length === 0) return 1;

      // Find the two points that time falls between
      let prevPoint = points[0];
      let nextPoint = null;

      for (let i = 0; i < points.length; i++) {
        if (points[i].time <= time) {
          prevPoint = points[i];
        } else {
          nextPoint = points[i];
          break;
        }
      }

      // If we're past all points, use the last point's volume
      if (!nextPoint) {
        return prevPoint.volume;
      }

      // Linear interpolation between two points
      const timeDiff = nextPoint.time - prevPoint.time;
      const volumeDiff = nextPoint.volume - prevPoint.volume;
      const timeProgress = (time - prevPoint.time) / timeDiff;

      return prevPoint.volume + volumeDiff * timeProgress;
    }

    function toggleFadeIn() {
      fadeInEnabled.value = !fadeInEnabled.value;
      updateEnvelopePoints();
    }

    function toggleFadeOut() {
      fadeOutEnabled.value = !fadeOutEnabled.value;
      updateEnvelopePoints();
    }

    function toggleTrimMode() {
      isTrimMode.value = !isTrimMode.value;
    }

    function adjustStartTime(delta: number) {
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
    }

    function adjustEndTime(delta: number) {
      const newEnd = Math.max(
        region.value[0] + 0.1,
        Math.min(region.value[1] + delta, props.rawAudioDuration)
      );
      const regions = regionsPlugin.value.getRegions();
      if (regions.length > 0) {
        const r = regions[0];
        r.setOptions({ start: region.value[0], end: newEnd });
        updateExportRegion({ start: region.value[0], end: newEnd });
      }
    }

    function resetAll() {
      // Reset all settings to defaults
      setVolume(10);
      exportedVolume.value = 100;
      setSpeed(100);
      bitrate.value = 192;
      resetEqualizer();

      // Reset new controls
      fadeInEnabled.value = false;
      fadeInDuration.value = 3.0;
      fadeOutEnabled.value = false;
      fadeOutDuration.value = 3.0;
      isTrimMode.value = true;
      updateEnvelopePoints();

      // Reset region to full duration
      if (regionsPlugin.value) {
        const regions = regionsPlugin.value.getRegions();
        regions.forEach((r: any) => r.remove());

        const newRegion = regionsPlugin.value.addRegion({
          start: 0,
          end: props.rawAudioDuration,
          loop: true,
          color: "rgba(0, 0, 0, 0)", // Transparent
          drag: true,
          resize: true,
        });

        newRegion.on("update-end", () => {
          updateExportRegion({ start: newRegion.start, end: newRegion.end });
        });
      }

      // Reset playback position
      wavesurfer.value?.seekTo(0);
    }

    return {
      dialog,

      wavesurfer,
      regionsPlugin,
      envelopePlugin,
      isPlaying,
      currentTime,
      exportFormat,
      cursorPosition,
      cursorTime,
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
      resetAll,

      // New controls
      fadeInEnabled,
      fadeInDuration,
      fadeOutEnabled,
      fadeOutDuration,
      isTrimMode,
      toggleFadeIn,
      toggleFadeOut,
      toggleTrimMode,
      adjustStartTime,
      adjustEndTime,

      rawAudio: props.rawAudio,
    };
  },
});
</script>

<style scoped>
/* Waveform styling */
#waveform :deep(wave) {
  background-color: transparent !important;
}

#waveform ::part(region-region) {
  background-color: rgba(96, 165, 250, 0.15) !important;
  border: none !important;
}

#waveform ::part(region-handle) {
  background-color: #60a5fa !important;
  width: 15px !important;
  cursor: ew-resize !important;
  top: 0 !important;
  bottom: 0 !important;
  border-radius: 0 !important;
  opacity: 0.8 !important;
}

#waveform ::part(region-handle-start) {
  left: 0 !important;
  transform: translateX(-50%) !important;
}

#waveform ::part(region-handle-end) {
  right: 0 !important;
  transform: translateX(50%) !important;
}

#waveform ::part(region-handle-left) {
  border-top-left-radius: 6px !important;
  border-bottom-left-radius: 6px !important;
  border-bottom-right-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

#waveform ::part(region-handle-right) {
  border-top-right-radius: 6px !important;
  border-bottom-right-radius: 6px !important;
  border-bottom-left-radius: 0 !important;
  border-top-left-radius: 0 !important;
}
/* Handle dots in the middle */
#waveform ::part(region-handle)::after {
  content: "";
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: white;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 -12px 0 white, 0 12px 0 white;
}

/* Cursor styling with time marker */
#waveform :deep(.wavesurfer-cursor) {
  position: relative;
}

#waveform :deep(.wavesurfer-cursor)::after {
  content: attr(data-time);
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: red;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
}

/* Custom select styling */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d1d5db' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 12px;
  padding-right: 2rem;
}

/* Fade slider styling */
.fade-slider::-webkit-slider-track {
  background: #475569;
  height: 4px;
  border-radius: 2px;
}

.fade-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: red;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -4px;
}

.fade-slider::-moz-range-track {
  background: #475569;
  height: 4px;
  border-radius: 2px;
}

.fade-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: red;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* Slider styling */
.slider-container :deep(input[type="range"]) {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.slider-container :deep(input[type="range"]::-webkit-slider-track) {
  background: #334155;
  height: 4px;
  border-radius: 2px;
}

.slider-container :deep(input[type="range"]::-webkit-slider-thumb) {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: red;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -6px;
}
</style>
