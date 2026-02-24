/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyA5wqQv7uKjqLrwKwjW3tTbgPThkpsHvA4',
  authDomain: 'kids-flashcard-hadits.firebaseapp.com',
  projectId: 'kids-flashcard-hadits',
  storageBucket: 'kids-flashcard-hadits.firebasestorage.app',
  messagingSenderId: '995269721344',
  appId: '1:995269721344:web:277ec6346138a8544847e5',
};

export const app = initializeApp(firebaseConfig);
