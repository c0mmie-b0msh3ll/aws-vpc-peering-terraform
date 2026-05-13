import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import { useNavigate } from 'react-router-dom'
import ConfirmDeleteModal from '~/components/Admin/ModalDelete/ConfirmDeleteModal'
import SubscriptionTable from '~/components/Admin/Subcription/SubcriptionTable'

const workspaceOptions = [
  { id: 'WKS001', title: 'Main Workspace' },
  { id: 'WKS002', title: 'Marketing Workspace' },
  { id: 'WKS003', title: 'Design Workspace' }
]

const planOptions = [
  { id: 'PLAN001', title: 'Basic Plan' },
  { id: 'PLAN002', title: 'Standard Plan' },
  { id: 'PLAN003', title: 'Premium Plan' }
]

const mockSubscriptions = [
  {
    _id: 'SUB001',
    workspaceId: 'WKS001',
    planId: 'PLAN001',
    planFeatureSnapshot: '3 boards, 10 users, basic permissions',
    status: 'active',
    startAt: '2026-03-01',
    endAt: '2026-04-01',
    cancelAt: ''
  },
  {
    _id: 'SUB002',
    workspaceId: 'WKS002',
    planId: 'PLAN003',
    planFeatureSnapshot: 'Unlimited boards, unlimited users, premium support',
    status: 'inactive',
    startAt: '2026-01-15',
    endAt: '2027-01-15',
    cancelAt: '2026-02-20'
  }
]

function getWorkspaceTitle(workspaceId) {
  return (
    workspaceOptions.find((item) => item.id === workspaceId)?.title || workspaceId
  )
}

function getPlanTitle(planId) {
  return planOptions.find((item) => item.id === planId)?.title || planId
}

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)

  const filteredSubscriptions = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return subscriptions

    return subscriptions.filter((item) => {
      return (
        getWorkspaceTitle(item.workspaceId).toLowerCase().includes(keyword) ||
        getPlanTitle(item.planId).toLowerCase().includes(keyword) ||
        item.planFeatureSnapshot.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        item.startAt.toLowerCase().includes(keyword) ||
        item.endAt.toLowerCase().includes(keyword) ||
        (item.cancelAt || '').toLowerCase().includes(keyword)
      )
    })
  }, [search, subscriptions])

  const paginatedSubscriptions = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return filteredSubscriptions.slice(start, end)
  }, [filteredSubscriptions, page, rowsPerPage])

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDeleteModal = (subscription) => {
    setSelectedSubscription(subscription)
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedSubscription(null)
  }

  const handleConfirmDelete = () => {
    if (!selectedSubscription) return
    setSubscriptions((prev) =>
      prev.filter((item) => item._id !== selectedSubscription._id)
    )
    handleCloseDeleteModal()
  }

  const handleEditSubscription = (subscription) => {
    navigate(`/admin/subscription/update/${subscription._id}`, {
      state: { subscriptionData: subscription }
    })
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{ fontSize: '40px', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}
          >
            Subscription
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '22px', color: '#374151' }}>
            Manage your subscription collection
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate('/admin/subscription/create')}
          sx={{
            textTransform: 'none',
            px: 3,
            py: 1.2,
            fontSize: '18px',
            fontWeight: 500,
            borderRadius: '8px',
            color: '#ffffff',
            backgroundColor: '#ea6b3d',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#dc5f31',
              boxShadow: 'none'
            }
          }}
        >
          Add Subscription
        </Button>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search subscriptions..."
          size="small"
          sx={{
            width: 250,
            '& .MuiOutlinedInput-root': {
              height: 38,
              borderRadius: '8px',
              backgroundColor: '#fff'
            },
            '& .MuiInputBase-input': {
              fontSize: '15px'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />

        <Stack direction="row" spacing={1.2}>
          <Button
            variant="outlined"
            startIcon={<FilterListOutlinedIcon />}
            sx={{
              textTransform: 'none',
              color: '#374151',
              borderColor: '#6b7280',
              backgroundColor: '#fff',
              borderRadius: '8px',
              px: 2,
              minWidth: 'auto',
              '&:hover': {
                borderColor: '#4b5563',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Filter
          </Button>

          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{
              textTransform: 'none',
              color: '#374151',
              borderColor: '#6b7280',
              backgroundColor: '#fff',
              borderRadius: '8px',
              px: 2,
              minWidth: 'auto',
              '&:hover': {
                borderColor: '#4b5563',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Excel
          </Button>

          <Button
            variant="outlined"
            startIcon={<PictureAsPdfOutlinedIcon />}
            sx={{
              textTransform: 'none',
              color: '#374151',
              borderColor: '#6b7280',
              backgroundColor: '#fff',
              borderRadius: '8px',
              px: 2,
              minWidth: 'auto',
              '&:hover': {
                borderColor: '#4b5563',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            PDF
          </Button>
        </Stack>
      </Stack>

      <SubscriptionTable
        subscriptions={paginatedSubscriptions}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredSubscriptions.length}
        getWorkspaceTitle={getWorkspaceTitle}
        getPlanTitle={getPlanTitle}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleEditSubscription}
        onDelete={handleOpenDeleteModal}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Delete Subscription"
        description="Are you sure you want to delete this subscription?"
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  )
}