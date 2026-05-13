import Joi from 'joi'

const createNewBoardInvitation = Joi.object({
  inviteeEmail: Joi.string().required(),
  boardId: Joi.string().required()
})

export const invitationValidation = {
  createNewBoardInvitation
}
