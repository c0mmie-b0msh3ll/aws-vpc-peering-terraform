import React from 'react'
import { Box } from '@mui/material'
import CreatePlanHeader from '~/components/Admin/Plan/CreatePlan/CreatePlanHeader'
import CreatePlanForm from '~/components/Admin/Plan/CreatePlan/CreatePlanForm'

export default function CreatePlanPage() {
  return (
    <Box>
      <CreatePlanHeader />
      <CreatePlanForm />
    </Box>
  )
}