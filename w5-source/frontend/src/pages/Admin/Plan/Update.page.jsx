import React from 'react'
import { Box } from '@mui/material'
import UpdatePlanForm from '~/components/Admin/Plan/UpdatePlan/UpdatePlanForm'
import UpdatePlanHeader from '~/components/Admin/Plan/UpdatePlan/UpdatePlanHeader'
import { useLocation } from 'react-router-dom'

export default function UpdatePlanPage() {
  const { state } = useLocation()
  const planData = state?.planData
  return (
    <Box>
      <UpdatePlanHeader />
      <UpdatePlanForm initialData={planData} />
    </Box>
  )
}
