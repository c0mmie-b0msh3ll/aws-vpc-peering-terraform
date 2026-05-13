import { UnprocessableEntityErrorResponse } from '~/core/error.response'

export default function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error } = schema.validate(req[source], { abortEarly: true })

    if (error)
      throw new UnprocessableEntityErrorResponse(error.details[0].message)
    next()
  }
}
