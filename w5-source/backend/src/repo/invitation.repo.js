import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { boardModel } from '~/models/board.model'
import { userModel } from '~/models/user.model'
import {
  invitationModel,
  validateBeforeCreate
} from '~/models/invitation.model'
import { workspaceModel } from '~/models/workspace.model'

class InvitationRepo {
  static findById = async ({ _id }) => {
    const result = await GET_DB()
      .collection(invitationModel.INVITATION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(_id) })
    return result
  }

  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(invitationModel.INVITATION_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(invitationModel.INVITATION_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static findByUser = async ({ userId }) => {
    const queryConditions = [{ inviteeId: userId }]

    const result = await GET_DB()
      .collection(invitationModel.INVITATION_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },

        {
          $addFields: {
            entity_object_id: { $toObjectId: '$entityId' },
            inviter_object_id: { $toObjectId: '$inviterId' }
          }
        },

        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviter_object_id',
            foreignField: '_id',
            as: 'inviter'
          }
        },

        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'entity_object_id',
            foreignField: '_id',
            as: 'board'
          }
        },

        {
          $lookup: {
            from: workspaceModel.WORKSPACE_COLLECTION_NAME,
            localField: 'entity_object_id',
            foreignField: '_id',
            as: 'workspace'
          }
        },

        {
          $addFields: {
            inviter: { $arrayElemAt: ['$inviter', 0] },
            entityInfo: {
              $cond: {
                if: { $eq: ['$entity', 'board'] },
                then: { $arrayElemAt: ['$board', 0] },
                else: { $arrayElemAt: ['$workspace', 0] }
              }
            }
          }
        },

        {
          $project: {
            board: 0,
            workspace: 0,
            entity_object_id: 0,
            inviterId: 0,
            inviteeId: 0,
            entityId: 0,
            updatedAt: 0,
            inviter_object_id: 0,

            'inviter.email': 0,
            'inviter.password': 0,
            'inviter.createdAt': 0,
            'inviter.updatedAt': 0,
            'inviter.role': 0,
            'inviter.isActive': 0,
            'inviter.username': 0
          }
        },

        { $sort: { createdAt: -1 } }
      ])
      .toArray()

    return result
  }

  static createMany = async ({ data, session }) => {
    const validData = await Promise.all(
      data.map((d) => invitationModel.validateBeforeCreate(d))
    )

    return await GET_DB()
      .collection(invitationModel.INVITATION_COLLECTION_NAME)
      .insertMany(validData, { session })
  }

  static createNewBoardInvitation = async ({ data }) => {
    const validData = await validateBeforeCreate(data)
    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }

    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }
    const createdInvitation = await GET_DB()
      .collection(invitationModel.INVITATION_COLLECTION_NAME)
      .insertOne(newInvitationToAdd)

    return createdInvitation
  }

  static updateById = async ({ _id, data }) => {
    if (data.boardInvitation)
      data.boardInvitation = {
        ...data.boardInvitation,
        boardId: new ObjectId(data.boardInvitation.boardId)
      }

    const result = await GET_DB()
      .collection(invitationModel.INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: data },
        { returnDocument: 'after' }
      )

    return result
  }

  static updateOne = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(invitationModel.INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(filter, data, { returnDocument: 'after', session })
  }
}
export default InvitationRepo
