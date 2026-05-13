import { StatusCodes } from 'http-status-codes'
import { ReasonPhrases } from 'http-status-codes'

class SuccessResponse {
  constructor({ message, statusCode = StatusCodes.OK, metadata = {} }) {
    this.message = message ? message : null
    this.status = statusCode
    this.metadata = metadata
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this)
  }
}

class OkSuccessResponse extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata })
  }
}

class NoContentSuccessResponse extends SuccessResponse {
  constructor({ message, statusCode = StatusCodes.NO_CONTENT }) {
    super({ message, statusCode })
  }
}

class CreatedSuccessResponse extends SuccessResponse {
  constructor({
    options = {},
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = ReasonPhrases.CREATED,
    metadata
  }) {
    super({ message, statusCode, reasonStatusCode, metadata })
    this.options = options
  }
}

export { OkSuccessResponse, CreatedSuccessResponse, NoContentSuccessResponse }
