import { ref, watch } from 'vue';
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.esm.js';

/**
 * Composable for managing WaveSurfer EnvelopePlugin to create smooth fade curves
 * Uses exponential mathematical functions for natural-sounding audio fades
 * @returns Object containing envelope plugin instance and curve calculation functions
 */
export function useEnvelope() {
  const envelopePlugin = ref<any>(null);

  const createEnvelopePlugin = () => {
    envelopePlugin.value = EnvelopePlugin.create({
      points: [
        { time: 0, volume: 1 },
        { time: 1, volume: 1 },
      ],
      lineColor: 'rgba(255, 255, 255, 0.7)',
      lineWidth: 2,
      dragPointSize: 8,
      dragPointFill: 'rgba(255, 255, 255, 0.9)',
      dragPointStroke: 'rgba(255, 255, 255, 1)',
    });
  };

  const updateEnvelopePoints = (
    wavesurfer: any,
    region: number[],
    fadeInEnabled: boolean,
    fadeInDuration: number,
    fadeOutEnabled: boolean,
    fadeOutDuration: number
  ) => {
    if (!envelopePlugin.value || !wavesurfer) return;

    const fullDuration = wavesurfer.getDuration();
    const regionStart = region[0];
    const regionEnd = region[1];
    const points = [];

    const exponentialFade = (t: number, fadeIn: boolean = true): number => {
      if (fadeIn) {
        return 1 - Math.exp(-2 * t);
      } else {
        return Math.exp(-2 * t);
      }
    };

    if (regionStart > 0) {
      points.push({ time: 0, volume: 1 });
      points.push({ time: regionStart, volume: 1 });
    }

    if (fadeInEnabled) {
      const numPoints = 30;
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const time = regionStart + t * fadeInDuration;
        const volume = exponentialFade(t, true);
        if (time <= regionEnd) {
          points.push({ time, volume });
        }
      }
    } else {
      points.push({ time: regionStart, volume: 1 });
    }

    const fadeInEnd = fadeInEnabled ? regionStart + fadeInDuration : regionStart;
    const fadeOutStart = fadeOutEnabled ? regionEnd - fadeOutDuration : regionEnd;

    if (fadeInEnd < fadeOutStart) {
      points.push({ time: fadeInEnd, volume: 1 });
      points.push({ time: fadeOutStart, volume: 1 });
    }

    if (fadeOutEnabled) {
      const numPoints = 30;
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const time = fadeOutStart + t * fadeOutDuration;
        const volume = exponentialFade(t, false);
        if (time >= regionStart) {
          points.push({ time, volume });
        }
      }
    } else {
      points.push({ time: regionEnd, volume: 1 });
    }

    if (regionEnd < fullDuration) {
      points.push({ time: regionEnd, volume: 1 });
      points.push({ time: fullDuration, volume: 1 });
    }

    envelopePlugin.value.setPoints(points);
  };

  const getEnvelopeVolumeAtTime = (time: number): number => {
    if (!envelopePlugin.value) return 1;

    const points = envelopePlugin.value.getPoints();
    if (!points || points.length === 0) return 1;

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

    if (!nextPoint) {
      return prevPoint.volume;
    }

    const timeDiff = nextPoint.time - prevPoint.time;
    const volumeDiff = nextPoint.volume - prevPoint.volume;
    const timeProgress = (time - prevPoint.time) / timeDiff;

    return prevPoint.volume + volumeDiff * timeProgress;
  };

  return {
    envelopePlugin,
    createEnvelopePlugin,
    updateEnvelopePoints,
    getEnvelopeVolumeAtTime,
  };
}