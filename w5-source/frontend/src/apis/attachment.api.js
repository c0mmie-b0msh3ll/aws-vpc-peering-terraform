import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const getAttachmentDownloadUrl = async ({ _id, boardId }) => {
  try {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/v1/attachments/presign-url/${boardId}/${_id}`
    )
    return response.data.metadata
  } catch {
    throw new Error()
  }
}
