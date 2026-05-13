import { ObjectId } from 'mongodb'
import { mongoClientInstance } from '~/config/mongodb'
import {
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import BoardMemberRepo from '~/repo/boardMember.repo'
import CardRepo from '~/repo/card.repo'
import LabelRepo from '~/repo/label.repo'

class LabelService {
  static create = async ({ userContext, data }) => {
    const boardMember = await BoardMemberRepo.findMemberInBoard({
      userId: userContext._id,
      boardId: data.boardId
    })

    if (!boardMember)
      throw new ForbiddenErrorResponse('You are not a member of this board.')

    const createLabelData = { ...data, createdBy: boardMember._id.toString() }

    const createdLabel = await LabelRepo.createOne({ data: createLabelData })

    return await LabelRepo.findOne({
      filter: { _id: new ObjectId(createdLabel.insertedId) }
    })
  }

  static update = async ({ _id, userContext, data }) => {
    const label = await LabelRepo.findOne({
      filter: { _id: new ObjectId(_id) }
    })

    if (!label) throw new NotFoundErrorResponse('Label not found.')

    const boardMember = await BoardMemberRepo.findMemberInBoard({
      userId: userContext._id,
      boardId: label.boardId
    })

    if (!boardMember)
      throw new ForbiddenErrorResponse('You are not a member of this board.')

    const updatedLabel = await LabelRepo.updateOne({
      filter: { _id: new ObjectId(_id) },
      data: { $set: { title: data.title, color: data.color } }
    })

    return updatedLabel
  }

  static delete = async ({ _id, userContext }) => {
    const label = await LabelRepo.findOne({
      filter: { _id: new ObjectId(_id) }
    })

    if (!label) throw new NotFoundErrorResponse('Label not found.')

    const boardMember = await BoardMemberRepo.findMemberInBoard({
      userId: userContext._id,
      boardId: label.boardId
    })

    if (!boardMember)
      throw new ForbiddenErrorResponse('You are not a member of this board.')

    const session = await mongoClientInstance.startSession()

    await session.withTransaction(async () => {
      await LabelRepo.deleteOne({ filter: { _id: new ObjectId(_id) }, session })
      await CardRepo.updateMany({
        filter: { boardId: label.boardId },
        data: { $pull: { labelIds: label._id.toString() } },
        session
      })
    })

    return { _id }
  }
}

export default LabelService
