import { ref } from 'vue';
import MusicTempo from 'music-tempo';

interface EventTargetWithResult extends EventTarget {
  result: string;
}

interface MusicTempoData {
  tempo?: number;
}

export function useMusicTempo() {
  const isTempoLoading = ref(false);
  const musicInfo = ref<MusicTempoData | null>(null);

  const decodeAndSetMusicInfo = (rawAudio: File, dialog: any) => {
    isTempoLoading.value = true;

    const context = new AudioContext();
    const reader = new FileReader();
    reader.onload = async ($event) => {
      const target = $event.target as EventTargetWithResult;
      const result = target.result as unknown as ArrayBuffer;
      await context.decodeAudioData(result, (buffer: AudioBuffer) => {
        let audioData: number[] | Float32Array = [];
        
        if (buffer.numberOfChannels === 2) {
          const channel1Data = buffer.getChannelData(0);
          const channel2Data = buffer.getChannelData(1);
          const length = channel1Data.length;
          for (let i = 0; i < length; i++) {
            audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
          }
        } else {
          audioData = buffer.getChannelData(0);
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          musicInfo.value = new MusicTempo(audioData) as MusicTempoData;
        } finally {
          isTempoLoading.value = false;
          dialog.close();
        }
      });
    };
    reader.readAsArrayBuffer(rawAudio);
  };

  return {
    isTempoLoading,
    musicInfo,
    decodeAndSetMusicInfo,
  };
}