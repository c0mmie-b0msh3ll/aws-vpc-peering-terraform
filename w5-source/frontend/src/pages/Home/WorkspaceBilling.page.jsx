import * as React from 'react'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { PlanCard } from '~/components/Workspace/workspaceBilling/PlanCard'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'

const plans = [
  {
    id: 'free',
    title: 'Free',
    price: 0,
    currency: 'VND',
    interval: 'month',
    features: [
      { iconKey: 'board', text: 'Unlimited cards' },
      { iconKey: 'inbox', text: 'Inbox' },
      { iconKey: 'bookmark', text: 'Quick capture' },
      { iconKey: 'layout', text: 'Up to 10 boards per Workspace' }
    ]
  },
  {
    id: 'standard',
    title: 'Standard',
    price: 522500,
    currency: 'VND',
    interval: 'month',
    features: [
      { iconKey: 'layout', text: 'Unlimited boards' },
      { iconKey: 'calendar', text: 'Planner (full access)' },
      { iconKey: 'list', text: 'Collapsible lists and list colors' },
      { iconKey: 'checklist', text: 'Advanced checklists' },
      { iconKey: 'field', text: 'Custom fields' },
      { iconKey: 'copy', text: 'Card mirroring' },
      { iconKey: 'ai', text: 'Quick capture with AI summaries' },
      { iconKey: 'automation', text: 'Limited automation (1K runs per month)' },
      { iconKey: 'file', text: 'Storage 250MB/file' }
    ]
  },
  {
    id: 'premium',
    title: 'Premium',
    price: 649000,
    currency: 'VND',
    interval: 'month',
    features: [
      { iconKey: 'automation', text: 'Unlimited automations' },
      { iconKey: 'ai', text: 'Unlimited cards with AI' },
      { iconKey: 'download', text: 'Data Export' },
      { iconKey: 'copy', text: 'Workspace-level templates' },
      { iconKey: 'table', text: 'Views: Timeline, Table, Dashboard, and Map' },
      { iconKey: 'collection', text: 'Board collections' },
      { iconKey: 'observer', text: 'Observers' },
      { iconKey: 'security', text: 'Admin and security features' },
      { iconKey: 'support', text: 'Priority support' }
    ]
  }
]

export default function WorkspaceBillingPage() {
  const [selectedPlan, setSelectedPlan] = React.useState('premium')

  const activePlan = plans.find((plan) => plan.id === selectedPlan)

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 1,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongOutlinedIcon fontSize="large" color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Workspace Billings
          </Typography>
        </Box>
      </Box>

      <Box
        sx={(theme) => ({
          minHeight: '75vh',
          bgcolor: theme.palette.mode === 'dark' ? '#151822' : '#f6f8fc',
          color: '#fff',
          display: 'flex',
          alignItems: 'flex-start',
          py: { xs: 4, md: 5 },
          transition: theme.transitions.create(['background-color', 'color'], {
            duration: theme.transitions.duration.shorter
          })
        })}
      >
        <Container maxWidth="xl">
          <Box sx={{ py: { xs: 5, md: 7 } }}>
            <Stack spacing={1.5} alignItems="center" sx={{ mb: 5 }}>
              <Typography
                sx={(theme) => ({
                  fontSize: { xs: 26, md: 40 },
                  lineHeight: 1.2,
                  fontWeight: 800,
                  textAlign: 'center',
                  maxWidth: 900,
                  color: theme.palette.text.primary
                })}
              >
                Upgrade to capture, organize, and tackle your to-dos from
                anywhere
              </Typography>

              <Typography
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  textAlign: 'center',
                  fontSize: { xs: 14, md: 17 },
                  maxWidth: 760
                })}
              >
                Maximize your productivity potential with more features, more
                integrations, and more automation.
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, minmax(0, 1fr))'
                },
                gap: 3,
                alignItems: 'start'
              }}
            >
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan === plan.id}
                  onSelect={setSelectedPlan}
                />
              ))}
            </Box>

            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Button
                variant="contained"
                sx={{
                  minWidth: 320,
                  maxWidth: '100%',
                  height: 48,
                  px: 4,
                  textTransform: 'none',
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none'
                  }
                }}
              >
                Select plan{activePlan ? `: ${activePlan.title}` : ''}
              </Button>

              <Typography
                variant="body2"
                sx={(theme) => ({
                  mt: 3,
                  color: theme.palette.text.secondary,
                  textAlign: 'center'
                })}
              >
                For more control, security, and support, check out Trello
                Enterprise.{' '}
                <Box
                  component="span"
                  sx={(theme) => ({
                    color: theme.palette.primary.main,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  })}
                >
                  Learn more
                </Box>
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  )
}
