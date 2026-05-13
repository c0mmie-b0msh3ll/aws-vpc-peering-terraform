import { setCache, getCache, deleteCache } from './cache'
import SubscriptionRepo from '~/repo/subscription.repo'

const SUBSCRIPTION_CACHE_TTL = 120

export const getActiveSubscriptionCached = async ({ workspaceId }) => {
  // const cacheKey = `subscription_active:${workspaceId}`

  // const cachedData = await getCache({ key: cacheKey })
  // if (cachedData)
  //   return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData

  const subscription = await SubscriptionRepo.findOne({
    filter: { workspaceId: workspaceId.toString(), status: 'active' }
  })

  if (!subscription) return null

  // await setCache({
  //   key: cacheKey,
  //   value: subscription,
  //   ttlInSeconds: SUBSCRIPTION_CACHE_TTL
  // })

  return subscription
}

export const deleteActiveSubscriptionCache = async ({ workspaceId }) => {
  const cacheKey = `subscription_active:${workspaceId.toString()}`
  await deleteCache({ key: cacheKey })
}
