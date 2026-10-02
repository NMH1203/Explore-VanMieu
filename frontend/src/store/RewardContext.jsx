import { createContext, useContext } from 'react'

// React Context for sharing user reward state, error message, and the claimReward action
export const RewardContext = createContext({ reward: null, error: '', claim: async () => {} })

// Custom hook to consume reward context easily across components
export const useReward = () => useContext(RewardContext)

