import React from 'react'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import UpdateSubscriptionHeader from '~/components/Admin/Subcription/UpdateSubcription/UpdateSubcriptionHeader'
import UpdateSubscriptionForm from '~/components/Admin/Subcription/UpdateSubcription/UpdateSubcrioptionForm'

const mockSubscriptionDetail = {
  _id: 'SUB001',
  workspaceId: 'WKS001',
  planId: 'PLAN001',
  planFeatureSnapshot: '3 boards, 10 users, basic permissions',
  status: 'active',
  startAt: '2026-03-01',
  endAt: '2026-04-01',
  cancelAt: ''
}

export default function UpdateSubscriptionPage() {
  const { state } = useLocation()
  const subscriptionData = state?.subscriptionData || mockSubscriptionDetail

  return (
    <Box>
      <UpdateSubscriptionHeader />
      <UpdateSubscriptionForm initialData={subscriptionData} />
    </Box>
  )
}