import { useState, useEffect, useCallback } from 'react'
import { MAP_LOCATIONS } from '../../map/mapData.js'

// Công thức Haversine tính khoảng cách giữa 2 tọa độ (đơn vị: mét)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Bán kính Trái Đất (mét)
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
  const [gpsStatus, setGpsStatus] = useState('locating') // 'locating' | 'ready' | 'denied' | 'fallback'
  const [gpsAccuracy, setGpsAccuracy] = useState(8) // mét

  // Mặc định địa điểm mục tiêu là Khuê Văn Các hoặc địa điểm được chọn
  const defaultTarget = MAP_LOCATIONS.find((l) => l.id === (selectedTargetId || 'interpret')) || MAP_LOCATIONS[2]
  const [targetLocation, setTargetLocation] = useState(defaultTarget)
  const [distanceMeters, setDistanceMeters] = useState(12) // mặc định mô phỏng hợp lý nếu chưa có GPS

  const updateNearestLocation = useCallback((lat, lng) => {
    let minDistance = Infinity
    let nearest = defaultTarget

    MAP_LOCATIONS.forEach((loc) => {
      const dist = calculateHaversineDistance(lat, lng, loc.lat, loc.lng)
      if (dist < minDistance) {
        minDistance = dist
        nearest = loc
      }
    })

    // Nếu người dùng không chọn cụ thể một điểm thì ưu tiên điểm gần nhất
    if (!selectedTargetId) {
      setTargetLocation(nearest)
      setDistanceMeters(minDistance)
    } else {
      const target = MAP_LOCATIONS.find((l) => l.id === selectedTargetId) || nearest
      setTargetLocation(target)
      setDistanceMeters(calculateHaversineDistance(lat, lng, target.lat, target.lng))
    }
  }, [selectedTargetId, defaultTarget])

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('fallback')
      return
    }

    // Lấy tọa độ GPS ban đầu
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setUserCoords({ lat: latitude, lng: longitude })
        setGpsAccuracy(Math.round(accuracy) || 8)
        setGpsStatus('ready')
        updateNearestLocation(latitude, longitude)
      },
      (error) => {
        console.warn('Lỗi lấy tọa độ GPS:', error.message)
        setGpsStatus('denied')
        // Dùng vị trí giả lập tại Sân Khuê Văn Các
        setDistanceMeters(12)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )

    // Theo dõi thay đổi vị trí liên tục (watchPosition)
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setUserCoords({ lat: latitude, lng: longitude })
        setGpsAccuracy(Math.round(accuracy) || 8)
        setGpsStatus('ready')
        updateNearestLocation(latitude, longitude)
      },
      (error) => {
        // im lặng xử lý nếu watch tạm thời mất sóng
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [updateNearestLocation])

  return {
    userCoords,
    gpsStatus,
    gpsAccuracy,
    targetLocation,
    setTargetLocation,
    distanceMeters,
    isNearEnough: distanceMeters <= 50, // Chuẩn bán kính check-in hợp lệ (<= 50 mét)
  }
}
