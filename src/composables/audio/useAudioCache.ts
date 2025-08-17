import { ref, watch } from "vue";
// @ts-ignore
import lamejs from "lamejs";
import type { EqItem } from "./useAudioEffects";

/**
 * Instant export using pre-rendered cache
 * Renders audio in background and updates cache when settings change
 */
export function useAudioCache() {
  const isExporting = ref(false);
  const isRendering = ref(false);
  const renderProgress = ref(0);
  
  // Cache for the rendered audio
  let cachedRenderedBuffer: AudioBuffer | null = null;
  let cachedMP3Blob: Blob | null = null;
  let cachedSettings: any = null;
  
  // Background rendering state
  let renderTimeout: number | null = null;
  let currentRenderContext: OfflineAudioContext | null = null;
  
  // Decoded source buffer cache
  let sourceBuffer: AudioBuffer | null = null;
  let sourceFile: File | null = null;

  /**
   * Initialize and decode the audio file once
   */
  const initializeAudio = async (rawAudio: File) => {
    if (sourceFile === rawAudio && sourceBuffer) {
      return sourceBuffer;
    }
    
    const audioContext = new AudioContext();
    const arrayBuffer = await rawAudio.arrayBuffer();
    sourceBuffer = await audioContext.decodeAudioData(arrayBuffer);
    sourceFile = rawAudio;
    await audioContext.close();
    
    return sourceBuffer;
  };

  /**
   * Check if settings have changed
   */
  const settingsChanged = (newSettings: any): boolean => {
    if (!cachedSettings) return true;
    
    return JSON.stringify(cachedSettings) !== JSON.stringify(newSettings);
  };

  /**
   * Render audio in background with current settings
   */
  const renderInBackground = async (
    rawAudio: File,
    region: number[],
    speed: number,
    exportedVolume: number,
    equalizer: EqItem[],
    envelopePlugin: any,
    bitrate: number
  ) => {
    // Cancel any pending render
    if (renderTimeout) {
      clearTimeout(renderTimeout);
    }
    
    // Debounce rendering by 500ms to avoid too many re-renders
    renderTimeout = setTimeout(async () => {
      await performRender(rawAudio, region, speed, exportedVolume, equalizer, envelopePlugin, bitrate);
    }, 500) as unknown as number;
  };

  /**
   * Perform the actual rendering
   */
  const performRender = async (
    rawAudio: File,
    region: number[],
    speed: number,
    exportedVolume: number,
    equalizer: EqItem[],
    envelopePlugin: any,
    bitrate: number
  ) => {
    try {
      isRendering.value = true;
      renderProgress.value = 0;
      
      // Get or decode source buffer
      const source = await initializeAudio(rawAudio);
      
      const startTime = region[0];
      const endTime = region[1];
      const duration = endTime - startTime;
      const speedMultiplier = speed / 100;
      const outputDuration = duration / speedMultiplier;
      
      // Create offline context
      currentRenderContext = new OfflineAudioContext(
        source.numberOfChannels,
        Math.ceil(outputDuration * source.sampleRate),
        source.sampleRate
      );
      
      // Create source node
      const sourceNode = currentRenderContext.createBufferSource();
      sourceNode.buffer = source;
      sourceNode.playbackRate.value = speedMultiplier;
      
      // Create gain for volume
      const gainNode = currentRenderContext.createGain();
      const baseGain = exportedVolume / 100;
      
      // Apply envelope if available
      if (envelopePlugin) {
        const points = envelopePlugin.getPoints();
        gainNode.gain.setValueAtTime(baseGain, 0);
        
        for (const point of points) {
          if (point.time >= startTime && point.time <= endTime) {
            const adjustedTime = (point.time - startTime) / speedMultiplier;
            const volume = point.volume * baseGain;
            gainNode.gain.linearRampToValueAtTime(volume, adjustedTime);
          }
        }
      } else {
        gainNode.gain.value = baseGain;
      }
      
      // Connect nodes
      sourceNode.connect(gainNode);
      
      // Apply EQ
      let lastNode: AudioNode = gainNode;
      const hasEq = equalizer.some(eq => eq.value !== 0);
      
      if (hasEq) {
        equalizer.forEach(eq => {
          if (eq.value !== 0) {
            const filter = currentRenderContext.createBiquadFilter();
            filter.type = eq.type;
            filter.frequency.value = eq.f;
            filter.gain.value = eq.value;
            if (eq.type === "peaking") filter.Q.value = 1;
            
            lastNode.connect(filter);
            lastNode = filter;
          }
        });
      }
      
      lastNode.connect(currentRenderContext.destination);
      
      // Start and render
      sourceNode.start(0, startTime, duration);
      renderProgress.value = 30;
      
      cachedRenderedBuffer = await currentRenderContext.startRendering();
      renderProgress.value = 60;
      
      // Convert to MP3 in background
      cachedMP3Blob = await convertToMP3(cachedRenderedBuffer, bitrate);
      renderProgress.value = 100;
      
      // Save settings
      cachedSettings = {
        region: [...region],
        speed,
        exportedVolume,
        equalizer: JSON.parse(JSON.stringify(equalizer)),
        bitrate,
        envelopePoints: envelopePlugin ? envelopePlugin.getPoints() : null
      };
      
    } catch (error) {
      console.error("Background render failed:", error);
    } finally {
      isRendering.value = false;
      currentRenderContext = null;
      renderTimeout = null;
    }
  };

  /**
   * Convert AudioBuffer to MP3
   */
  const convertToMP3 = async (buffer: AudioBuffer, bitrate: number): Promise<Blob> => {
    return new Promise((resolve) => {
      // Use a worker if available, otherwise inline
      const worker = new Worker(URL.createObjectURL(new Blob([`
        importScripts('https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js');
        
        self.onmessage = function(e) {
          const { leftChannel, rightChannel, sampleRate, bitrate } = e.data;
          const mp3encoder = new lamejs.Mp3Encoder(2, sampleRate, bitrate);
          const mp3Data = [];
          const sampleBlockSize = 1152;
          
          for (let i = 0; i < leftChannel.length; i += sampleBlockSize) {
            const leftChunk = new Int16Array(sampleBlockSize);
            const rightChunk = new Int16Array(sampleBlockSize);
            const chunkSize = Math.min(sampleBlockSize, leftChannel.length - i);
            
            for (let j = 0; j < chunkSize; j++) {
              leftChunk[j] = leftChannel[i + j] * 0x7fff;
              rightChunk[j] = rightChannel[i + j] * 0x7fff;
            }
            
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) mp3Data.push(mp3buf);
          }
          
          const mp3buf = mp3encoder.flush();
          if (mp3buf.length > 0) mp3Data.push(mp3buf);
          
          self.postMessage({ mp3Data });
        };
      `], { type: 'application/javascript' })));
      
      worker.onmessage = (e) => {
        const mp3Data = e.data.mp3Data.map((buf: any) => new Uint8Array(buf).buffer);
        resolve(new Blob(mp3Data, { type: 'audio/mp3' }));
        worker.terminate();
      };
      
      worker.onerror = async () => {
        // Fallback to inline encoding
        worker.terminate();
        const blob = await encodeMP3Inline(buffer, bitrate);
        resolve(blob);
      };
      
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;
      
      worker.postMessage({
        leftChannel: leftChannel,
        rightChannel: rightChannel,
        sampleRate: buffer.sampleRate,
        bitrate: bitrate
      });
    });
  };

  /**
   * Fallback inline MP3 encoding
   */
  const encodeMP3Inline = async (buffer: AudioBuffer, bitrate: number): Promise<Blob> => {
    const mp3encoder = new lamejs.Mp3Encoder(buffer.numberOfChannels, buffer.sampleRate, bitrate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;
    const mp3Data = [];
    const sampleBlockSize = 1152;
    
    for (let i = 0; i < buffer.length; i += sampleBlockSize) {
      const leftChunk = new Int16Array(sampleBlockSize);
      const rightChunk = new Int16Array(sampleBlockSize);
      const chunkSize = Math.min(sampleBlockSize, buffer.length - i);
      
      for (let j = 0; j < chunkSize; j++) {
        leftChunk[j] = (leftChannel[i + j] || 0) * 0x7fff;
        rightChunk[j] = (rightChannel[i + j] || 0) * 0x7fff;
      }
      
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf).buffer);
      }
    }
    
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf).buffer);
    }
    
    return new Blob(mp3Data, { type: 'audio/mp3' });
  };

  /**
   * Instant export - just download the cached MP3
   */
  const exportAudio = async (
    rawAudio: File,
    region: number[],
    speed: number,
    exportedVolume: number,
    equalizer: EqItem[],
    envelopePlugin: any,
    getEnvelopeVolumeAtTime: (time: number) => number,
    bitrate: number,
    customFilename?: string
  ) => {
    try {
      isExporting.value = true;
      
      // Check if we have a cached MP3 with current settings
      const currentSettings = {
        region: [...region],
        speed,
        exportedVolume,
        equalizer: JSON.parse(JSON.stringify(equalizer)),
        bitrate,
        envelopePoints: envelopePlugin ? envelopePlugin.getPoints() : null
      };
      
      if (!cachedMP3Blob || settingsChanged(currentSettings)) {
        // Need to render first
        await performRender(rawAudio, region, speed, exportedVolume, equalizer, envelopePlugin, bitrate);
      }
      
      if (!cachedMP3Blob) {
        throw new Error("Failed to render audio");
      }
      
      // Instant download of cached MP3
      const url = URL.createObjectURL(cachedMP3Blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = customFilename || rawAudio.name;
      link.download = filename.endsWith('.mp3') ? filename : `${filename.replace(/\.[^/.]+$/, '')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      isExporting.value = false;
    }
  };

  /**
   * Clear all caches
   */
  const clearCache = () => {
    cachedRenderedBuffer = null;
    cachedMP3Blob = null;
    cachedSettings = null;
    sourceBuffer = null;
    sourceFile = null;
    
    if (renderTimeout) {
      clearTimeout(renderTimeout);
      renderTimeout = null;
    }
  };

  return {
    isExporting,
    isRendering,
    renderProgress,
    exportAudio,
    renderInBackground,
    clearCache,
    initializeAudio
  };
}