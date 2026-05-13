import { ObjectId } from 'mongodb'
import {
  BadRequestErrorResponse,
  ConflictErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import SubscriptionRepo from '~/repo/subscription.repo'
import WorkspaceRepo from '~/repo/workspace.repo'
import WorkspaceMemberRepo from '~/repo/workspaceMember.repo'
import WorkspacePermissionRepo from '~/repo/workspacePermission.repo'
import WorkspaceRoleRepo from '~/repo/workspaceRole.repo'
import { mongoClientInstance } from '~/config/mongodb'
import { GET_DB } from '~/config/mongodb'
import BoardRepo from '~/repo/board.repo'
import { getActiveSubscriptionCached } from '~/helpers/subscription.cache'
import EfsExportProvider from '~/providers/EfsExportProvider'
import { activityLogModel } from '~/models/activityLog.model'
import { attachmentModel } from '~/models/cardAttachment.model'
import { boardLabelModel } from '~/models/boardLabel.model'
import { boardMemberModel } from '~/models/boardMember.model'
import { boardModel } from '~/models/board.model'
import { cardCommentModel } from '~/models/cardComment.model'
import { cardModel } from '~/models/card.model'
import { columnModel } from '~/models/column.model'
import { subscriptionModel } from '~/models/subscription.model'
import { taskModel } from '~/models/task.model'
import { workspaceMemberModel } from '~/models/workspaceMember.model'
import { workspaceRoleModel } from '~/models/workspaceRole.model'

const generateWorkspaceAdminRole = ({ workspaceId }) => {
  return {
    workspaceId: workspaceId.toString(),
    name: 'Admin',
    isDefault: true,
    key: 'workspace_admin',
    permissionCodes: [
      'workspace.view',
      'workspace.update',
      'workspace.delete',
      'workspace.member.invite',
      'workspace.member.remove',
      'workspace.member.changeRole',
      'workspace.role.create',
      'workspace.role.update',
      'workspace.role.delete',
      'workspace.board.create',
      'workspace.board.delete'
    ]
  }
}

const generateWorkspaceViewerRole = ({ workspaceId }) => {
  return {
    workspaceId: workspaceId.toString(),
    name: 'Viewer',
    isDefault: true,
    key: 'workspace_viewer',
    permissionCodes: ['workspace.view']
  }
}

class WorkspaceService {
  static fetchByUser = async ({ userContext }) => {
    const workspaces = await WorkspaceRepo.fetchByUser({
      userId: userContext._id
    })

    if (!workspaces || !workspaces.length) return []

    return workspaces
  }

  static fetchWorkspaceInfo = async ({ _id, userContext }) => {
    const workspace = await WorkspaceRepo.findOne({
      filter: { _id: new ObjectId(_id) }
    })

    if (!workspace) throw new NotFoundErrorResponse('Workspace not found.')

    return workspace
  }

  static fetchWorkspaceMember = async ({ _id, data, userContext }) => {
    const workspaceMember = await WorkspaceMemberRepo.getMembers({
      filter: { workspaceId: _id },
      data
    })

    return workspaceMember
  }

  static fetchWorkspaceRole = async ({ _id, userContext }) => {
    const workspaceRoles = await WorkspaceRoleRepo.findMany({
      filter: { workspaceId: _id.toString() }
    })

    return workspaceRoles
  }

  static fetchWorkspacePermission = async () => {
    const workspacePermissions = await WorkspacePermissionRepo.findMany({})

    return workspacePermissions
  }

  static createExport = async ({ workspaceAccess, userContext }) => {
    const workspaceId = workspaceAccess.workspace._id.toString()
    const db = GET_DB()

    const workspace = await WorkspaceRepo.findOne({
      filter: { _id: new ObjectId(workspaceId) }
    })

    if (!workspace) throw new NotFoundErrorResponse('Workspace not found.')

    const boards = await db
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .find({ workspaceId })
      .toArray()

    const boardIds = boards.map((board) => board._id.toString())

    let columns = []
    let cards = []
    let boardMembers = []
    let boardLabels = []
    let activityLogs = []

    if (boardIds.length) {
      const boardExportData = await Promise.all([
        db
          .collection(columnModel.COLUMN_COLLECTION_NAME)
          .find({ boardId: { $in: boardIds } })
          .toArray(),
        db
          .collection(cardModel.CARD_COLLECTION_NAME)
          .find({ boardId: { $in: boardIds } })
          .toArray(),
        db
          .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
          .find({ boardId: { $in: boardIds } })
          .toArray(),
        db
          .collection(boardLabelModel.BOARD_LABEL_COLLECTION_NAME)
          .find({ boardId: { $in: boardIds } })
          .toArray(),
        db
          .collection(activityLogModel.ACTIVITY_LOG_COLLECTION_NAME)
          .find({ boardId: { $in: boardIds } })
          .toArray()
      ])

      columns = boardExportData[0]
      cards = boardExportData[1]
      boardMembers = boardExportData[2]
      boardLabels = boardExportData[3]
      activityLogs = boardExportData[4]
    }

    const cardIds = cards.map((card) => card._id.toString())

    let tasks = []
    let comments = []
    let attachments = []

    if (cardIds.length) {
      const cardExportData = await Promise.all([
        db
          .collection(taskModel.TASK_COLLECTION_NAME)
          .find({ cardId: { $in: cardIds } })
          .toArray(),
        db
          .collection(cardCommentModel.CARD_COMMENT_COLLECTION_NAME)
          .find({ cardId: { $in: cardIds } })
          .toArray(),
        db
          .collection(attachmentModel.CARD_ATTACHMENT_NAME)
          .find({ cardId: { $in: cardIds } })
          .toArray()
      ])

      tasks = cardExportData[0]
      comments = cardExportData[1]
      attachments = cardExportData[2]
    }

    const [workspaceMembers, workspaceRoles, subscriptions] = await Promise.all([
      db
        .collection(workspaceMemberModel.WORKSPACE_MEMBER_COLLECTION_NAME)
        .find({ workspaceId })
        .toArray(),
      db
        .collection(workspaceRoleModel.WORKSPACE_ROLE_COLLECTION_NAME)
        .find({ workspaceId })
        .toArray(),
      db
        .collection(subscriptionModel.SUBSCRIPTION_COLLECTION_NAME)
        .find({ workspaceId })
        .toArray()
    ])

    const metadata = await EfsExportProvider.createWorkspaceExport({
      workspaceId,
      payload: {
        exportedAt: new Date().toISOString(),
        exportedBy: userContext._id.toString(),
        workspace,
        workspaceMembers,
        workspaceRoles,
        subscriptions,
        boards,
        boardMembers,
        boardLabels,
        columns,
        cards,
        tasks,
        comments,
        attachments,
        activityLogs
      }
    })

    return {
      exportId: metadata.exportId,
      fileName: metadata.fileName,
      size: metadata.size,
      createdAt: metadata.createdAt,
      downloadPath: `/v1/workspaces/${workspaceId}/exports/${metadata.exportId}/download`
    }
  }

  static getExport = async ({ workspaceAccess, exportId }) => {
    return await EfsExportProvider.getWorkspaceExport({
      workspaceId: workspaceAccess.workspace._id.toString(),
      exportId
    })
  }

  static create = async ({ userContext, data, session = null }) => {
    let createdWorkspaceId = null
    const execute = async (session) => {
      const createWorkspaceData = {
        createdBy: userContext._id.toString(),
        ...data
      }

      const createdWorkspace = await WorkspaceRepo.createOne({
        data: createWorkspaceData,
        session
      })

      createdWorkspaceId = createdWorkspace.insertedId

      const createdWorkspaceAdminRole = await WorkspaceRoleRepo.createOne({
        data: generateWorkspaceAdminRole({
          workspaceId: createdWorkspace.insertedId
        }),
        session
      })

      await WorkspaceRoleRepo.createOne({
        data: generateWorkspaceViewerRole({
          workspaceId: createdWorkspace.insertedId
        }),
        session
      })

      const createMemberData = {
        workspaceId: createdWorkspace.insertedId.toString(),
        workspaceRoleId: createdWorkspaceAdminRole.insertedId.toString(),
        invitedBy: null,
        userId: userContext._id.toString(),
        joinAt: Date.now()
      }

      await WorkspaceMemberRepo.createOne({
        data: createMemberData,
        session
      })

      await SubscriptionRepo.createOne({
        data: {
          workspaceId: createdWorkspace.insertedId.toString(),
          planId: createdWorkspace.insertedId.toString(),
          planFeatureSnapshot: {
            capabilities: {
              workspace: {
                customRole: false
              },
              board: {
                customRole: false
              },
              column: {
                customColor: false
              },
              task: {
                setDue: false,
                assignMembers: false
              }
            },
            limits: {
              maxMembers: 5,
              maxBoards: 3,
              maxWorkspaceRoles: 0,
              maxBoardRoles: 0,
              maxColumnsPerBoard: 20,
              maxCardsPerBoard: 100,
              maxCommentsPerCard: 50,
              maxChecklistItemsPerCard: 20,
              maxStorageMb: 512,
              maxFileSizeMb: 5,
              maxFilesPerUpload: 5
            }
          },
          status: 'active',
          startedAt: Date.now()
        },
        session
      })
    }

    if (session) {
      await execute(session)
    } else {
      const newSession = await mongoClientInstance.startSession()
      try {
        await newSession.withTransaction(() => execute(newSession))
      } finally {
        await newSession.endSession()
      }
    }

    return await WorkspaceRepo.findOne({
      filter: { _id: new ObjectId(createdWorkspaceId) }
    })
  }

  static update = async ({ _id, userContext, data }) => {
    const workspaceId = new ObjectId(_id)

    const updatedWorkspace = await WorkspaceRepo.updateOne({
      filter: { _id: workspaceId },
      data: { $set: { ...data } }
    })

    if (updatedWorkspace.matchedCount === 0)
      throw new NotFoundErrorResponse('Workspace not found')

    return await WorkspaceRepo.findOne({
      filter: { _id: workspaceId }
    })
  }

  static delete = async ({ _id, userContext }) => {
    const session = await mongoClientInstance.startSession()
    await session.withTransaction(async () => {
      const deletedWorkspace = await WorkspaceRepo.deleteOne({
        filter: { _id: new ObjectId(_id) },
        session
      })

      if (deletedWorkspace.deletedCount === 0) throw new NotFoundErrorResponse()

      await WorkspaceRoleRepo.deleteMany({
        filter: { workspaceId: _id },
        session
      })
      await WorkspaceMemberRepo.deleteMany({
        filter: { workspaceId: _id },
        session
      })

      await BoardRepo.updateMany({
        filter: { workspaceId: _id },
        data: { $set: { status: 'archived' } },
        session
      })

      throw new NotFoundErrorResponse('he')
    })

    return
  }

  static createRole = async ({ workspaceAccess, data }) => {
    const subscription = await getActiveSubscriptionCached({
      workspaceId: workspaceAccess.workspace._id
    })

    if (!subscription)
      throw new NotFoundErrorResponse(
        'Subscription not found for this workspace.'
      )

    const features = subscription.planFeatureSnapshot

    if (!features?.capabilities?.workspace?.customRole)
      throw new ForbiddenErrorResponse(
        'Your current subscription plan does not allow creating custom roles.'
      )

    const countRoles = await WorkspaceRoleRepo.count({
      filter: {
        workspaceId: workspaceAccess.workspace._id.toString(),
        isDefault: false
      }
    })

    if (countRoles >= features?.limits?.maxWorkspaceRoles)
      throw new ForbiddenErrorResponse(
        `Your current subscription plan allows a maximum of ${features.limits.maxWorkspaceRoles} custom roles.`
      )

    const createdRole = await WorkspaceRoleRepo.createOne({ data })

    const role = await WorkspaceRoleRepo.findOne({
      filter: { _id: new ObjectId(createdRole.insertedId) }
    })

    return role
  }

  static updateRole = async ({ userContext, data }) => {
    const updatePromises = data.map((role) => {
      const { _id, ...rest } = role

      return WorkspaceRoleRepo.updateOne({
        filter: { _id: new ObjectId(_id) },
        data: { $set: { ...rest } }
      })
    })

    return await Promise.all(updatePromises)
  }

  static deleteRole = async ({ _id, userContext }) => {
    const deletedRole = await WorkspaceRoleRepo.deleteOne({
      filter: { _id: new ObjectId(_id) }
    })

    if (deletedRole.deletedCount === 0)
      throw new ConflictErrorResponse(
        'Role does not exist or has already been deleted.'
      )

    return {}
  }

  static updateMemberRole = async ({ _id, userContext, data }) => {
    const memberId = new ObjectId(_id)
    const newRoleId = new ObjectId(data.roleId)

    const member = await WorkspaceMemberRepo.findOne({
      filter: { _id: memberId }
    })

    if (!member) throw new NotFoundErrorResponse('Member not found.')

    if (member.status !== 'active')
      throw new ConflictErrorResponse(
        'This action can only be performed on an active member.'
      )

    const [newRole, currentRole] = await Promise.all([
      WorkspaceRoleRepo.findOne({
        filter: { _id: newRoleId, workspaceId: member.workspaceId }
      }),
      WorkspaceRoleRepo.findOne({
        filter: { _id: new ObjectId(member.workspaceRoleId) }
      })
    ])

    if (!newRole) throw new NotFoundErrorResponse('New role not found.')
    if (!currentRole) throw new NotFoundErrorResponse('Current role not found.')

    const isCurrentAdmin = currentRole?.key === 'workspace_admin'
    const isNewRoleAdmin = newRole?.key === 'workspace_admin'

    if (isCurrentAdmin && !isNewRoleAdmin)
      await ensureWorkspaceHasAtLeastOneAdmin({
        member,
        adminRole: currentRole
      })

    const updatedMember = await WorkspaceMemberRepo.updateOne({
      filter: { _id: memberId },
      data: { $set: { workspaceRoleId: newRole._id.toString() } }
    })

    return updatedMember
  }

  static removeMember = async ({ _id, userContext }) => {
    return await this.updateWorkspaceMemberStatus({
      _id,
      userContext,
      action: 'removed'
    })
  }

  static leaveWorkspace = async ({ _id, userContext }) => {
    return await this.updateWorkspaceMemberStatus({
      _id,
      userContext,
      action: 'left'
    })
  }

  static updateWorkspaceMemberStatus = async ({ _id, userContext, action }) => {
    const allowedActions = ['removed', 'left']

    if (!allowedActions.includes(action))
      throw new BadRequestErrorResponse('Invalid action.')

    const member = await WorkspaceMemberRepo.findOne({
      filter: { _id: new ObjectId(_id) }
    })

    if (!member) throw new NotFoundErrorResponse('Member not found.')

    if (member.status !== 'active')
      throw new ConflictErrorResponse(
        'This action can only be performed on an active member.'
      )

    if (
      action === 'left' &&
      member.userId.toString() !== userContext._id.toString()
    ) {
      throw new ForbiddenErrorResponse(
        'You cannot leave this workspace for another member.'
      )
    }

    const currentRole = await WorkspaceRoleRepo.findOne({
      filter: { _id: new ObjectId(member.workspaceRoleId) }
    })

    if (!currentRole) throw new NotFoundErrorResponse('Current role not found.')

    if (currentRole?.key === 'workspace_admin')
      await ensureWorkspaceHasAtLeastOneAdmin({
        member,
        adminRole: currentRole
      })

    const updatedMember = await WorkspaceMemberRepo.updateOne({
      filter: { _id: new ObjectId(_id) },
      data: { $set: { status: action } }
    })

    return updatedMember
  }
}

const ensureWorkspaceHasAtLeastOneAdmin = async ({ member, adminRole }) => {
  const totalAdmins = await WorkspaceMemberRepo.count({
    filter: {
      workspaceId: member.workspaceId,
      workspaceRoleId: adminRole._id.toString(),
      status: 'active'
    }
  })

  if (totalAdmins <= 1)
    throw new ConflictErrorResponse('Workspace must have at least one admin.')
}

export default WorkspaceService
