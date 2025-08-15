import { ref } from 'vue';
// @ts-ignore
import lamejs from 'lamejs';
import type { EqItem } from './useAudioEffects';

export function useAudioExport() {
  const exportFormat = ref('mp3');
  const isExporting = ref(false);

  const exportAudio = async (
    rawAudio: File,
    region: number[],
    speed: number,
    exportedVolume: number,
    equalizer: EqItem[],
    envelopePlugin: any,
    getEnvelopeVolumeAtTime: (time: number) => number,
    bitrate: number
  ) => {
    try {
      isExporting.value = true;
      const audioContext = new AudioContext();
      const buffer = await new Response(rawAudio).arrayBuffer();
      const decodedData = await audioContext.decodeAudioData(buffer);

      const startTime = region[0];
      const endTime = region[1];
      const startSample = Math.floor(startTime * decodedData.sampleRate);
      const endSample = Math.floor(endTime * decodedData.sampleRate);
      const exportLength = endSample - startSample;

      const speedMultiplier = speed / 100;
      const newLength = Math.floor(exportLength / speedMultiplier);
      const newBuffer = audioContext.createBuffer(
        decodedData.numberOfChannels,
        newLength,
        decodedData.sampleRate
      );

      const chunkSize = 44100;
      const volumeMultiplier = exportedVolume / 100;

      for (let channel = 0; channel < decodedData.numberOfChannels; channel++) {
        const originalChannelData = decodedData.getChannelData(channel);
        const newChannelData = newBuffer.getChannelData(channel);

        for (let chunkStart = 0; chunkStart < newLength; chunkStart += chunkSize) {
          const chunkEnd = Math.min(chunkStart + chunkSize, newLength);

          for (let i = chunkStart; i < chunkEnd; i++) {
            const originalIndex = startSample + Math.floor(i * speedMultiplier);
            if (originalIndex < endSample && originalIndex < originalChannelData.length) {
              let sample = originalChannelData[originalIndex] * volumeMultiplier;

              if (envelopePlugin) {
                const timePosition = i / decodedData.sampleRate;
                const envelopeVolume = getEnvelopeVolumeAtTime(timePosition);
                sample *= envelopeVolume;
              }

              newChannelData[i] = sample;
            }
          }

          if (chunkStart % (chunkSize * 10) === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }
      }

      const hasEqChanges = equalizer.some((eq) => eq.value !== 0);

      if (hasEqChanges) {
        const renderedBuffer = await applyEqualizer(newBuffer, equalizer);
        await downloadAsMp3(renderedBuffer, rawAudio.name, bitrate);
      } else {
        await downloadAsMp3(newBuffer, rawAudio.name, bitrate);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      isExporting.value = false;
    }
  };

  const applyEqualizer = async (buffer: AudioBuffer, equalizer: EqItem[]): Promise<AudioBuffer> => {
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = buffer;

    let currentNode: AudioNode = source;

    equalizer.forEach((eq) => {
      if (eq.value !== 0) {
        const filter = offlineContext.createBiquadFilter();
        filter.type = eq.type;
        filter.frequency.value = eq.f;
        filter.gain.value = eq.value;

        if (eq.type === 'peaking') {
          filter.Q.value = 1;
        }

        currentNode.connect(filter);
        currentNode = filter;
      }
    });

    currentNode.connect(offlineContext.destination);
    source.start();

    return await offlineContext.startRendering();
  };

  const downloadAsMp3 = async (audioBuffer: AudioBuffer, fileName: string, bitrate: number) => {
    try {
      const mp3Blob = await audioBufferToMp3(audioBuffer, bitrate);
      const url = URL.createObjectURL(mp3Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.replace(/\.[^/.]+$/, '')}_edited.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('MP3 conversion failed:', error);
      alert('MP3 conversion failed. Please try again.');
    }
  };

  const audioBufferToMp3 = async (buffer: AudioBuffer, bitrate: number): Promise<Blob> => {
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;
    const kbps = bitrate || 192;

    let mp3encoder;
    try {
      if (lamejs && lamejs.Mp3Encoder) {
        mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, kbps);
      } else if ((window as any).lamejs) {
        mp3encoder = new (window as any).lamejs.Mp3Encoder(numberOfChannels, sampleRate, kbps);
      } else if (lamejs && typeof lamejs === 'function') {
        mp3encoder = new lamejs(numberOfChannels, sampleRate, kbps);
      } else {
        const Mp3Encoder = (lamejs as any).Mp3Encoder || (lamejs as any).default?.Mp3Encoder || lamejs;
        mp3encoder = new Mp3Encoder(numberOfChannels, sampleRate, kbps);
      }
    } catch (e) {
      console.error('Failed to initialize Mp3Encoder:', e);
      console.error('lamejs structure:', lamejs);
      throw new Error('MP3 encoder initialization failed. The library may not be loaded correctly.');
    }

    const leftChannel = buffer.getChannelData(0);
    const rightChannel = numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;
    const sampleBlockSize = 1152;
    const mp3Data: ArrayBuffer[] = [];

    for (let i = 0; i < length; i += sampleBlockSize) {
      const leftChunk = new Int16Array(sampleBlockSize);
      const rightChunk = new Int16Array(sampleBlockSize);
      const chunkSize = Math.min(sampleBlockSize, length - i);

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

      if (i % (sampleBlockSize * 100) === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf).buffer);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
  };

  return {
    exportFormat,
    isExporting,
    exportAudio,
  };
}