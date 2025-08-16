"use client";
import { useEffect } from 'react';
import { navigationLoader } from './navigationLoader';

export function NavigationEndBeacon() {
  useEffect(() => {
    // Reset loader-ul imediat când componenta se montează
    // Nu mai folosim setTimeout pentru a evita întârzierile
    navigationLoader.end();
  }, []);
  return null;
}


