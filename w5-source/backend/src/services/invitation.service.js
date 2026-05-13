import UserRepo from '~/repo/user.repo'
import BoardRepo from '~/repo/board.repo'
import InvitationRepo from '~/repo/invitation.repo'
import WorkspaceMemberRepo from '~/repo/workspaceMember.repo'
import WorkspaceRepo from '~/repo/workspace.repo'
import WorkspaceRoleRepo from '~/repo/workspaceRole.repo'
import { mongoClientInstance } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import {
  BadRequestErrorResponse,
  ConflictErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import BoardRoleRepo from '~/repo/boardRole.repo'
import BoardMemberRepo from '~/repo/boardMember.repo'
import ActivityLogRepo from '~/repo/activityLog.repo'
import { getActiveSubscriptionCached } from '~/helpers/subscription.cache'

class InvitationService {
  static getInvitations = async ({ userContext }) => {
    const invitations = await InvitationRepo.findByUser({
      userId: userContext._id
    })

    return invitations
  }

  static createWorkspaceInvitation = async ({ userContext, data }) => {
    const inviteeIds = [
      ...new Set((data.userIds || []).map((i) => i.toString()))
    ]

    if (!inviteeIds.length)
      throw new BadRequestErrorResponse('Invitee list is required.')

    if (inviteeIds.includes(userContext._id.toString()))
      throw new BadRequestErrorResponse('You cannot invite yourself.')

    const workspace = await WorkspaceRepo.findOne({
      filter: {
        _id: new ObjectId(data.workspaceId),
        status: 'active'
      }
    })

    if (!workspace) throw new NotFoundErrorResponse('Workspace not found.')

    const subscription = await getActiveSubscriptionCached({
      workspaceId: workspace._id.toString()
    })

    if (!subscription)
      throw new NotFoundErrorResponse(
        'Subscription not found for this workspace.'
      )

    const features = subscription.planFeatureSnapshot

    const countMembers = await WorkspaceMemberRepo.count({
      filter: {
        workspaceId: workspace._id.toString(),
        status: 'active'
      }
    })

    if (countMembers >= features.limits.maxMembers)
      throw new ForbiddenErrorResponse(
        'This workspace has reached its member limit.'
      )

    const userObjectIds = inviteeIds.map((i) => new ObjectId(i))

    const users = await UserRepo.findMany({
      filter: { _id: { $in: userObjectIds } }
    })

    if (users.length !== inviteeIds.length)
      throw new NotFoundErrorResponse('Some users do not exist.')

    const existedWorkspaceMembers = await WorkspaceMemberRepo.findMany({
      filter: {
        workspaceId: workspace._id.toString(),
        userId: { $in: inviteeIds },
        status: 'active'
      }
    })

    if (existedWorkspaceMembers.length > 0)
      throw new ConflictErrorResponse(
        'Some users are already members of this workspace.'
      )

    const pendingInvitations = await InvitationRepo.findMany({
      filter: {
        entity: 'workspace',
        entityId: workspace._id.toString(),
        inviteeId: { $in: inviteeIds },
        status: 'pending'
      }
    })

    const pendingInviteeIds = new Set(
      pendingInvitations.map((item) => item.inviteeId.toString())
    )

    const finalInviteeIds = inviteeIds.filter(
      (id) => !pendingInviteeIds.has(id)
    )

    if (!finalInviteeIds.length)
      throw new ConflictErrorResponse(
        'All selected users already have pending invitations.'
      )

    const createInvitationsData = finalInviteeIds.map((inviteeId) => ({
      inviterId: userContext._id.toString(),
      inviteeId,
      entity: 'workspace',
      entityId: workspace._id.toString(),
      message: data.message
    }))

    await InvitationRepo.createMany({ data: createInvitationsData })
  }

  static createBoardInvitation = async ({ userContext, boardAccess, data }) => {
    const inviteeIds = [
      ...new Set((data.userIds || []).map((i) => i.toString()))
    ]

    if (!inviteeIds.length)
      throw new BadRequestErrorResponse('Invitee list is required.')

    if (inviteeIds.includes(userContext._id.toString()))
      throw new BadRequestErrorResponse('You cannot invite yourself.')

    const existedWorkspaceMembers = await WorkspaceMemberRepo.findMany({
      filter: {
        workspaceId: boardAccess.board.workspaceId.toString(),
        userId: { $in: inviteeIds },
        status: 'active'
      }
    })

    if (existedWorkspaceMembers.length !== inviteeIds.length)
      throw new ConflictErrorResponse(
        'Some users are not members of this workspace.'
      )

    const workspaceMemberIds = existedWorkspaceMembers.map((item) =>
      item._id.toString()
    )

    const existedBoardMembers = await BoardMemberRepo.findMany({
      filter: {
        boardId: boardAccess.board._id.toString(),
        workspaceMemberId: { $in: workspaceMemberIds },
        status: 'active'
      }
    })

    if (existedBoardMembers.length > 0)
      throw new ConflictErrorResponse(
        'Some users are already members of this board.'
      )

    const pendingInvitations = await InvitationRepo.findMany({
      filter: {
        entity: 'board',
        entityId: boardAccess.board._id.toString(),
        inviteeId: { $in: inviteeIds },
        status: 'pending'
      }
    })

    const pendingInviteeIds = new Set(
      pendingInvitations.map((item) => item.inviteeId.toString())
    )

    const finalInviteeIds = inviteeIds.filter(
      (id) => !pendingInviteeIds.has(id)
    )

    if (!finalInviteeIds.length)
      throw new ConflictErrorResponse(
        'All selected users already have pending invitations.'
      )

    const createInvitationsData = finalInviteeIds.map((inviteeId) => ({
      inviterId: userContext._id.toString(),
      inviteeId,
      entity: 'board',
      entityId: boardAccess.board._id.toString(),
      message: data.message
    }))

    await InvitationRepo.createMany({ data: createInvitationsData })

    await ActivityLogRepo.createOne({
      data: {
        boardId: boardAccess.board._id.toString(),
        authorId: boardAccess.boardMember._id.toString(),
        authorType: 'boardMember',
        entityType: 'board',
        entityId: boardAccess.board._id.toString(),
        action: 'board.invitation.create',
        content:
          finalInviteeIds.length === 1
            ? 'invited a member to this board'
            : `invited ${finalInviteeIds.length} members to this board`
      }
    })
  }

  static updateWorkspaceInvitation = async ({ _id, userContext, data }) => {
    const allowedStatuses = ['accepted', 'rejected']

    if (!allowedStatuses.includes(data.status))
      throw new BadRequestErrorResponse('Invalid invitation status.')

    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const invitation = await InvitationRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            entity: 'workspace',
            inviteeId: userContext._id.toString(),
            status: 'pending'
          },
          options: { session }
        })

        if (!invitation)
          throw new NotFoundErrorResponse('Invitation not found.')

        const workspace = await WorkspaceRepo.findOne({
          filter: {
            _id: new ObjectId(invitation.entityId),
            status: 'active'
          },
          options: { session }
        })

        if (!workspace) throw new NotFoundErrorResponse('Workspace not found.')

        if (data.status === 'accepted') {
          const subscription = await getActiveSubscriptionCached({
            workspaceId: workspace._id.toString()
          })

          if (!subscription)
            throw new NotFoundErrorResponse(
              'Subscription not found for this workspace.'
            )

          const features = subscription.planFeatureSnapshot

          const defaultViewerRole = await WorkspaceRoleRepo.findOne({
            filter: {
              workspaceId: invitation.entityId,
              key: 'workspace_viewer',
              isDefault: true
            },
            options: { session }
          })

          if (!defaultViewerRole)
            throw new NotFoundErrorResponse(
              'Default workspace viewer role not found.'
            )

          const existingMember = await WorkspaceMemberRepo.findOne({
            filter: {
              workspaceId: invitation.entityId,
              userId: userContext._id.toString()
            },
            options: { session }
          })

          if (existingMember?.status === 'active')
            throw new ConflictErrorResponse(
              'You are already a member of this workspace.'
            )

          const activeMemberCount = await WorkspaceMemberRepo.count({
            filter: {
              workspaceId: invitation.entityId,
              status: 'active'
            },
            options: { session }
          })

          if (activeMemberCount >= features?.limits?.maxMembers)
            throw new ForbiddenErrorResponse(
              'This workspace has reached its member limit.'
            )

          if (!existingMember) {
            await WorkspaceMemberRepo.createOne({
              data: {
                workspaceId: invitation.entityId,
                workspaceRoleId: defaultViewerRole._id.toString(),
                invitedBy: invitation.inviterId.toString(),
                userId: userContext._id.toString(),
                status: 'active',
                joinAt: new Date()
              },
              session
            })
          } else {
            await WorkspaceMemberRepo.updateOne({
              filter: { _id: new ObjectId(existingMember._id) },
              data: {
                $set: {
                  status: 'active',
                  workspaceRoleId: defaultViewerRole._id.toString(),
                  invitedBy: invitation.inviterId.toString(),
                  joinAt: new Date(),
                  updatedAt: new Date()
                }
              },
              session
            })
          }
        }

        const updatedInvitation = await InvitationRepo.updateOne({
          filter: { _id: new ObjectId(_id) },
          data: {
            $set: {
              status: data.status,
              updatedAt: new Date()
            }
          },
          session
        })

        return updatedInvitation
      })
    } finally {
      await session.endSession()
    }
  }

  static updateBoardInvitation = async ({ _id, userContext, data }) => {
    const allowedStatuses = ['accepted', 'rejected']

    if (!allowedStatuses.includes(data.status))
      throw new BadRequestErrorResponse('Invalid invitation status.')

    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const invitation = await InvitationRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            entity: 'board',
            inviteeId: userContext._id.toString(),
            status: 'pending'
          },
          options: { session }
        })

        if (!invitation)
          throw new NotFoundErrorResponse('Invitation not found.')

        const board = await BoardRepo.findOne({
          filter: {
            _id: new ObjectId(invitation.entityId),
            status: 'active'
          },
          options: { session }
        })

        if (!board) throw new NotFoundErrorResponse('Board not found.')

        let acceptedBoardMemberId = null

        if (data.status === 'accepted') {
          const defaultViewerRole = await BoardRoleRepo.findOne({
            filter: {
              boardId: invitation.entityId,
              key: 'board_viewer',
              isDefault: true
            },
            options: { session }
          })

          if (!defaultViewerRole)
            throw new NotFoundErrorResponse(
              'Default board viewer role not found.'
            )

          const workspaceMember = await WorkspaceMemberRepo.findOne({
            filter: {
              userId: userContext._id.toString(),
              workspaceId: board.workspaceId.toString(),
              status: 'active'
            },
            options: { session }
          })

          if (!workspaceMember)
            throw new ConflictErrorResponse(
              'You are no longer an active member of this workspace.'
            )

          const existingBoardMember = await BoardMemberRepo.findOne({
            filter: {
              boardId: invitation.entityId,
              workspaceMemberId: workspaceMember._id.toString()
            },
            options: { session }
          })

          if (!existingBoardMember) {
            const createMemberData = {
              boardId: invitation.entityId,
              workspaceMemberId: workspaceMember._id.toString(),
              boardRoleId: defaultViewerRole._id.toString(),
              invitedBy: invitation.inviterId.toString(),
              status: 'active',
              joinAt: new Date()
            }

            const createdBoardMember = await BoardMemberRepo.createOne({
              data: createMemberData,
              session
            })

            acceptedBoardMemberId = createdBoardMember.insertedId.toString()
          } else {
            if (existingBoardMember.status === 'active')
              throw new ConflictErrorResponse(
                'You are already a member of this board.'
              )

            await BoardMemberRepo.updateOne({
              filter: { _id: new ObjectId(existingBoardMember._id) },
              data: {
                $set: {
                  status: 'active',
                  boardRoleId: defaultViewerRole._id.toString(),
                  invitedBy: invitation.inviterId.toString(),
                  joinAt: new Date(),
                  updatedAt: new Date()
                }
              },
              session
            })

            acceptedBoardMemberId = existingBoardMember._id.toString()
          }
        }

        const updatedInvitation = await InvitationRepo.updateOne({
          filter: { _id: new ObjectId(_id) },
          data: {
            $set: {
              status: data.status,
              updatedAt: new Date()
            }
          },
          session
        })

        if (data.status === 'accepted') {
          await ActivityLogRepo.createOne({
            data: {
              boardId: board._id.toString(),
              authorId: acceptedBoardMemberId,
              authorType: 'boardMember',
              entityType: 'board',
              entityId: board._id.toString(),
              action: 'board.invitation.accept',
              content: 'accepted an invitation to this board '
            },
            session
          })
        }

        return updatedInvitation
      })
    } finally {
      await session.endSession()
    }
  }
}

export default InvitationService
