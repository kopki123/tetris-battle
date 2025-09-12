/* eslint-disable no-unused-vars */
import { shallowRef, watch } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { Howl, Howler } from 'howler';
import useLocalStorage from '@/utils/useLocalStorage';

import bgm from '@/assets/audio/bgm.mp3';
import drop from '@/assets/audio/drop.mp3';
import fail from '@/assets/audio/fail.mp3';
import remove_line from '@/assets/audio/remove_line.mp3';
import rotate from '@/assets/audio/rotate.mp3';

export enum Sound {
  DROP = 'DROP',
  FAIL = 'FAIL',
  REMOVE_LINE = 'REMOVE_LINE',
  ROTATE = 'ROTATE',
}

export const soundEffectMap: Record<Sound, Howl> = {
  [Sound.DROP]: new Howl({ src: drop }),
  [Sound.FAIL]: new Howl({ src: fail }),
  [Sound.REMOVE_LINE]: new Howl({ src: remove_line }),
  [Sound.ROTATE]: new Howl({ src: rotate }),
};

export const useSoundStore = defineStore('sound', () => {
  const currentBgm = shallowRef<Howl>(new Howl({ src: bgm, loop: true, html5: false }));
  const volume = useLocalStorage('volume', 0.3);

  watch(volume, (newValue) => {
    currentBgm.value?.volume(newValue);

    Object.values(soundEffectMap).forEach((sound) => {
      sound.volume(1);
    });
  }, { immediate: true });

  async function playSoundEffect (sound: Sound) {
    if (Howler.masterGain.context.state !== 'running') {
      return;
    }

    const soundEffect = soundEffectMap[sound];

    await new Promise((resolve) => {
      soundEffect.once('end', resolve);
      soundEffect.play();
    });
  }

  // 切換分頁、APP時淡入/淡出背景音樂
  document.addEventListener('visibilitychange', () => {
    const bgm = currentBgm.value;

    if (!bgm) {
      return;
    }

    const toVolume = document.visibilityState === 'visible' ? volume.value : 0;

    bgm.fade(bgm.volume(), toVolume, 1000 * 0.5);
  });

  return {
    volume,
    currentBgm,
    playSoundEffect,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSoundStore, import.meta.hot));
}