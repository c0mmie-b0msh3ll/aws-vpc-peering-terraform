import { cloneDeep } from 'lodash'
import {
  BadRequestErrorResponse,
  ConflictErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import BoardRepo from '~/repo/board.repo'
import CardRepo from '~/repo/card.repo'
import WorkspaceRepo from '~/repo/workspace.repo'
import { ObjectId } from 'mongodb'
import BoardRoleRepo from '~/repo/boardRole.repo'
import BoardMemberRepo from '~/repo/boardMember.repo'
import WorkspaceMemberRepo from '~/repo/workspaceMember.repo'
import { BOARD_MEMBER_STATUS } from '~/constant/enum/boardMember.enum'
import BoardPermissionRepo from '~/repo/boardPermission.repo'
import { BOARD_STATUS } from '~/constant/enum/board.enum'
import { mongoClientInstance } from '~/config/mongodb'
import ColumnRepo from '~/repo/column.repo'
import LabelRepo from '~/repo/label.repo'
import ActivityLogRepo from '~/repo/activityLog.repo'
import {
  invalidateBoardAccessCache,
  invalidateBoardAccessCachesByBoard
} from '~/helpers/boardPermission.cache'
import { getActiveSubscriptionCached } from '~/helpers/subscription.cache'
import BackgroundRepo from '~/repo/adminBackground.repo'
import { emitBoardUpdated } from '~/realtime/realtimeEmitters/boardRealtime.emitter'

const DEFAULT_BOARD_LABELS = [
  { title: '', color: 'green' },
  { title: '', color: 'yellow' },
  { title: '', color: 'orange' },
  { title: '', color: 'red' },
  { title: '', color: 'purple' },
  { title: '', color: 'blue' }
]

const generateBoardAdminRole = ({ boardId }) => {
  return {
    boardId: boardId.toString(),
    name: 'Admin',
    isDefault: true,
    key: 'board_admin',
    permissionCodes: [
      'board.view',
      'board.update',
      'board.delete',

      'board.member.invite',
      'board.member.remove',
      'board.member.changeRole',

      'board.role.create',
      'board.role.update',
      'board.role.delete',

      'board.label.create',
      'board.label.update',
      'board.label.delete',

      'board.column.create',
      'board.column.update',
      'board.column.archive',
      'board.column.restore',
      'board.column.delete',

      'board.card.create',
      'board.card.update',
      'board.card.delete',
      'board.card.move',
      'board.card.archive',
      'board.card.restore',
      'board.card.member.assign',
      'board.card.member.remove',

      'board.card.comment.create',
      'board.card.comment.delete',

      'board.card.attachment.create',
      'board.card.attachment.delete',
      'board.card.attachment.rename',
      'board.card.attachment.download',

      'board.card.task.create',
      'board.card.task.update',
      'board.card.task.delete'
    ]
  }
}

const generateBoardViewerRole = ({ boardId }) => {
  return {
    boardId: boardId.toString(),
    name: 'Viewer',
    isDefault: true,
    key: 'board_viewer',
    permissionCodes: ['board.view']
  }
}

const generateBoardLabel = ({ boardId, createdBy }) => {
  return DEFAULT_BOARD_LABELS.map((l) => ({ ...l, boardId, createdBy }))
}

class BoardService {
  static getBoardOverview = async ({ userContext, data }) => {
    const workspaces = await WorkspaceRepo.findMany({
      filter: { ownerId: userContext._id.toString() }
    })

    if (!workspaces || !workspaces.length) return []

    const workspaceIds = workspaces.map((w) => w._id.toString())

    const boards = await BoardRepo.findMany({
      filter: { workspaceId: { $in: workspaceIds } }
    })

    const result = workspaces.map((workspace) => {
      const workspaceId = workspace._id.toString()

      return {
        ...workspace,
        boards:
          boards?.filter((board) => board.workspaceId === workspaceId) || []
      }
    })

    return result
  }

  static fetchBoardByWorkspaceId = async ({ workspaceId, userContext }) => {
    const [boards, count] = await Promise.all([
      BoardRepo.findMany({
        filter: { workspaceId }
      }),
      BoardRepo.count({ filter: { workspaceId: new ObjectId(workspaceId) } })
    ])

    return { boards, count }
  }

  static getBoards = async ({ userContext, data }) => {
    const filters = {
      ...data,
      userId: userContext._id
    }

    const boards = await BoardRepo.getBoards({ filters })

    return boards
  }

  static getBackground = async ({ userContext }) => {
    return await BackgroundRepo.findMany({
      filter: { isDelete: false, status: 'active' },
      options: {}
    })
  }

  static getDetails = async ({ _id }) => {
    const [board, members, labels] = await Promise.all([
      BoardRepo.getDetail({ _id }),
      BoardMemberRepo.getMembers({
        filter: { boardId: _id },
        data: { search: '' }
      }),
      LabelRepo.findMany({ filter: { boardId: _id } })
    ])

    if (!board) throw new NotFoundErrorResponse('Board not found.')

    const resBoard = cloneDeep(board)

    resBoard.columns.forEach((column) => {
      column.cards = resBoard.cards.filter(
        (card) => String(card.columnId) === String(column._id)
      )
    })

    delete resBoard.cards

    return { board: resBoard, members, labels }
  }

  static create = async ({ workspaceAccess, userContext, data }) => {
    const createBoardData = { ...data, createdBy: userContext._id }

    let createdBoard = null

    const subscription = await getActiveSubscriptionCached({
      workspaceId: workspaceAccess.workspace._id
    })

    if (!subscription)
      throw new NotFoundErrorResponse(
        'Subscription not found for this workspace.'
      )

    const features = subscription.planFeatureSnapshot

    const countBoards = await BoardRepo.count({
      filter: { workspaceId: workspaceAccess.workspace._id.toString() }
    })

    if (countBoards >= features?.limits?.maxBoards)
      throw new ForbiddenErrorResponse(
        'Your current subscription plan does not allow creating more boards.'
      )

    const session = await mongoClientInstance.startSession()

    try {
      await session.withTransaction(async () => {
        createdBoard = await BoardRepo.createOne({
          data: createBoardData,
          session
        })

        const createdBoardRole = await BoardRoleRepo.createOne({
          data: generateBoardAdminRole({ boardId: createdBoard.insertedId }),
          session
        })

        await BoardRoleRepo.createOne({
          data: generateBoardViewerRole({ boardId: createdBoard.insertedId }),
          session
        })

        const workspaceMember = workspaceAccess?.workspaceMember

        const createdBoardMemberData = {
          boardId: createdBoard.insertedId.toString(),
          workspaceMemberId: workspaceMember._id.toString(),
          boardRoleId: createdBoardRole.insertedId.toString(),
          invitedBy: userContext._id.toString(),
          status: BOARD_MEMBER_STATUS[0],
          joinAt: new Date()
        }

        const createdMember = await BoardMemberRepo.createOne({
          data: createdBoardMemberData,
          session
        })

        const createLabelData = generateBoardLabel({
          boardId: createdBoard.insertedId.toString(),
          createdBy: createdMember.insertedId.toString()
        })

        await ActivityLogRepo.createOne({
          data: {
            boardId: createdBoard.insertedId.toString(),
            authorId: createdMember.insertedId.toString(),
            authorType: 'boardMember',
            entityType: 'board',
            entityId: createdBoard.insertedId.toString(),
            action: 'board.create',
            content: 'created this board'
          },
          session
        })

        await LabelRepo.createMany({ data: createLabelData, session })
      })

      const newBoard = await BoardRepo.findById({
        _id: createdBoard.insertedId
      })

      return newBoard
    } finally {
      await session.endSession()
    }
  }

  static update = async ({ _id, boardAccess, data }) => {
    const session = await mongoClientInstance.startSession()

    try {
      const updatedBoard = await session.withTransaction(async () => {
        const board = await BoardRepo.findOne({
          filter: { _id: new ObjectId(_id) },
          options: { session }
        })

        if (!board) throw new NotFoundErrorResponse('Board not found.')

        const updateData = { ...data, updatedAt: new Date() }

        const updatedBoard = await BoardRepo.updateOne({
          _id,
          data: updateData,
          session
        })

        const oldTitle = board.title || ''
        const newTitle = updatedBoard.title || ''

        const oldDescription = board.description || ''
        const newDescription = updatedBoard.description || ''

        const oldVisibility = board.visibility || ''
        const newVisibility = updatedBoard.visibility || ''

        const oldCover = board.cover?.value || ''
        const newCover = updatedBoard.cover?.value || ''

        if (oldTitle !== newTitle) {
          await ActivityLogRepo.createOne({
            data: {
              boardId: boardAccess.board._id.toString(),
              authorId: boardAccess.boardMember._id.toString(),
              authorType: 'boardMember',
              entityType: 'board',
              entityId: _id.toString(),
              action: 'board.update.title',
              content: `renamed this board (from ${oldTitle})`
            },
            session
          })
        }

        if (oldDescription !== newDescription) {
          await ActivityLogRepo.createOne({
            data: {
              boardId: boardAccess.board._id.toString(),
              authorId: boardAccess.boardMember._id.toString(),
              authorType: 'boardMember',
              entityType: 'board',
              entityId: _id.toString(),
              action: 'board.update.description',
              content: 'changed description of this board'
            },
            session
          })
        }

        if (oldCover !== newCover) {
          await ActivityLogRepo.createOne({
            data: {
              boardId: boardAccess.board._id.toString(),
              authorId: boardAccess.boardMember._id.toString(),
              authorType: 'boardMember',
              entityType: 'board',
              entityId: _id.toString(),
              action: 'board.update.cover',
              content: 'changed cover of this board'
            },
            session
          })
        }

        if (oldVisibility !== newVisibility) {
          await ActivityLogRepo.createOne({
            data: {
              boardId: boardAccess.board._id.toString(),
              authorId: boardAccess.boardMember._id.toString(),
              authorType: 'boardMember',
              entityType: 'board',
              entityId: _id.toString(),
              action: 'board.update.visibility',
              content: `changed visibility of this board (from ${oldVisibility})`
            },
            session
          })
        }

        return updatedBoard
      })

      emitBoardUpdated({ boardId: _id.toString(), board: updatedBoard })

      return updatedBoard
    } finally {
      await session.endSession()
    }
  }

  static moveCardToDifferentColumn = async ({ data }) => {
    const session = mongoClientInstance.startSession()

    try {
      await session.withTransaction(async () => {
        const updatePrevColumn = await ColumnRepo.updateById({
          _id: data.prevColumnId,
          data: { cardOrderIds: data.prevCardOrderIds, updatedAt: Date.now() },
          session
        })

        const updateNextColumn = await ColumnRepo.updateById({
          _id: data.nextColumnId,
          data: { cardOrderIds: data.nextCardOrderIds, updatedAt: Date.now() },
          session
        })

        const updatedCard = await CardRepo.updateOne({
          filter: { _id: new ObjectId(data.currentCardId) },
          data: { $set: { columnId: data.nextColumnId } },
          session
        })
      })
    } finally {
      await session.endSession()
    }
    return {}
  }

  static fetchBoardActivity = async ({ _id }) => {
    const boardActivity = await ActivityLogRepo.findMany({
      filter: { boardId: _id },
      options: { sort: { createdAt: -1 } }
    })

    return boardActivity
  }

  // ============================== ROLE & PERMISSION ==============================
  static fetchBoardPermission = async () => {
    const boardPermissions = await BoardPermissionRepo.findMany({})

    return boardPermissions
  }

  static fetchBoardRole = async ({ _id }) => {
    const boardRoles = await BoardRoleRepo.findMany({
      filter: { boardId: _id.toString() }
    })

    return boardRoles
  }

  static createRole = async ({ boardAccess, data }) => {
    const subscription = await getActiveSubscriptionCached({
      workspaceId: boardAccess.board.workspaceId
    })

    if (!subscription)
      throw new NotFoundErrorResponse(
        'Subscription not found for this workspace.'
      )

    const features = subscription.planFeatureSnapshot

    if (!features?.capabilities?.board?.customRole)
      throw new ForbiddenErrorResponse(
        'Your current subscription plan does not allow creating custom roles for boards.'
      )

    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const countRoles = await BoardRoleRepo.count({
          filter: {
            boardId: boardAccess.board._id.toString(),
            isDefault: false
          },
          session
        })

        if (countRoles >= features?.limits?.maxBoardRoles)
          throw new ForbiddenErrorResponse(
            `Your current subscription plan allows a maximum of ${features.limits.maxBoardRoles} custom roles.`
          )

        const createdRole = await BoardRoleRepo.createOne({ data, session })

        const role = await BoardRoleRepo.findOne({
          filter: { _id: new ObjectId(createdRole.insertedId) },
          options: { session }
        })

        if (!role) throw new NotFoundErrorResponse('Created role not found.')

        await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'boardRole',
            entityId: role._id.toString(),
            action: 'board.role.create',
            content: `created role "${role.name}" in this board"`
          },
          session
        })

        return role
      })
    } finally {
      await session.endSession()
    }
  }

  static updateRole = async ({ boardAccess, data }) => {
    const session = await mongoClientInstance.startSession()
    let updatedRoles = null
    try {
      updatedRoles = await session.withTransaction(async () => {
        if (!Array.isArray(data) || !data.length) {
          throw new BadRequestErrorResponse('Role update data is required.')
        }

        const roleIds = data.map((item) => item._id?.toString())

        const existedRoles = await BoardRoleRepo.findMany({
          filter: {
            _id: { $in: roleIds.map((id) => new ObjectId(id)) },
            boardId: boardAccess.board._id.toString()
          },
          options: { session }
        })

        if (existedRoles.length !== roleIds.length) {
          throw new NotFoundErrorResponse(
            'Some roles were not found in this board.'
          )
        }

        const oldRoleMap = new Map(
          existedRoles.map((role) => [role._id.toString(), role])
        )

        const updateResults = []

        for (const item of data) {
          const { _id, isDefault, ...rest } = item
          const oldRole = oldRoleMap.get(_id.toString())

          if (!oldRole) continue
          if (oldRole.isDefault) continue

          const updateData = {
            ...rest,
            updatedAt: new Date()
          }

          const hasChanged =
            JSON.stringify({
              name: oldRole.name || '',
              description: oldRole.description || '',
              permissionCodes: oldRole.permissionCodes || []
            }) !==
            JSON.stringify({
              name: updateData.name ?? oldRole.name ?? '',
              description: updateData.description ?? oldRole.description ?? '',
              permissionCodes:
                updateData.permissionCodes ?? oldRole.permissionCodes ?? []
            })

          if (!hasChanged) continue

          const updatedRole = await BoardRoleRepo.updateOne({
            filter: {
              _id: new ObjectId(_id),
              boardId: boardAccess.board._id.toString()
            },
            data: { $set: updateData },
            session
          })

          updateResults.push(updatedRole)

          const oldName = oldRole?.name || ''
          const newName = rest?.name || oldName

          await ActivityLogRepo.createOne({
            data: {
              boardId: boardAccess.board._id.toString(),
              authorId: boardAccess.boardMember._id.toString(),
              authorType: 'boardMember',
              entityType: 'boardRole',
              entityId: _id.toString(),
              action: 'board.role.update',
              content:
                oldName !== newName
                  ? `updated role "${oldName}" to "${newName}"`
                  : `updated role "${oldName || newName}"`
            },
            session
          })
        }

        return updateResults
      })
    } finally {
      await session.endSession()
    }

    if (updatedRoles?.length)
      await invalidateBoardAccessCachesByBoard({
        boardId: boardAccess.board._id.toString()
      })

    return updatedRoles
  }

  static deleteRole = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()

    try {
      await session.withTransaction(async () => {
        const role = await BoardRoleRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString()
          },
          options: { session }
        })

        if (!role) throw new NotFoundErrorResponse('Role not found.')

        if (role.isDefault)
          throw new ForbiddenErrorResponse('Default roles cannot be deleted.')

        const existedMembers = await BoardMemberRepo.findMany({
          filter: {
            boardId: boardAccess.board._id.toString(),
            boardRoleId: role._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (existedMembers.length > 0)
          throw new ConflictErrorResponse(
            'This role is being used by active members.'
          )

        const deletedRole = await BoardRoleRepo.deleteOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString()
          },
          session
        })

        if (deletedRole.deletedCount === 0)
          throw new ConflictErrorResponse(
            'Role does not exist or has already been deleted.'
          )

        await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'boardRole',
            entityId: role._id.toString(),
            action: 'board.role.delete',
            content: `deleted role "${role.name}"`
          },
          session
        })
      })
    } finally {
      await session.endSession()
    }

    await invalidateBoardAccessCachesByBoard({
      boardId: boardAccess.board._id.toString()
    })

    return {}
  }

  // ============================== MEMBER ==============================
  static fetchBoardMember = async ({ _id, data, userContext }) => {
    const boardMember = await BoardMemberRepo.getMembers({
      filter: { boardId: _id },
      data
    })

    return boardMember
  }

  static updateMemberRole = async ({ _id, boardAccess, data }) => {
    const session = await mongoClientInstance.startSession()
    let targetWorkspaceMemberId = null

    try {
      const updatedMember = await session.withTransaction(async () => {
        const memberId = new ObjectId(_id)
        const newRoleId = new ObjectId(data.roleId)

        const member = await BoardMemberRepo.findOne({
          filter: {
            _id: memberId,
            boardId: boardAccess.board._id.toString()
          },
          options: { session }
        })

        if (!member) throw new NotFoundErrorResponse('Member not found.')

        if (member.status !== 'active')
          throw new ConflictErrorResponse(
            'This action can only be performed on an active member.'
          )

        targetWorkspaceMemberId = member.workspaceMemberId.toString()

        const [newRole, currentRole] = await Promise.all([
          BoardRoleRepo.findOne({
            filter: {
              _id: newRoleId,
              boardId: boardAccess.board._id.toString()
            },
            options: { session }
          }),
          BoardRoleRepo.findOne({
            filter: {
              _id: new ObjectId(member.boardRoleId),
              boardId: boardAccess.board._id.toString()
            },
            options: { session }
          })
        ])

        if (!newRole) throw new NotFoundErrorResponse('New role not found.')

        if (member.boardRoleId.toString() === newRole._id.toString())
          throw new ConflictErrorResponse('Member already has this role.')

        const isCurrentAdmin = currentRole?.key === 'board_admin'
        const isNewRoleAdmin = newRole.key === 'board_admin'

        if (currentRole && isCurrentAdmin && !isNewRoleAdmin) {
          await ensureBoardHasAtLeastOneAdmin({
            member,
            adminRole: currentRole,
            session
          })
        }

        const updatedMember = await BoardMemberRepo.updateOne({
          filter: {
            _id: memberId,
            boardId: boardAccess.board._id.toString()
          },
          data: {
            $set: {
              boardRoleId: newRole._id.toString(),
              updatedAt: new Date()
            }
          },
          session
        })

        await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'board',
            entityId: boardAccess.board._id.toString(),
            action: 'board.member.changeRole',
            content: currentRole
              ? `changed a member's role from "${currentRole.name}" to "${newRole.name}"`
              : `changed a member's role to "${newRole.name}"`
          },
          session
        })

        return updatedMember
      })

      if (targetWorkspaceMemberId) {
        const workspaceMember = await WorkspaceMemberRepo.findOne({
          filter: { _id: new ObjectId(targetWorkspaceMemberId) }
        })

        if (workspaceMember?.userId)
          await invalidateBoardAccessCache({
            boardId: boardAccess.board._id.toString(),
            userId: workspaceMember.userId.toString()
          })
      }

      return updatedMember
    } finally {
      await session.endSession()
    }
  }

  static removeMember = async ({ _id, boardAccess }) => {
    return await this.updateBoardMemberStatus({
      _id,
      boardAccess,
      action: 'removed'
    })
  }

  static leaveBoard = async ({ _id, boardAccess }) => {
    return await this.updateBoardMemberStatus({
      _id,
      boardAccess,
      action: 'left'
    })
  }

  static updateBoardMemberStatus = async ({ _id, boardAccess, action }) => {
    const allowedActions = ['removed', 'left']

    if (!allowedActions.includes(action)) {
      throw new BadRequestErrorResponse('Invalid action.')
    }

    const session = await mongoClientInstance.startSession()
    let targetWorkspaceMemberId = null
    let targetBoardId = null

    try {
      const updatedMember = await session.withTransaction(async () => {
        const member = await BoardMemberRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString()
          },
          options: { session }
        })

        if (!member) {
          throw new NotFoundErrorResponse('Member not found.')
        }

        const actorBoardMember = boardAccess.boardMember
        const isSelfAction =
          member._id.toString() === actorBoardMember._id.toString()

        if (member.status !== 'active') {
          throw new ConflictErrorResponse(
            'This action can only be performed on an active member.'
          )
        }

        if (action === 'left' && !isSelfAction) {
          throw new ForbiddenErrorResponse(
            'You cannot leave this board for another member.'
          )
        }

        if (action === 'removed' && isSelfAction) {
          throw new ForbiddenErrorResponse(
            'You cannot remove yourself from this board.'
          )
        }

        const workspaceMember = await WorkspaceMemberRepo.findOne({
          filter: { _id: new ObjectId(member.workspaceMemberId) },
          options: { session }
        })

        if (!workspaceMember) {
          throw new NotFoundErrorResponse('Workspace member not found.')
        }

        const currentRole = await BoardRoleRepo.findOne({
          filter: {
            _id: new ObjectId(member.boardRoleId),
            boardId: boardAccess.board._id.toString()
          },
          options: { session }
        })

        if (!currentRole) {
          throw new NotFoundErrorResponse('Current role not found.')
        }

        if (currentRole.key === 'board_admin') {
          await ensureBoardHasAtLeastOneAdmin({
            member,
            adminRole: currentRole,
            session
          })
        }

        const updatedMember = await BoardMemberRepo.updateOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString()
          },
          data: {
            $set: {
              status: action,
              updatedAt: new Date()
            }
          },
          session
        })

        await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: actorBoardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'board',
            entityId: boardAccess.board._id.toString(),
            action:
              action === 'left' ? 'board.member.leave' : 'board.member.remove',
            content:
              action === 'left'
                ? `left board "${boardAccess.board.title}"`
                : `removed a member from board "${boardAccess.board.title}"`
          },
          session
        })

        targetWorkspaceMemberId = member.workspaceMemberId.toString()
        targetBoardId = member.boardId.toString()

        return updatedMember
      })

      if (targetWorkspaceMemberId && targetBoardId) {
        const workspaceMember = await WorkspaceMemberRepo.findOne({
          filter: { _id: new ObjectId(targetWorkspaceMemberId) }
        })

        if (workspaceMember?.userId) {
          await invalidateBoardAccessCache({
            boardId: targetBoardId,
            userId: workspaceMember.userId.toString()
          })
        }
      }

      return updatedMember
    } finally {
      await session.endSession()
    }
  }

  // static delete = async ({ _id, userContext }) => {
  //   const deleted = await BoardRepo.deleteOne({
  //     filter: { _id: new ObjectId(_id) }
  //   })

  //   if (deletedRole.deletedCount === 0)
  //     throw new ConflictErrorResponse(
  //       'Role does not exist or has already been deleted.'
  //     )

  //   return {}
  // }

  static updateStatus = async ({ _id, userContext, data }) => {
    const updateData = {
      status: BOARD_STATUS[1],
      updatedAt: Date.now()
    }

    const updatedBoard = await BoardRepo.updateOne({ _id, data: updateData })

    return updatedBoard
  }
}

const ensureBoardHasAtLeastOneAdmin = async ({ member, adminRole }) => {
  const totalAdmins = await BoardMemberRepo.countDocuments({
    filter: {
      boardId: member.boardId,
      boardRoleId: adminRole._id.toString(),
      status: 'active'
    }
  })

  if (totalAdmins <= 1)
    throw new ConflictErrorResponse('Board must have at least one admin.')
}

export default BoardService
