import React from 'react'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import UpdateBoardHeader from '~/components/Admin/Board/UpdateBoard/UpdateBoardHeader'
import UpdateBoardForm from '~/components/Admin/Board/UpdateBoard/UpdateBoardForm'

const mockBoardDetail = {
  _id: 'BRD001',
  workspaceId: 'WKS001',
  title: 'Project Alpha Board',
  description: 'Main board for alpha project planning.',
  ownerId: 'USR001',
  visibility: 'workspace',
  backgroundId: 'BG001',
  type: 'normal',
  cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  status: 'active'
}

export default function UpdateBoardPage() {
  const { state } = useLocation()
  const boardData = state?.boardData || mockBoardDetail

  return (
    <Box>
      <UpdateBoardHeader />
      <UpdateBoardForm initialData={boardData} />
    </Box>
  )
}