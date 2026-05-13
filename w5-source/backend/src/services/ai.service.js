import Joi from 'joi'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { mongoClientInstance } from '~/config/mongodb'
import { invokeModel } from '~/providers/BedrockProvider'
import { getCacheJSON, setCache } from '~/helpers/cache'
import {
  BadRequestErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import CardRepo from '~/repo/card.repo'
import TaskRepo from '~/repo/task.repo'
import BoardRepo from '~/repo/board.repo'
import ColumnRepo from '~/repo/column.repo'
import BoardRoleRepo from '~/repo/boardRole.repo'
import BoardMemberRepo from '~/repo/boardMember.repo'
import LabelRepo from '~/repo/label.repo'
import ActivityLogRepo from '~/repo/activityLog.repo'

const AI_CACHE_TTL = 86400 // 24h

const AI_OUTPUT_SCHEMA = Joi.object({
  description: Joi.string().max(2000).required(),
  subtasks: Joi.array().items(Joi.string().max(200)).min(1).max(10).required()
})

const buildPrompt = (
  title
) => `You are a task management assistant. Given a card title, generate a description and subtasks.

Rules:
- description: 1-3 sentences, max 2000 characters, in the same language as the title
- subtasks: 3-7 actionable items, each max 200 characters, in the same language as the title
- Return ONLY valid JSON, no extra text

Output format:
{"description": "...", "subtasks": ["...", "..."]}

Card title: "${title}"`

class AIService {
  static generateCardAssist = async ({ cardId, boardAccess, userPrompt }) => {
    const card = await CardRepo.findOne({
      filter: {
        _id: new ObjectId(cardId),
        boardId: boardAccess.board._id.toString(),
        status: 'active'
      }
    })

    if (!card) throw new NotFoundErrorResponse('Card not found.')
    if (!card.title) throw new BadRequestErrorResponse('Card title is empty.')

    const cacheInput = userPrompt ? `${card.title}::${userPrompt}` : card.title
    const cacheKey = `ai:card-assist:${crypto.createHash('sha256').update(cacheInput).digest('hex')}`
    const cached = await getCacheJSON({ key: cacheKey })
    if (cached) return { ...cached, fromCache: true }

    let prompt = buildPrompt(card.title)
    if (userPrompt) {
      prompt += `\n\nAdditional context from user: ${userPrompt}`
    }

    let rawResponse
    try {
      rawResponse = await invokeModel({ prompt })
    } catch (bedrockError) {
      console.error('Bedrock error:', bedrockError?.name, bedrockError?.message)
      throw new BadRequestErrorResponse(
        `AI service error: ${bedrockError?.message || 'Unknown'}`
      )
    }

    let parsed
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      throw new BadRequestErrorResponse(
        'AI returned invalid format. Please try again.'
      )
    }

    const validated = await AI_OUTPUT_SCHEMA.validateAsync(parsed, {
      abortEarly: false
    })

    await setCache({
      key: cacheKey,
      value: validated,
      ttlInSeconds: AI_CACHE_TTL
    })

    return { ...validated, fromCache: false }
  }

  static applyCardAssist = async ({ cardId, boardAccess, data }) => {
    const { description, subtasks } = data

    if (!description && (!subtasks || subtasks.length === 0)) {
      throw new BadRequestErrorResponse('Nothing to apply.')
    }

    const session = await mongoClientInstance.startSession()

    try {
      const result = await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(cardId),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        let updatedCard = card

        if (description) {
          updatedCard = await CardRepo.updateOne({
            filter: { _id: new ObjectId(cardId) },
            data: {
              $set: {
                description,
                isHasDescription: true
              }
            },
            session
          })
        }

        let createdTasks = []

        if (subtasks && subtasks.length > 0) {
          const parentTaskData = {
            cardId: card._id.toString(),
            content: 'AI Generated Tasks',
            parentTaskId: null,
            memberId: null,
            isCompleted: false,
            dueAt: null
          }

          const parentResult = await TaskRepo.createOne({
            data: parentTaskData,
            session
          })

          const parentTask = await TaskRepo.findOne({
            filter: { _id: new ObjectId(parentResult.insertedId) },
            options: { session }
          })

          for (const content of subtasks) {
            const childData = {
              cardId: card._id.toString(),
              content,
              parentTaskId: parentTask._id.toString(),
              memberId: null,
              isCompleted: false,
              dueAt: null
            }

            await TaskRepo.createOne({ data: childData, session })
          }

          createdTasks = await TaskRepo.findMany({
            filter: { parentTaskId: parentTask._id.toString() },
            options: { session }
          })

          updatedCard = await CardRepo.updateOne({
            filter: { _id: new ObjectId(cardId) },
            data: {
              $inc: { taskCount: subtasks.length }
            },
            session
          })
        }

        return { card: updatedCard, tasks: createdTasks }
      })

      return result
    } finally {
      await session.endSession()
    }
  }
  static generateBoard = async ({ userContext, workspaceAccess, prompt }) => {
    if (!prompt || !prompt.trim()) {
      throw new BadRequestErrorResponse('Project description is required.')
    }

    const boardPrompt = `You are a project management expert. Given a project description, generate a complete board structure.

Rules:
- boardTitle: short name (max 200 chars), in the same language as the input
- columns: 3-5 columns representing workflow stages, each with a title
- cards: 2-5 cards per column, each with a title (max 500 chars) and description (max 2000 chars)
- Return ONLY valid JSON, no extra text

Output format:
{
  "boardTitle": "...",
  "columns": [
    {
      "title": "...",
      "cards": [
        { "title": "...", "description": "..." }
      ]
    }
  ]
}

Project description: "${prompt}"`

    let rawResponse
    try {
      rawResponse = await invokeModel({ prompt: boardPrompt, maxTokens: 2048 })
    } catch (bedrockError) {
      console.error('Bedrock error:', bedrockError?.name, bedrockError?.message)
      throw new BadRequestErrorResponse(
        `AI service error: ${bedrockError?.message || 'Unknown'}`
      )
    }

    let parsed
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      throw new BadRequestErrorResponse(
        'AI returned invalid format. Please try again.'
      )
    }

    const BOARD_OUTPUT_SCHEMA = Joi.object({
      boardTitle: Joi.string().max(200).required(),
      columns: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().max(500).required(),
            cards: Joi.array()
              .items(
                Joi.object({
                  title: Joi.string().max(500).required(),
                  description: Joi.string().max(2000).allow('').default('')
                })
              )
              .default([])
          })
        )
        .min(1)
        .max(10)
        .required()
    })

    const validated = await BOARD_OUTPUT_SCHEMA.validateAsync(parsed, {
      abortEarly: false
    })

    // Create board with full setup in a transaction
    const workspaceId = workspaceAccess.workspace._id.toString()
    const session = await mongoClientInstance.startSession()

    try {
      let boardId = null

      await session.withTransaction(async () => {
        // 1. Create board
        const boardData = {
          workspaceId,
          title: validated.boardTitle,
          description: `AI-generated board from: "${prompt}"`,
          visibility: 'private',
          type: 'normal',
          createdBy: userContext._id
        }

        const createdBoard = await BoardRepo.createOne({
          data: boardData,
          session
        })
        boardId = createdBoard.insertedId

        // 2. Create roles
        const adminRole = await BoardRoleRepo.createOne({
          data: {
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
          },
          session
        })

        await BoardRoleRepo.createOne({
          data: {
            boardId: boardId.toString(),
            name: 'Viewer',
            isDefault: true,
            key: 'board_viewer',
            permissionCodes: ['board.view']
          },
          session
        })

        // 3. Create board member (current user as admin)
        const workspaceMember = workspaceAccess.workspaceMember
        const createdMember = await BoardMemberRepo.createOne({
          data: {
            boardId: boardId.toString(),
            workspaceMemberId: workspaceMember._id.toString(),
            boardRoleId: adminRole.insertedId.toString(),
            invitedBy: userContext._id.toString(),
            status: 'active',
            joinAt: new Date()
          },
          session
        })

        // 4. Create default labels
        const defaultLabels = [
          { title: '', color: 'green' },
          { title: '', color: 'yellow' },
          { title: '', color: 'orange' },
          { title: '', color: 'red' },
          { title: '', color: 'purple' },
          { title: '', color: 'blue' }
        ].map((l) => ({
          ...l,
          boardId: boardId.toString(),
          createdBy: createdMember.insertedId.toString()
        }))

        await LabelRepo.createMany({ data: defaultLabels, session })

        // 5. Create columns and cards
        const columnOrderIds = []

        for (const colData of validated.columns) {
          const createdCol = await ColumnRepo.createOne({
            data: {
              boardId: boardId.toString(),
              title: colData.title
            },
            session
          })

          columnOrderIds.push(createdCol.insertedId)

          const cardOrderIds = []
          for (const cardData of colData.cards) {
            const createdCard = await CardRepo.createOne({
              data: {
                boardId: boardId.toString(),
                columnId: createdCol.insertedId.toString(),
                title: cardData.title,
                description: cardData.description,
                isHasDescription: !!cardData.description
              },
              session
            })
            cardOrderIds.push(createdCard.insertedId)
          }

          // Update column with card order
          if (cardOrderIds.length > 0) {
            await ColumnRepo.updateById({
              _id: createdCol.insertedId.toString(),
              data: { cardOrderIds },
              session
            })
          }
        }

        // 6. Update board with column order
        await BoardRepo.updateOne({
          _id: boardId.toString(),
          data: { columnOrderIds },
          session
        })

        // 7. Activity log
        await ActivityLogRepo.createOne({
          data: {
            boardId: boardId.toString(),
            authorId: createdMember.insertedId.toString(),
            authorType: 'boardMember',
            entityType: 'board',
            entityId: boardId.toString(),
            action: 'board.create',
            content: `created this board with AI from: "${prompt}"`
          },
          session
        })
      })

      const newBoard = await BoardRepo.findOne({
        filter: { _id: new ObjectId(boardId) }
      })
      return newBoard
    } finally {
      await session.endSession()
    }
  }
}

export default AIService
