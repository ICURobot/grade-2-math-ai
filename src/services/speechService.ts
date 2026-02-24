/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SpeechService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private rate: number = 0.9;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = this.loadVoices;
    }
  }

  private loadVoices = () => {
    const voices = this.synth.getVoices();
    this.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
  };

  speak(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      onEnd?.();
      return;
    }

    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = this.rate; 
    utterance.pitch = 1.1; 
    
    utterance.onend = () => {
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  setRate(rate: number) {
    this.rate = rate;
  }

  getRate() {
    return this.rate;
  }

  cancel() {
    this.synth.cancel();
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.cancel();
  }

  getMute() {
    return this.isMuted;
  }
}

export const speechService = new SpeechService();
