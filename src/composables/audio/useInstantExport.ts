import { ref } from "vue";
// @ts-ignore
import lamejs from "lamejs";
import { PerformanceTest } from "../../utils/performanceTest";

/**
 * TRULY instant export - just grabs what WaveSurfer already has
 */
export function useInstantExport() {
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
      perfTest.start("TOTAL_EXPORT");
      isExporting.value = true;
      
      // Method 1: Try to get the current audio buffer directly from WaveSurfer
      perfTest.start("GET_BUFFER");
      let audioBuffer: AudioBuffer | null = null;
      
      try {
        // Get the decoded audio buffer from WaveSurfer
        audioBuffer = wavesurfer.getDecodedData();
        if (!audioBuffer) {
          throw new Error("No decoded data from WaveSurfer");
        }
        perfTest.end("GET_BUFFER");
        console.log(`📊 Buffer: ${audioBuffer.duration}s, ${audioBuffer.sampleRate}Hz, ${audioBuffer.numberOfChannels} channels`);
      } catch (error) {
        perfTest.end("GET_BUFFER");
        console.error("Failed to get buffer from WaveSurfer:", error);
        alert("Failed to get audio data from WaveSurfer");
        return;
      }

      // Method 2: Convert to MP3 with minimal processing
      perfTest.start("MP3_ENCODE");
      const mp3Blob = await convertToMp3Minimal(audioBuffer);
      perfTest.end("MP3_ENCODE");

      // Method 3: Download immediately
      perfTest.start("DOWNLOAD");
      const url = URL.createObjectURL(mp3Blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = customFilename || "export.mp3";
      link.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      perfTest.end("DOWNLOAD");

      perfTest.end("TOTAL_EXPORT");
      console.log("✅ Export completed successfully!");

    } catch (error) {
      console.error("❌ Export failed:", error);
      alert(`Export failed: ${error.message}`);
    } finally {
      isExporting.value = false;
      perfTest.report();
    }
  };

  /**
   * Minimal MP3 conversion - no fancy processing
   */
  const convertToMp3Minimal = async (buffer: AudioBuffer): Promise<Blob> => {
    const perfTest = new PerformanceTest();
    
    perfTest.start("MP3_INIT");
    // Use fixed settings for speed
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;
    const bitrate = 128; // Lower bitrate for speed
    
    let mp3encoder;
    try {
      if (lamejs && lamejs.Mp3Encoder) {
        mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
      } else if ((window as any).lamejs) {
        mp3encoder = new (window as any).lamejs.Mp3Encoder(channels, sampleRate, bitrate);
      } else {
        throw new Error("lamejs not available");
      }
    } catch (e) {
      throw new Error(`MP3 encoder init failed: ${e.message}`);
    }
    perfTest.end("MP3_INIT");

    perfTest.start("GET_CHANNEL_DATA");
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = channels > 1 ? buffer.getChannelData(1) : leftChannel;
    perfTest.end("GET_CHANNEL_DATA");

    perfTest.start("MP3_CONVERSION");
    const mp3Data: ArrayBuffer[] = [];
    
    // Use MUCH larger chunks for speed
    const blockSize = 1152 * 8; // 8x larger blocks
    const totalSamples = buffer.length;
    
    console.log(`📊 Converting ${totalSamples} samples in ${Math.ceil(totalSamples / blockSize)} chunks`);
    
    for (let i = 0; i < totalSamples; i += blockSize) {
      const chunkSize = Math.min(blockSize, totalSamples - i);
      const leftChunk = new Int16Array(chunkSize);
      const rightChunk = new Int16Array(chunkSize);
      
      // Batch convert float to int16
      for (let j = 0; j < chunkSize; j++) {
        leftChunk[j] = Math.max(-32768, Math.min(32767, (leftChannel[i + j] || 0) * 32767));
        rightChunk[j] = Math.max(-32768, Math.min(32767, (rightChannel[i + j] || 0) * 32767));
      }
      
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf).buffer);
      }
      
      // Log progress every 10 chunks
      const chunkIndex = Math.floor(i / blockSize);
      if (chunkIndex % 10 === 0) {
        const progress = ((i / totalSamples) * 100).toFixed(1);
        console.log(`📊 MP3 encoding: ${progress}%`);
      }
    }
    
    // Flush
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf).buffer);
    }
    
    perfTest.end("MP3_CONVERSION");
    
    perfTest.start("BLOB_CREATION");
    const blob = new Blob(mp3Data, { type: "audio/mp3" });
    perfTest.end("BLOB_CREATION");
    
    console.log(`📊 MP3 size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
    
    return blob;
  };

  return {
    isExporting,
    exportAudio
  };
}