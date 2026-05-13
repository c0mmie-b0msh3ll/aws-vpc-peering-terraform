import React from 'react'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import UpdateWorkspaceHeader from '~/components/Admin/Workspace/UpdateWorkspace/UpdateWorkspaceHeader'
import UpdateWorkspaceForm from '~/components/Admin/Workspace/UpdateWorkspace/UpdateWorkspaceForm'

const mockWorkspaceDetail = {
  _id: 'WKS001',
  title: 'Main Workspace',
  description: 'Default workspace for managing all system resources.',
  ownerId: 'USR001',
  status: 'active'
}

export default function UpdateWorkspacePage() {
  const { state } = useLocation()
  const workspaceData = state?.workspaceData || mockWorkspaceDetail

  return (
    <Box>
      <UpdateWorkspaceHeader />
      <UpdateWorkspaceForm initialData={workspaceData} />
    </Box>
  )
}