import { GET_DB } from '~/config/mongodb'
import { boardModel } from '~/models/board.model'
import { columnModel } from '~/models/column.model'
import { cardModel } from '~/models/card.model'
import { userModel } from '~/models/user.model'
import { boardMemberModel } from '~/models/boardMember.model'
import { activityLogModel } from '~/models/activityLog.model'

/**
 * Tạo tất cả các indexes cho MongoDB collections
 * Gọi function này sau khi kết nối thành công tới MongoDB
 */
export const INIT_INDEXES = async () => {
  try {
    console.log('Creating database indexes...')

    const db = GET_DB()

    // ========== BOARDS COLLECTION ==========
    await db
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .createIndex({ workspaceId: 1 }, { name: 'idx_boards_workspaceId' })
    console.log('✓ Created index: boards.workspaceId')

    // ========== COLUMNS COLLECTION ==========
    // Index cần thiết cho getDetail query (lookup columns by boardId)
    await db
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .createIndex(
        { boardId: 1, status: 1 },
        { name: 'idx_columns_boardId_status' }
      )
    console.log('✓ Created composite index: columns.boardId + columns.status')

    // ========== CARDS COLLECTION ==========
    // Index cần thiết cho getDetail query (lookup cards by boardId)
    await db
      .collection(cardModel.CARD_COLLECTION_NAME)
      .createIndex(
        { boardId: 1, status: 1 },
        { name: 'idx_cards_boardId_status' }
      )
    console.log('✓ Created composite index: cards.boardId + cards.status')

    // ========== USERS COLLECTION ==========
    await db
      .collection(userModel.USER_COLLECTION_NAME)
      .createIndex({ email: 1 }, { name: 'idx_users_email', unique: true })
    console.log('✓ Created unique index: users.email')

    // ========== BOARD_MEMBERS COLLECTION ==========
    await db
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .createIndex({ boardId: 1 }, { name: 'idx_boardMembers_boardId' })
    console.log('✓ Created index: boardMembers.boardId')

    await db
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .createIndex(
        { workspaceMemberId: 1 },
        { name: 'idx_boardMembers_workspaceMemberId' }
      )
    console.log('✓ Created index: boardMembers.workspaceMemberId')

    // ========== ACTIVITY_LOGS COLLECTION ==========
    // Index cho activity logs vì thường filter theo boardId
    await db
      .collection(activityLogModel.ACTIVITY_LOG_COLLECTION_NAME)
      .createIndex(
        { boardId: 1, createdAt: -1 },
        { name: 'idx_activityLogs_boardId_createdAt' }
      )
    console.log(
      '✓ Created composite index: activityLogs.boardId + activityLogs.createdAt'
    )

    await db
      .collection(activityLogModel.ACTIVITY_LOG_COLLECTION_NAME)
      .createIndex(
        { entityType: 1, entityId: 1, createdAt: -1 },
        { name: 'idx_activityLogs_entityType_entityId_createdAt' }
      )
    console.log(
      '✓ Created composite index: activityLogs.entityType + activityLogs.entityId + activityLogs.createdAt'
    )
  } catch (error) {
    // Nếu indexes đã tồn tại, MongoDB sẽ không throw error
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Indexes already exist, skipping creation')
    } else {
      console.error('❌ Error creating indexes:', error.message)
      throw error
    }
  }
}
