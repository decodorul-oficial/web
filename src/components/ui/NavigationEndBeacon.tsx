"use client";
import { useEffect } from 'react';
import { navigationLoader } from './navigationLoader';

export function NavigationEndBeacon() {
  useEffect(() => {
    navigationLoader.end();
  }, []);
  return null;
}


