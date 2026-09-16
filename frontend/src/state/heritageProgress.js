import { useSyncExternalStore } from 'react'

const storageKey = 'explore-van-mieu-unlocked-locations'
const initialLocations = ['interpret']
const listeners = new Set()

function readUnlockedLocations() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
    return new Set([...initialLocations, ...(Array.isArray(saved) ? saved : [])])
  } catch {
    return new Set(initialLocations)
  }
}

let unlockedLocations = readUnlockedLocations()

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return unlockedLocations
}

export function useUnlockedLocations() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function unlockLocation(id) {
  if (unlockedLocations.has(id)) return

  unlockedLocations = new Set([...unlockedLocations, id])
  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...unlockedLocations]))
  } catch {
    // The current session still updates when browser storage is unavailable.
  }
  listeners.forEach((listener) => listener())
}
