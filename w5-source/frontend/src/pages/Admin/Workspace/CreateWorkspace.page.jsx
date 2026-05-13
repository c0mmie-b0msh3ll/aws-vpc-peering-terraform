import React from 'react'
import { Box } from '@mui/material'
import CreateWorkspaceHeader from '~/components/Admin/Workspace/CreateWorkspace/CreateWorkspaceHeader'
import CreateWorkspaceForm from '~/components/Admin/Workspace/CreateWorkspace/CreateWorkspaceForm'

export default function CreateWorkspacePage() {
  return (
    <Box>
      <CreateWorkspaceHeader />
      <CreateWorkspaceForm />
    </Box>
  )
}