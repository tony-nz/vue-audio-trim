export const formatTime = (v: number): string => {
  const minutes = Math.floor(v / 60);
  const formattedMinutes = Number(minutes) < 10 ? `0${minutes}` : minutes;

  const seconds = Math.floor(v % 60);
  const formattedSeconds = Number(seconds) < 10 ? `0${seconds}` : seconds;

  const ms = String(v.toFixed(1)).split('.')[1];
  return `${formattedMinutes}:${formattedSeconds}.${ms}`;
};

export const getRegionPixelPosition = (time: number, wavesurfer?: any): number => {
  if (!wavesurfer) {
    // Fallback when wavesurfer is not available yet
    const waveformElement = document.querySelector('#waveform');
    if (!waveformElement) return 0;
    const width = waveformElement.clientWidth;
    // Assume a reasonable duration for calculation
    return (time / 180) * width; // 180 seconds as fallback
  }
  const duration = wavesurfer.getDuration();
  const waveformElement = document.querySelector('#waveform');
  if (!waveformElement) return 0;
  const width = waveformElement.clientWidth;
  return (time / duration) * width;
};

export const getWaveformWidth = (): number => {
  const waveformElement = document.querySelector('#waveform');
  return waveformElement ? waveformElement.clientWidth : 0;
};

export const handleKeyPress = (event: KeyboardEvent, handlePlayPause: () => void, wavesurfer: any) => {
  const code = event.code;
  if (code === 'Space') {
    handlePlayPause();
    event.preventDefault();
  } else if (code === 'ArrowLeft') {
    wavesurfer?.skip(-3);
    event.preventDefault();
  } else if (code === 'ArrowRight') {
    wavesurfer?.skip(3);
    event.preventDefault();
  }
};