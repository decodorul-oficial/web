"use client";

type Listener = (visible: boolean) => void;

class NavigationLoaderStore {
  private pendingCount = 0;
  private listeners: Set<Listener> = new Set();
  private safetyTimer: any = null;
  private lastStartAt = 0;

  private notify() {
    const visible = this.pendingCount > 0;
    this.listeners.forEach((l) => l(visible));
  }

  start() {
    const now = Date.now();
    if (now - this.lastStartAt < 100) {
      // Reduc deduplicarea de la 500ms la 100ms pentru o experiență mai fluidă
      return;
    }
    this.lastStartAt = now;
    this.pendingCount += 1;
    this.notify();
    this.armSafetyTimer();
  }

  end() {
    this.pendingCount = Math.max(0, this.pendingCount - 1);
    if (this.pendingCount === 0) {
      this.disarmSafetyTimer();
    }
    this.notify();
  }

  reset() {
    this.pendingCount = 0;
    this.lastStartAt = 0;
    this.disarmSafetyTimer();
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private armSafetyTimer() {
    this.disarmSafetyTimer();
    this.safetyTimer = setTimeout(() => {
      // Reduc timer-ul de siguranță de la 8 secunde la 3 secunde
      this.reset();
    }, 3000);
  }

  private disarmSafetyTimer() {
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
  }
}

export const navigationLoader = new NavigationLoaderStore();


