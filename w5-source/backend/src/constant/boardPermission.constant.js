export const BOARD_PERMISSIONS = {
  VIEW: 'board.view', // done
  UPDATE: 'board.update', // done
  DELETE: 'board.delete',

  MEMBER_INVITE: 'board.member.invite', // done
  MEMBER_REMOVE: 'board.member.remove', // done
  MEMBER_CHANGE_ROLE: 'board.member.changeRole', //done

  ROLE_CREATE: 'board.role.create', // done
  ROLE_UPDATE: 'board.role.update', // done
  ROLE_DELETE: 'board.role.delete', // done

  LABEL_CREATE: 'board.label.create', // done
  LABEL_UPDATE: 'board.label.update', // done
  LABEL_DELETE: 'board.label.delete', // done

  COLUMN_CREATE: 'board.column.create', // done
  COLUMN_UPDATE: 'board.column.update', // done
  COLUMN_ARCHIVE: 'board.column.archive', // done
  COLUMN_RESTORE: 'board.column.restore', //
  COLUMN_DELETE: 'board.column.delete', //

  CARD_CREATE: 'board.card.create', // done
  CARD_UPDATE: 'board.card.update', // done
  CARD_DELETE: 'board.card.delete', // done
  CARD_MOVE: 'board.card.move', // done //move to different column
  CARD_ARCHIVE: 'board.card.archive', // done
  CARD_RESTORE: 'board.card.restore', // done
  CARD_MEMBER_ASSIGN: 'board.card.member.assign', // done
  CARD_MEMBER_REMOVE: 'board.card.member.remove', // done

  CARD_COMMENT_CREATE: 'board.card.comment.create', // done
  CARD_COMMENT_DELETE: 'board.card.comment.delete', // done

  CARD_ATTACHMENT_CREATE: 'board.card.attachment.create', // done
  CARD_ATTACHMENT_DELETE: 'board.card.attachment.delete', // done
  CARD_ATTACHMENT_RENAME: 'board.card.attachment.rename', // done
  CARD_ATTACHMENT_DOWNLOAD: 'board.card.attachment.download', // done

  CARD_TASK_CREATE: 'board.card.task.create', // done
  CARD_TASK_UPDATE: 'board.card.task.update', // done
  CARD_TASK_DELETE: 'board.card.task.delete' // done
}
