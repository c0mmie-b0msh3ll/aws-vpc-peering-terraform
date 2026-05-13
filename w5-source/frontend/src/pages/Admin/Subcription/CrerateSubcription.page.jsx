import React from 'react'
import { Box } from '@mui/material'
import CreateSubscriptionHeader from '~/components/Admin/Subcription/CreateSubcription/CreateSubcriptionHeader'
import CreateSubscriptionForm from '~/components/Admin/Subcription/CreateSubcription/CreateSubcriptionForm'

export default function CreateSubscriptionPage() {
  return (
    <Box>
      <CreateSubscriptionHeader />
      <CreateSubscriptionForm />
    </Box>
  )
}