import { ref } from "vue";
// @ts-ignore
import lamejs from "lamejs";
import type { EqItem } from "./useAudioEffects";

/**
 * Fast audio export using OfflineAudioContext for real-time rendering
 */
export function useAudioExportFast() {
  const exportFormat = ref("mp3");
  const isExporting = ref(false);
  
  // Cache for decoded audio buffer
  let cachedAudioBuffer: AudioBuffer | null = null;
  let cachedAudioFile: File | null = null;

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
      
      // Use cached buffer if available and file hasn't changed
      let sourceBuffer: AudioBuffer;
      if (cachedAudioFile === rawAudio && cachedAudioBuffer) {
        sourceBuffer = cachedAudioBuffer;
      } else {
        // Decode audio only if not cached
        const audioContext = new AudioContext();
        const arrayBuffer = await rawAudio.arrayBuffer();
        sourceBuffer = await audioContext.decodeAudioData(arrayBuffer);
        await audioContext.close();
        
        // Cache for next time
        cachedAudioBuffer = sourceBuffer;
        cachedAudioFile = rawAudio;
      }

      const startTime = region[0];
      const endTime = region[1];
      const duration = endTime - startTime;
      const speedMultiplier = speed / 100;
      const outputDuration = duration / speedMultiplier;
      
      // Create offline context for fast rendering
      const offlineContext = new OfflineAudioContext(
        sourceBuffer.numberOfChannels,
        Math.ceil(outputDuration * sourceBuffer.sampleRate),
        sourceBuffer.sampleRate
      );

      // Create source
      const source = offlineContext.createBufferSource();
      source.buffer = sourceBuffer;
      source.playbackRate.value = speedMultiplier;
      
      // Create gain node for volume
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = exportedVolume / 100;
      
      // Apply envelope automation if fade is enabled
      if (envelopePlugin) {
        const envelopePoints = envelopePlugin.getPoints();
        if (envelopePoints && envelopePoints.length > 0) {
          // Clear any existing automation
          gainNode.gain.cancelScheduledValues(0);
          gainNode.gain.setValueAtTime(exportedVolume / 100, 0);
          
          // Apply envelope points as gain automation
          for (let i = 0; i < envelopePoints.length - 1; i++) {
            const point = envelopePoints[i];
            const nextPoint = envelopePoints[i + 1];
            
            // Only apply points within our region
            if (point.time >= startTime && point.time <= endTime) {
              const adjustedTime = (point.time - startTime) / speedMultiplier;
              const volume = point.volume * (exportedVolume / 100);
              
              if (i === 0 || envelopePoints[i - 1].time < startTime) {
                // First point or first point in region
                gainNode.gain.setValueAtTime(volume, adjustedTime);
              } else {
                // Linear ramp to this point
                gainNode.gain.linearRampToValueAtTime(volume, adjustedTime);
              }
            }
          }
        }
      }
      
      // Connect nodes
      source.connect(gainNode);
      
      // Apply EQ if needed
      let lastNode: AudioNode = gainNode;
      const hasEqChanges = equalizer.some((eq) => eq.value !== 0);
      
      if (hasEqChanges) {
        const filters: BiquadFilterNode[] = [];
        
        equalizer.forEach((eq) => {
          if (eq.value !== 0) {
            const filter = offlineContext.createBiquadFilter();
            filter.type = eq.type;
            filter.frequency.value = eq.f;
            filter.gain.value = eq.value;
            
            if (eq.type === "peaking") {
              filter.Q.value = 1;
            }
            
            lastNode.connect(filter);
            lastNode = filter;
            filters.push(filter);
          }
        });
      }
      
      // Connect to destination
      lastNode.connect(offlineContext.destination);
      
      // Start playback at the trim start point
      source.start(0, startTime, duration);
      
      // Render audio (this is fast!)
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to MP3
      const filename = customFilename || rawAudio.name;
      await downloadAsMp3Fast(renderedBuffer, filename, bitrate);
      
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      isExporting.value = false;
    }
  };

  const downloadAsMp3Fast = async (
    audioBuffer: AudioBuffer,
    fileName: string,
    bitrate: number
  ) => {
    try {
      // Use Web Workers if available for MP3 encoding
      const mp3Blob = await audioBufferToMp3Fast(audioBuffer, bitrate);
      const url = URL.createObjectURL(mp3Blob);
      const link = document.createElement("a");
      link.href = url;
      const downloadName = fileName.endsWith('.mp3') 
        ? fileName 
        : `${fileName.replace(/\.[^/.]+$/, "")}.mp3`;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("MP3 conversion failed:", error);
      alert("MP3 conversion failed. Please try again.");
    }
  };

  const audioBufferToMp3Fast = async (
    buffer: AudioBuffer,
    bitrate: number
  ): Promise<Blob> => {
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;
    const kbps = bitrate || 192;

    // Initialize MP3 encoder
    let mp3encoder;
    try {
      if (lamejs && lamejs.Mp3Encoder) {
        mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, kbps);
      } else if ((window as any).lamejs) {
        mp3encoder = new (window as any).lamejs.Mp3Encoder(
          numberOfChannels,
          sampleRate,
          kbps
        );
      } else {
        throw new Error("MP3 encoder not available");
      }
    } catch (e) {
      console.error("Failed to initialize Mp3Encoder:", e);
      throw new Error("MP3 encoder initialization failed");
    }

    const leftChannel = buffer.getChannelData(0);
    const rightChannel =
      numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;
    
    // Use larger block size for faster encoding
    const sampleBlockSize = 1152 * 4; // Process 4x more samples at once
    const mp3Data: ArrayBuffer[] = [];

    for (let i = 0; i < length; i += sampleBlockSize) {
      const chunkSize = Math.min(sampleBlockSize, length - i);
      const leftChunk = new Int16Array(chunkSize);
      const rightChunk = new Int16Array(chunkSize);

      // Convert float samples to int16 in batch
      for (let j = 0; j < chunkSize; j++) {
        const leftSample = Math.max(-1, Math.min(1, leftChannel[i + j] || 0));
        const rightSample = Math.max(-1, Math.min(1, rightChannel[i + j] || 0));
        leftChunk[j] = leftSample * 0x7fff;
        rightChunk[j] = rightSample * 0x7fff;
      }

      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf).buffer);
      }
    }

    // Flush remaining data
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf).buffer);
    }

    return new Blob(mp3Data, { type: "audio/mp3" });
  };

  // Clear cache when component unmounts or when needed
  const clearCache = () => {
    cachedAudioBuffer = null;
    cachedAudioFile = null;
  };

  return {
    exportFormat,
    isExporting,
    exportAudio,
    clearCache,
  };
}