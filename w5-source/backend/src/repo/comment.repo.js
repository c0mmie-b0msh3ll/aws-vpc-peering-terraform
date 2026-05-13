import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { boardMemberModel } from '~/models/boardMember.model'
import { cardCommentModel } from '~/models/cardComment.model'
import { userModel } from '~/models/user.model'
import { workspaceMemberModel } from '~/models/workspaceMember.model'
class CommentRepo {
  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(cardCommentModel.CARD_COMMENT_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static getByCardId = async ({ cardId }) => {
    return await GET_DB()
      .collection(cardCommentModel.CARD_COMMENT_COLLECTION_NAME)
      .aggregate([
        ...buildCardCommentDetailPipeline({
          match: { cardId }
        }),
        { $sort: { createdAt: -1 } }
      ])
      .toArray()
  }

  static getDetail = async ({ _id }) => {
    return await GET_DB()
      .collection(cardCommentModel.CARD_COMMENT_COLLECTION_NAME)
      .aggregate([
        ...buildCardCommentDetailPipeline({
          match: { _id: new ObjectId(_id) }
        }),
        { $limit: 1 }
      ])
      .next()
  }

  static createOne = async ({ data, session }) => {
    const validData = await cardCommentModel.validateBeforeCreate(data)
    return await GET_DB()
      .collection(cardCommentModel.CARD_COMMENT_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static deleteOne = async ({ filter, session }) => {
    return await GET_DB()
      .collection(cardCommentModel.CARD_COMMENT_COLLECTION_NAME)
      .deleteOne(filter, { session })
  }

  static deleteMany = async ({ filter, session }) => {
    return await GET_DB()
      .collection(cardCommentModel.CARD_COMMENT_COLLECTION_NAME)
      .deleteMany(filter, { session })
  }

  static count = async ({ filter = {}, options = {} }) => {
    return await GET_DB()
      .collection(cardCommentModel.CARD_COMMENT_COLLECTION_NAME)
      .countDocuments(filter, options)
  }
}
export default CommentRepo

const buildCardCommentDetailPipeline = ({ match = {} }) => {
  return [
    { $match: match },

    {
      $addFields: {
        boardMemberObjectId: { $toObjectId: '$boardMemberId' }
      }
    },

    {
      $lookup: {
        from: boardMemberModel.BOARD_MEMBER_COLLECTION_NAME,
        localField: 'boardMemberObjectId',
        foreignField: '_id',
        as: 'boardMember'
      }
    },

    {
      $unwind: {
        path: '$boardMember',
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $addFields: {
        workspaceMemberObjectId: {
          $toObjectId: '$boardMember.workspaceMemberId'
        }
      }
    },

    {
      $lookup: {
        from: workspaceMemberModel.WORKSPACE_MEMBER_COLLECTION_NAME,
        localField: 'workspaceMemberObjectId',
        foreignField: '_id',
        as: 'workspaceMember'
      }
    },

    {
      $unwind: {
        path: '$workspaceMember',
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $addFields: {
        userObjectId: { $toObjectId: '$workspaceMember.userId' }
      }
    },

    {
      $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'userObjectId',
        foreignField: '_id',
        as: 'user'
      }
    },

    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $project: {
        _id: 1,
        cardId: 1,
        boardMemberId: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        user: {
          _id: '$user._id',
          displayName: '$user.displayName',
          avatar: '$user.avatar'
        }
      }
    }
  ]
}
