import {
  CreatedSuccessResponse,
  OkSuccessResponse
} from '~/core/success.response'
import CardService from '~/services/card.service'

class CardController {
  static fetchArchived = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.fetchArchived({
        boardId: req.params.boardId
      })
    }).send(res)
  }

  static fetchDetail = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.fetchDetail({ _id: req.params._id })
    }).send(res)
  }

  static create = async (req, res) => {
    new CreatedSuccessResponse({
      message: 'Card created successfully',
      metadata: await CardService.create({
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static updateBasic = async (req, res) => {
    new OkSuccessResponse({
      message: 'Card updated successfully.',
      metadata: await CardService.updateBasic({
        _id: req.params.cardId,
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static archive = async (req, res) => {
    new OkSuccessResponse({
      message: 'Archive card success.',
      metadata: await CardService.archive({
        _id: req.params.cardId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static restore = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.restore({
        _id: req.params.cardId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static joinCard = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.joinCard({
        _id: req.params.cardId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static leaveCard = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.leaveCard({
        _id: req.params.cardId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static assignMemberToCard = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.assignMemberToCard({
        _id: req.params.cardId,
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static removeMemberFromCard = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.removeMemberFromCard({
        _id: req.params.cardId,
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static updateLabel = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.updateLabel({
        _id: req.params.cardId,
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static delete = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CardService.delete({
        _id: req.params.cardId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }
}

export default CardController
