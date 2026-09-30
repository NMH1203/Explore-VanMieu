import { useState, useEffect, useCallback, useRef } from 'react'
import { useReward } from '../../../store/RewardContext.jsx'
import { MAP_LOCATIONS } from '../../../data/mapLocations.js'

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// CameraPage.jsx submits these coordinates to routes/checkins.py. The local
// distance and reward target are guidance only: the backend chooses the site
// from its database catalog and verifies its geofence before granting access.
export function useLiveLocation(selectedTargetId = null) {
  const { reward } = useReward()
  const nextTargetId = reward?.target_ids.find(id => !reward.completed_ids.includes(id))
  const [userCoords, setUserCoords] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('locating')
  const gpsStatusRef = useRef(gpsStatus)
  gpsStatusRef.current = gpsStatus
  const [gpsAccuracy, setGpsAccuracy] = useState(null)
  const [manualTarget, setTargetLocation] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const retryLocation = useCallback(() => setAttempt(value => value + 1), [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable')
      return
    }
    let active = true
    setGpsStatus('locating')
    setUserCoords(null)
    setGpsAccuracy(null)
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (!active) return
        setUserCoords({ lat: coords.latitude, lng: coords.longitude })
        setGpsAccuracy(Math.round(coords.accuracy))
        setGpsStatus('ready')
      },
      (error) => {
        if (!active) return
        console.warn('Unable to obtain GPS coordinates:', error.message)
        setUserCoords(null)
        setGpsAccuracy(null)
        setGpsStatus(error.code === 1 ? 'denied' : 'unavailable')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    )
    return () => {
      active = false
      navigator.geolocation.clearWatch(watchId)
    }
  }, [attempt])

  useEffect(() => {
    let active = true
    let permission
    const resume = () => {
      if (document.visibilityState === 'visible' && gpsStatusRef.current !== 'ready') retryLocation()
    }
    window.addEventListener('focus', resume)
    document.addEventListener('visibilitychange', resume)
    navigator.permissions?.query({ name: 'geolocation' }).then(result => {
      if (!active) return
      permission = result
      permission.addEventListener('change', retryLocation)
      if (permission.state === 'granted') retryLocation()
    }).catch(() => { /* Resume and manual retry also support older browsers. */ })
    return () => {
      active = false
      permission?.removeEventListener('change', retryLocation)
      window.removeEventListener('focus', resume)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [retryLocation])

  const distanceTo = (location) => userCoords
    ? calculateHaversineDistance(userCoords.lat, userCoords.lng, location.lat, location.lng)
    : null
  const nearest = userCoords
    ? MAP_LOCATIONS.reduce((best, location) => distanceTo(location) < distanceTo(best) ? location : best)
    : MAP_LOCATIONS[2]
  const targetLocation = manualTarget
    || MAP_LOCATIONS.find((location) => location.id === selectedTargetId)
    || MAP_LOCATIONS.find((location) => location.id === nextTargetId)
    || nearest
  const distanceMeters = distanceTo(targetLocation)

  return {
    userCoords,
    retryLocation,
    gpsStatus,
    gpsAccuracy,
    targetLocation,
    setTargetLocation,
    distanceMeters,
    isNearEnough: gpsStatus === 'ready' && distanceMeters !== null && distanceMeters <= 30,
  }
}
