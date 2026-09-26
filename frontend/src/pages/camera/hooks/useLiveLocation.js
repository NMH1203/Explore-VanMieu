import { useState, useEffect } from 'react'
import { MAP_LOCATIONS } from '../../map/mapData.js'

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

export function useLiveLocation(selectedTargetId = null) {
  const [userCoords, setUserCoords] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('locating')
  const [gpsAccuracy, setGpsAccuracy] = useState(null)
  const [manualTarget, setTargetLocation] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable')
      return
    }
    let active = true
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
  }, [])

  const distanceTo = (location) => userCoords
    ? calculateHaversineDistance(userCoords.lat, userCoords.lng, location.lat, location.lng)
    : null
  const nearest = userCoords
    ? MAP_LOCATIONS.reduce((best, location) => distanceTo(location) < distanceTo(best) ? location : best)
    : MAP_LOCATIONS[2]
  const targetLocation = manualTarget
    || MAP_LOCATIONS.find((location) => location.id === selectedTargetId)
    || nearest
  const distanceMeters = distanceTo(targetLocation)

  return {
    userCoords,
    gpsStatus,
    gpsAccuracy,
    targetLocation,
    setTargetLocation,
    distanceMeters,
    isNearEnough: gpsStatus === 'ready' && distanceMeters !== null && distanceMeters <= 30,
  }
}
