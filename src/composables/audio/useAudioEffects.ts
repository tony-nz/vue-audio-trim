import { ref, watch } from 'vue';

/**
 * Interface for equalizer band configuration
 */
export interface EqItem {
  f: number; // Frequency in Hz
  type: BiquadFilterType; // Filter type (lowshelf, peaking, highshelf)
  value: number; // Gain value in dB
}

/**
 * Composable for managing all audio effects including volume, speed, equalizer, and fade controls
 * @returns Object containing effect controls, setters, and utility functions
 */
export function useAudioEffects() {
  // Volume controls
  const volume = ref(100);
  const exportedVolume = ref(100);

  // Speed control
  const speed = ref(100);

  // Bitrate control
  const bitrate = ref(192);

  // Equalizer
  const equalizer = ref<EqItem[]>([
    { f: 32, type: 'lowshelf', value: 0 },
    { f: 64, type: 'peaking', value: 0 },
    { f: 125, type: 'peaking', value: 0 },
    { f: 250, type: 'peaking', value: 0 },
    { f: 500, type: 'peaking', value: 0 },
    { f: 1000, type: 'peaking', value: 0 },
    { f: 2000, type: 'peaking', value: 0 },
    { f: 4000, type: 'peaking', value: 0 },
    { f: 8000, type: 'peaking', value: 0 },
    { f: 16000, type: 'highshelf', value: 0 },
  ]);

  // Fade controls
  const fadeInEnabled = ref(false);
  const fadeInDuration = ref(3.0);
  const fadeOutEnabled = ref(false);
  const fadeOutDuration = ref(3.0);
  const isTrimMode = ref(true);

  const setVolume = (wavesurfer: any, v = 100) => {
    volume.value = v;
    wavesurfer?.setVolume(volume.value / 100);
  };

  const setSpeed = (wavesurfer: any, v: number) => {
    speed.value = v;
    wavesurfer?.setPlaybackRate(speed.value / 100);
  };

  const updateEqualizer = (v: number, index: number) => {
    equalizer.value[index].value = v;
  };

  const resetEqualizer = () => {
    equalizer.value?.forEach((f) => (f.value = 0));
  };

  const toggleFadeIn = () => {
    fadeInEnabled.value = !fadeInEnabled.value;
  };

  const toggleFadeOut = () => {
    fadeOutEnabled.value = !fadeOutEnabled.value;
  };

  const toggleTrimMode = () => {
    isTrimMode.value = !isTrimMode.value;
  };

  const resetAll = (wavesurfer: any) => {
    setVolume(wavesurfer, 100);
    exportedVolume.value = 100;
    setSpeed(wavesurfer, 100);
    bitrate.value = 192;
    resetEqualizer();
    fadeInEnabled.value = false;
    fadeInDuration.value = 3.0;
    fadeOutEnabled.value = false;
    fadeOutDuration.value = 3.0;
    isTrimMode.value = true;
  };

  return {
    // Volume
    volume,
    exportedVolume,
    setVolume,
    
    // Speed
    speed,
    setSpeed,
    
    // Bitrate
    bitrate,
    
    // Equalizer
    equalizer,
    updateEqualizer,
    resetEqualizer,
    
    // Fades
    fadeInEnabled,
    fadeInDuration,
    fadeOutEnabled,
    fadeOutDuration,
    isTrimMode,
    toggleFadeIn,
    toggleFadeOut,
    toggleTrimMode,
    
    // Reset
    resetAll,
  };
}