# VueAudioTrim

A lightweight, open-source Vue.js component library for precise audio trimming, built on WaveSurfer.js. VueAudioTrim enables developers to seamlessly integrate intuitive audio editing into their projects. With millisecond-precision trimming, customizable fade effects, real-time volume control, tempo and BPM adjustments without pitch distortion, and multi-format export, it’s designed for efficiency and flexibility. Its real-time visual waveform interface empowers developers to create polished audio applications with ease, no prior audio expertise required.This description targets developers unfamiliar with WaveSurfer.js, emphasizing the trimming focus, key features (precision trimming, fade effects, volume control, BPM adjustment, easy export), and the Vue framework’s integration. It’s concise, highlights the tool’s accessibility, and positions it as a developer-friendly solution. Let me know if you want to adjust the tone, length, or add specific details!

![VueAudioTrim](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![WaveSurfer.js](https://img.shields.io/badge/WaveSurfer.js-7.x-FF6B6B?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## ✨ Features

### Core Audio Editing

- **Precision Cutting**: Cut and trim audio with millisecond precision using visual waveform editing
- **Fade Effects**: Apply smooth fade in/out effects with customizable exponential curves
- **Volume Control**: Adjust volume levels with precision mixing controls and real-time preview
- **BPM Adjustment**: Change tempo and BPM without affecting pitch quality using advanced algorithms
- **Equalizer**: 5-band equalizer with real-time frequency adjustment
- **Multiple Export Formats**: Export to MP3, WAV, FLAC, and OGG formats

### User Interface

- **Beautiful Landing Page**: Professional gradient design with animated wave bars
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Waveform**: Visual representation of audio with region selection
- **Loading States**: Elegant spinners for audio loading and export processing
- **Dark Theme**: Modern dark interface optimized for long editing sessions

### Technical Features

- **Vue 3 Composition API**: Built with modern Vue.js patterns and TypeScript
- **Modular Architecture**: Composables-based architecture for maintainability
- **WaveSurfer.js Integration**: Advanced audio visualization and manipulation
- **EnvelopePlugin**: Smooth fade curves using mathematical exponential functions
- **Keyboard Shortcuts**: Space bar for play/pause, arrow keys for navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/tony-nz/vue-waveform-editor.git
cd vue-waveform-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Project Structure

```
src/
├── components/
│   ├── audio/
│   │   ├── AudioEditor.vue          # Main editor orchestrator
│   │   ├── AudioEditorHeader.vue    # Top controls and actions
│   │   ├── AudioEditorWaveform.vue  # Waveform display with overlays
│   │   ├── AudioEditorControls.vue  # Bottom playback controls
│   │   ├── AudioEditorEffectsPanel.vue  # Effects control panel
│   │   ├── AudioEditorDialogs.vue   # Modal dialogs
│   │   └── AudioWelcome.vue         # Landing page with editor
│   └── common/
│       ├── CommonUploader.vue       # File upload component
│       └── BaseButton.vue          # Reusable button component
├── composables/
│   ├── audio/
│   │   ├── useWaveSurfer.ts        # WaveSurfer management
│   │   ├── useAudioEffects.ts      # Volume, speed, EQ effects
│   │   ├── useAudioExport.ts       # Audio processing and export
│   │   ├── useEnvelope.ts          # Fade curve calculations
│   │   └── useMusicTempo.ts        # BPM detection and adjustment
│   └── common/
│       └── useDialog.ts            # Modal dialog management
├── utils/
│   └── audioUtils.ts               # Utility functions
└── App.vue                         # Root component
```

### Key Composables

#### `useWaveSurfer.ts`

Manages WaveSurfer instance, region selection, and playback controls.

```typescript
export function useWaveSurfer(rawAudio: File, rawAudioDuration: number) {
  const wavesurfer = ref<any>(null);
  const isLoading = ref(true);
  const region = ref([0, rawAudioDuration]);
  // ... implementation
}
```

#### `useAudioEffects.ts`

Handles all audio effects including volume, speed, equalizer, and fade controls.

```typescript
export function useAudioEffects() {
  const volume = ref(100);
  const speed = ref(100);
  const fadeInEnabled = ref(false);
  const fadeOutEnabled = ref(false);
  // ... implementation
}
```

#### `useEnvelope.ts`

Manages the WaveSurfer EnvelopePlugin for smooth fade curves.

```typescript
export function useEnvelope() {
  const envelopePlugin = ref<any>(null);

  const updateEnvelopePoints = (wavesurfer, region, fadeIn, fadeOut) => {
    // Exponential fade curve calculations
    const fadeInCurve = Array.from({ length: 50 }, (_, i) => {
      const t = i / 49;
      return Math.exp(4 * t - 4); // Exponential curve
    });
  };
}
```

## 🎛️ Usage Guide

### Basic Audio Editing

1. **Upload Audio**: Click "Upload Audio File" and select your audio file
2. **Set Region**: Drag the blue handles on the waveform to select the region to keep
3. **Apply Effects**: Use the top toolbar to adjust volume, speed, or equalizer
4. **Add Fades**: Click the fade in/out buttons in the bottom controls
5. **Export**: Choose your format and click "Save" to download

### Keyboard Shortcuts

- `Space`: Play/Pause audio
- `←/→`: Seek backward/forward
- `Esc`: Reset all effects

### Advanced Features

#### Fade Curves

The editor uses exponential fade curves for natural-sounding fades:

```typescript
// Fade in curve (exponential growth)
const fadeInVolume = Math.exp(4 * progress - 4);

// Fade out curve (exponential decay)
const fadeOutVolume = Math.exp(-4 * progress);
```

#### BPM Detection

Uses advanced audio analysis to detect BPM and allow tempo changes:

```typescript
const musicInfo = await decodeAndSetMusicInfo(audioFile);
setSpeed(wavesurfer, (newBPM / originalBPM) * 100);
```

## 🛠️ Development

### Code Style

- **Vue 3 Composition API**: All components use `<script setup>` syntax
- **TypeScript**: Strict typing throughout the codebase
- **ESLint + Prettier**: Automated code formatting and linting
- **Composables Pattern**: Business logic separated into reusable composables

### Adding New Effects

1. Create a new composable in `src/composables/audio/`
2. Export effect controls and apply functions
3. Import and use in `AudioEditor.vue`
4. Add UI controls in the appropriate component

Example:

```typescript
// src/composables/audio/useReverb.ts
export function useReverb() {
  const reverbAmount = ref(0);

  const applyReverb = (audioContext, audioBuffer) => {
    // Reverb implementation
  };

  return { reverbAmount, applyReverb };
}
```

## 📦 Dependencies

### Core Dependencies

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Static type checking
- **WaveSurfer.js**: Audio visualization and manipulation
- **Vite**: Fast build tool and dev server

### Audio Processing

- **lamejs**: MP3 encoding in the browser
- **music-tempo**: BPM detection library

### UI/Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Add TypeScript types for all new code
- Write unit tests for new features
- Update documentation for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WaveSurfer.js](https://wavesurfer.xyz/) - Excellent audio visualization library
- [Vue.js](https://vuejs.org/) - The progressive JavaScript framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

---

**Made with ❤️ using Vue 3, TypeScript, and WaveSurfer.js**
