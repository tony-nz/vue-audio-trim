declare module 'music-tempo' {
  export default class MusicTempo {
    constructor(audioData: Float32Array | number[]);
    tempo?: number;
    beats?: number[];
    spectralFlux?: number[];
    peaks?: number[];
  }
}