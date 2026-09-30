import { useCallback, useEffect, useReducer } from 'react'
import { getProgress } from '../services/passport-service/index.js'
import { locationProgressReducer } from '../utils/locationProgress.js'

const EMPTY_IDS = new Set()

// App.jsx shares this state with map, catalog, detail, account, and passport.
// passport-service/index.js reads the persisted user_history via /api/progress;
// only successful check-in responses may add a stamp before the next reload.
export function useLocationProgress(userId) {
  const [state, dispatch] = useReducer(locationProgressReducer, { userId: null, ids: EMPTY_IDS })

  useEffect(() => {
    dispatch({ type: 'reset', userId })
    if (!userId) return
    let active = true
    const controller = new AbortController()
    getProgress({ signal: controller.signal }).then(progress => {
      if (active) dispatch({ type: 'loaded', userId, progress })
    }).catch(error => {
      // A failed initial read must not erase a concurrent successful check-in.
      if (active) console.error('Unable to load progress:', error)
    })
    return () => {
      active = false
      controller.abort()
    }
  }, [userId])

  const recordVerifiedCheckin = useCallback(result => {
    dispatch({ type: 'verified', userId, result })
  }, [userId])

  // Hide the previous account's stamps immediately, before effects run.
  return {
    unlockedLocations: state.userId === userId ? state.ids : EMPTY_IDS,
    recordVerifiedCheckin,
  }
}
