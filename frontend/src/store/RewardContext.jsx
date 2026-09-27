import { createContext, useContext } from 'react'
export const RewardContext = createContext({ reward: null, error: '', claim: async () => {} })
export const useReward = () => useContext(RewardContext)
