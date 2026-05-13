import { env } from '~/config/environment'
// Những domain được phép truy cập tới tài nguyên của Server

const CONFIGURED_CORS_DOMAINS = (env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((domain) => domain.trim())
  .filter(Boolean)

export const WHITELIST_DOMAINS = [
  'http://localhost:5173',
  env.WEBSITE_DOMAIN_DEVELOPMENT,
  env.WEBSITE_DOMAIN_PRODUCTION,
  ...CONFIGURED_CORS_DOMAINS
].filter(Boolean)

export const visibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  WORKSPACE: 'workspace'
}

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === 'production'
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}
