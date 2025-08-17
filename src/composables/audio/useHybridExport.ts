import { ref } from "vue";
// @ts-ignore
import lamejs from "lamejs";
import { PerformanceTest } from "../../utils/performanceTest";
import type { EqItem } from "./useAudioEffects";

/**
 * Hybrid export - applies all effects using fast OfflineAudioContext, then instant WAV or background MP3
 */
export function useHybridExport() {
  const isExporting = ref(false);
  const isBackgroundProcessing = ref(false);
  const backgroundProgress = ref(0);
  const perfTest = new PerformanceTest();

  // Cache for the last processed buffer
  let cachedProcessedBuffer: AudioBuffer | null = null;
  let cachedSettings: string | null = null;

  const exportAudio = async (
    rawAudio: File,
    region: number[],
    speed: number,
    exportedVolume: number,
    equalizer: EqItem[],
    envelopePlugin: any,
    bitrate: number,
    customFilename?: string,
    format: string = "wav"
  ) => {
    try {
      perfTest.start("TOTAL_HYBRID_EXPORT");
      isExporting.value = true;
      
      // Create settings hash to check if we need to re-process
      const currentSettings = JSON.stringify({
        region,
        speed,
        exportedVolume,
        equalizer,
        envelopePoints: envelopePlugin?.getPoints() || null
      });
      
      let processedBuffer: AudioBuffer;
      
      if (cachedProcessedBuffer && cachedSettings === currentSettings) {
        // Use cached processed buffer
        perfTest.start("USE_CACHE");
        processedBuffer = cachedProcessedBuffer;
        perfTest.end("USE_CACHE");
        console.log("📦 Using cached processed audio");
      } else {
        // Need to process audio with effects
        perfTest.start("PROCESS_AUDIO");
        processedBuffer = await processAudioWithEffects(
          rawAudio,
          region,
          speed,
          exportedVolume,
          equalizer,
          envelopePlugin
        );
        
        // Cache the result
        cachedProcessedBuffer = processedBuffer;
        cachedSettings = currentSettings;
        perfTest.end("PROCESS_AUDIO");
      }
      
      if (format === "wav") {
        // Instant WAV export
        perfTest.start("WAV_EXPORT");
        const wavBlob = audioBufferToWav(processedBuffer);
        downloadFile(wavBlob, customFilename || rawAudio.name, "wav");
        perfTest.end("WAV_EXPORT");
        
        perfTest.end("TOTAL_HYBRID_EXPORT");
        console.log(`✅ INSTANT WAV export with effects completed! File size: ${(wavBlob.size / 1024 / 1024).toFixed(2)} MB`);
      } else {
        // MP3 export - offer instant WAV while processing MP3 in background
        perfTest.start("BACKGROUND_MP3");
        
        // Start background MP3 processing
        isBackgroundProcessing.value = true;
        backgroundProgress.value = 0;
        
        console.log("🎵 Starting background MP3 conversion...");
        setTimeout(async () => {
          try {
            const mp3Blob = await audioBufferToMp3Background(processedBuffer, bitrate);
            downloadFile(mp3Blob, customFilename || rawAudio.name, "mp3");
            console.log(`✅ Background MP3 export completed! File size: ${(mp3Blob.size / 1024 / 1024).toFixed(2)} MB`);
          } catch (error) {
            console.error("❌ Background MP3 conversion failed:", error);
          } finally {
            isBackgroundProcessing.value = false;
            backgroundProgress.value = 0;
          }
        }, 100);
        
        perfTest.end("BACKGROUND_MP3");
        perfTest.end("TOTAL_HYBRID_EXPORT");
      }
      
    } catch (error) {
      console.error("❌ Hybrid export failed:", error);
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      isExporting.value = false;
      perfTest.report();
    }
  };

  /**
   * Process audio with all effects using fast OfflineAudioContext
   */
  const processAudioWithEffects = async (
    rawAudio: File,
    region: number[],
    speed: number,
    exportedVolume: number,
    equalizer: EqItem[],
    envelopePlugin: any
  ): Promise<AudioBuffer> => {
    
    // Decode audio
    const audioContext = new AudioContext();
    const arrayBuffer = await rawAudio.arrayBuffer();
    const sourceBuffer = await audioContext.decodeAudioData(arrayBuffer);
    await audioContext.close();
    
    const startTime = region[0];
    const endTime = region[1];
    const duration = endTime - startTime;
    const speedMultiplier = speed / 100;
    const outputDuration = duration / speedMultiplier;
    
    // Create offline context for processing
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
    let lastNode: AudioNode = gainNode;
    
    // Apply envelope automation if fade is enabled
    if (envelopePlugin) {
      const points = envelopePlugin.getPoints();
      if (points && points.length > 0) {
        gainNode.gain.cancelScheduledValues(0);
        gainNode.gain.setValueAtTime(exportedVolume / 100, 0);
        
        for (const point of points) {
          if (point.time >= startTime && point.time <= endTime) {
            const adjustedTime = (point.time - startTime) / speedMultiplier;
            const volume = point.volume * (exportedVolume / 100);
            gainNode.gain.linearRampToValueAtTime(volume, adjustedTime);
          }
        }
      } else {
        gainNode.gain.value = exportedVolume / 100;
      }
    } else {
      gainNode.gain.value = exportedVolume / 100;
    }
    
    // Apply EQ
    const hasEq = equalizer.some(eq => eq.value !== 0);
    if (hasEq) {
      equalizer.forEach(eq => {
        if (eq.value !== 0) {
          const filter = offlineContext.createBiquadFilter();
          filter.type = eq.type;
          filter.frequency.value = eq.f;
          filter.gain.value = eq.value;
          if (eq.type === "peaking") filter.Q.value = 1;
          
          lastNode.connect(filter);
          lastNode = filter;
        }
      });
    }
    
    // Connect chain
    source.connect(gainNode);
    lastNode.connect(offlineContext.destination);
    
    // Start and render
    source.start(0, startTime, duration);
    return await offlineContext.startRendering();
  };

  /**
   * Convert to WAV (instant)
   */
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    let offset = 0;
    writeString(view, offset, 'RIFF'); offset += 4;
    view.setUint32(offset, bufferSize - 8, true); offset += 4;
    writeString(view, offset, 'WAVE'); offset += 4;
    writeString(view, offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numberOfChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, byteRate, true); offset += 4;
    view.setUint16(offset, blockAlign, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString(view, offset, 'data'); offset += 4;
    view.setUint32(offset, dataSize, true); offset += 4;
    
    const channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    let sampleOffset = offset;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(sampleOffset, intSample, true);
        sampleOffset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  /**
   * Convert to MP3 in background with progress
   */
  const audioBufferToMp3Background = async (buffer: AudioBuffer, bitrate: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const mp3encoder = new lamejs.Mp3Encoder(buffer.numberOfChannels, buffer.sampleRate, bitrate);
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;
        const mp3Data: ArrayBuffer[] = [];
        const blockSize = 1152 * 4;
        const totalSamples = buffer.length;
        
        let processedSamples = 0;
        
        const processChunk = () => {
          const start = processedSamples;
          const chunkEnd = Math.min(start + blockSize * 10, totalSamples); // Process 10 blocks at a time
          
          for (let i = start; i < chunkEnd; i += blockSize) {
            const chunkSize = Math.min(blockSize, totalSamples - i);
            const leftChunk = new Int16Array(chunkSize);
            const rightChunk = new Int16Array(chunkSize);
            
            for (let j = 0; j < chunkSize; j++) {
              leftChunk[j] = Math.max(-32768, Math.min(32767, (leftChannel[i + j] || 0) * 32767));
              rightChunk[j] = Math.max(-32768, Math.min(32767, (rightChannel[i + j] || 0) * 32767));
            }
            
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
              mp3Data.push(new Uint8Array(mp3buf).buffer);
            }
          }
          
          processedSamples = chunkEnd;
          backgroundProgress.value = Math.round((processedSamples / totalSamples) * 90); // Leave 10% for flush
          
          if (processedSamples < totalSamples) {
            // Continue processing in next frame
            setTimeout(processChunk, 0);
          } else {
            // Finish up
            const mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0) {
              mp3Data.push(new Uint8Array(mp3buf).buffer);
            }
            backgroundProgress.value = 100;
            resolve(new Blob(mp3Data, { type: 'audio/mp3' }));
          }
        };
        
        processChunk();
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const downloadFile = (blob: Blob, filename: string, format: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const extension = format === "mp3" ? ".mp3" : ".wav";
    link.download = filename.endsWith(extension) ? filename : `${filename.replace(/\.[^/.]+$/, "")}${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    isExporting,
    isBackgroundProcessing,
    backgroundProgress,
    exportAudio
  };
}