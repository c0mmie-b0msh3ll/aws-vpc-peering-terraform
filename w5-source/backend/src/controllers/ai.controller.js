import {
  CreatedSuccessResponse,
  OkSuccessResponse
} from '~/core/success.response'
import AIService from '~/services/ai.service'

class AIController {
  static generateBoard = async (req, res) => {
    try {
      const result = await AIService.generateBoard({
        userContext: req.userContext,
        workspaceAccess: req.workspaceAccess,
        prompt: req.body.prompt
      })
      new CreatedSuccessResponse({
        message: 'AI board generated successfully.',
        metadata: result
      }).send(res)
    } catch (err) {
      console.error('AI generateBoard error:', err?.message || err)
      throw err
    }
  }

  static generateCardAssist = async (req, res) => {
    new OkSuccessResponse({
      message: 'AI suggestions generated successfully.',
      metadata: await AIService.generateCardAssist({
        cardId: req.params.cardId,
        boardAccess: req.boardAccess,
        userPrompt: req.body.userPrompt
      })
    }).send(res)
  }

  static applyCardAssist = async (req, res) => {
    new OkSuccessResponse({
      message: 'AI suggestions applied successfully.',
      metadata: await AIService.applyCardAssist({
        cardId: req.params.cardId,
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }
}

export default AIController
