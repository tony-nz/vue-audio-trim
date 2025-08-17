import { ref } from "vue";
import { PerformanceTest } from "../../utils/performanceTest";

/**
 * TRULY instant export - WAV format (no encoding needed)
 */
export function useTrulyInstantExport() {
  const isExporting = ref(false);
  const perfTest = new PerformanceTest();

  const exportAudio = async (
    wavesurfer: any,
    customFilename?: string
  ) => {
    if (!wavesurfer) {
      alert("WaveSurfer not ready");
      return;
    }

    try {
      perfTest.start("TOTAL_INSTANT_EXPORT");
      isExporting.value = true;
      
      // Get buffer instantly
      perfTest.start("GET_BUFFER");
      const audioBuffer = wavesurfer.getDecodedData();
      if (!audioBuffer) {
        throw new Error("No audio buffer available");
      }
      perfTest.end("GET_BUFFER");
      
      // Convert to WAV instantly (no encoding, just header + raw data)
      perfTest.start("WAV_CONVERSION");
      const wavBlob = audioBufferToWav(audioBuffer);
      perfTest.end("WAV_CONVERSION");
      
      // Download instantly
      perfTest.start("DOWNLOAD");
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement("a");
      link.href = url;
      const filename = customFilename || "export";
      link.download = filename.endsWith('.wav') ? filename : `${filename.replace(/\.[^/.]+$/, "")}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      perfTest.end("DOWNLOAD");
      
      perfTest.end("TOTAL_INSTANT_EXPORT");
      console.log(`✅ INSTANT WAV export completed! File size: ${(wavBlob.size / 1024 / 1024).toFixed(2)} MB`);
      
    } catch (error) {
      console.error("❌ Instant export failed:", error);
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      isExporting.value = false;
      perfTest.report();
    }
  };

  /**
   * Convert AudioBuffer to WAV (instant - no encoding)
   */
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize; // WAV header is 44 bytes
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    let offset = 0;
    
    // RIFF chunk descriptor
    writeString(view, offset, 'RIFF'); offset += 4;
    view.setUint32(offset, bufferSize - 8, true); offset += 4; // file size - 8
    writeString(view, offset, 'WAVE'); offset += 4;
    
    // fmt sub-chunk
    writeString(view, offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4; // sub-chunk size
    view.setUint16(offset, 1, true); offset += 2; // audio format (PCM)
    view.setUint16(offset, numberOfChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, byteRate, true); offset += 4;
    view.setUint16(offset, blockAlign, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2; // bits per sample
    
    // data sub-chunk
    writeString(view, offset, 'data'); offset += 4;
    view.setUint32(offset, dataSize, true); offset += 4;
    
    // Write audio data
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

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return {
    isExporting,
    exportAudio
  };
}