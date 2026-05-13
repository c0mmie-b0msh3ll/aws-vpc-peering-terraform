import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from '~/routes/v1/board.route'
import { columnRoute } from '~/routes/v1/column.route'
import { cardRoute } from '~/routes/v1/card.route'
import { userRoute } from '~/routes/v1/user.route'
import { invitationRoute } from './invitation.route'
import { workspaceRoute } from './workspace.route'
import { commentRoute } from './comment.route'
import { taskRouter } from './task.route'
import { attachmentRouter } from './attachment.route'
import { labelRouter } from './label.route'
import { adminUserRoute } from './adminUser.route'
import { adminBackgroundRoute } from './adminBackground.route'
const Router = express.Router()

/** Check APIs v1/status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

/** Board APIs */
Router.use('/boards', boardRoute)

/** Column APIs */
Router.use('/columns', columnRoute)

/** Cards APIs */
Router.use('/cards', cardRoute)

/** User APIs */
Router.use('/users', userRoute)

/** Invitation APIs */
Router.use('/invitations', invitationRoute)

/** Workspace APIs */
Router.use('/workspaces', workspaceRoute)

/** Comment APIs */
Router.use('/comments', commentRoute)

/** Task APIs */
Router.use('/tasks', taskRouter)

/** Attachment APIs */
Router.use('/attachments', attachmentRouter)

/** Label APIs */
Router.use('/labels', labelRouter)

// Admin User APIs
Router.use('/admin/users', adminUserRoute)

// Admin Background APIs
Router.use('/admin/backgrounds', adminBackgroundRoute)


export const APIs_V1 = Router
