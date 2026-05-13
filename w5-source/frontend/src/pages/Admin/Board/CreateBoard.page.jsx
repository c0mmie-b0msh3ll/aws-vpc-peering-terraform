import React from 'react'
import { Box } from '@mui/material'
import CreateBoardHeader from '~/components/Admin/Board/CreateBoard/CreateBoardHeader'
import CreateBoardForm from '~/components/Admin/Board/CreateBoard/CreateBoardForm'

export default function CreateBoardPage() {
  return (
    <Box>
      <CreateBoardHeader />
      <CreateBoardForm />
    </Box>
  )
}