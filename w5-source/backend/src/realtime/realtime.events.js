const REALTIME_EVENTS = {
  BOARD_UPDATED: 'board:updated',

  COLUMN_CREATED: 'column:created',
  COLUMN_UPDATED: 'column:updated',
  COLUMN_ARCHIVED: 'column:archived',
  COLUMN_RESTORED: 'column:restored',
  COLUMN_REORDERED: 'column:reordered',

  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_DELETED: 'card:deleted',
  CARD_ARCHIVED: 'card:archived',
  CARD_RESTORED: 'card:restored',
  CARD_MOVED: 'card:moved',

  COMMENT_CREATED: 'comment:created',
  COMMENT_DELETED: 'comment:deleted',

  ATTACHMENT_CREATED: 'attachment:created',
  ATTACHMENT_UPDATED: 'attachment:updated',
  ATTACHMENT_DELETED: 'attachment:deleted',

  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted'
}

export { REALTIME_EVENTS }
