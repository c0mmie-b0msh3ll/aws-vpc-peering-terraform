import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import { useNavigate } from 'react-router-dom'
import ConfirmDeleteModal from '~/components/Admin/ModalDelete/ConfirmDeleteModal'
import PlanTable from '~/components/Admin/Plan/PlanTable'

const mockPlans = [
  {
    _id: 'PLAN001',
    title: 'Basic Plan',
    feature: {
      capabilities: {
        workspace: {
          customRole: false,
          maxRoles: 2
        },
        board: {
          createPrivateBoard: false
        },
        column: {
          customColor: false
        }
      },
      limits: {
        maxMembers: 5,
        maxBoards: 3,
        maxColumnsPerBoard: 20,
        maxCardsPerBoard: 100,
        maxStorageMb: 512,
        maxFileSizeMb: 5,
        maxAttachmentsPerCard: 3
      }
    },
    billingCycle: 'monthly',
    description: 'Suitable for new users who need essential features to get started.',
    originPrice: 29.99,
    currentPrice: 19.99,
    status: 'active'
  },
  {
    _id: 'PLAN002',
    title: 'Standard Plan',
    feature: {
      capabilities: {
        workspace: {
          customRole: true,
          maxRoles: 5
        },
        board: {
          createPrivateBoard: true
        },
        column: {
          customColor: true
        }
      },
      limits: {
        maxMembers: 20,
        maxBoards: 10,
        maxColumnsPerBoard: 50,
        maxCardsPerBoard: 500,
        maxStorageMb: 2048,
        maxFileSizeMb: 20,
        maxAttachmentsPerCard: 10
      }
    },
    billingCycle: 'monthly',
    description: 'Includes additional workspace and permission management features.',
    originPrice: 49.99,
    currentPrice: 39.99,
    status: 'active'
  },
  {
    _id: 'PLAN003',
    title: 'Premium Plan',
    feature: {
      capabilities: {
        workspace: {
          customRole: true,
          maxRoles: 20
        },
        board: {
          createPrivateBoard: true
        },
        column: {
          customColor: true
        }
      },
      limits: {
        maxMembers: 100,
        maxBoards: 50,
        maxColumnsPerBoard: 100,
        maxCardsPerBoard: 5000,
        maxStorageMb: 10240,
        maxFileSizeMb: 100,
        maxAttachmentsPerCard: 30
      }
    },
    billingCycle: 'yearly',
    description: 'Advanced plan for teams that need full access to all premium modules.',
    originPrice: 99.99,
    currentPrice: 79.99,
    status: 'active'
  },
  {
    _id: 'PLAN004',
    title: 'Enterprise Plan',
    feature: {
      capabilities: {
        workspace: {
          customRole: true,
          maxRoles: 100
        },
        board: {
          createPrivateBoard: true
        },
        column: {
          customColor: true
        }
      },
      limits: {
        maxMembers: 500,
        maxBoards: 200,
        maxColumnsPerBoard: 200,
        maxCardsPerBoard: 20000,
        maxStorageMb: 51200,
        maxFileSizeMb: 500,
        maxAttachmentsPerCard: 100
      }
    },
    billingCycle: 'yearly',
    description: 'Best for large organizations with custom requirements and support.',
    originPrice: 199.99,
    currentPrice: 149.99,
    status: 'inactive'
  }
]

export default function PlanPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [plans, setPlans] = useState(mockPlans)

  const handleOpenDeleteModal = (plan) => {
    setSelectedPlan(plan)
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedPlan(null)
  }

  const handleConfirmDelete = () => {
    if (!selectedPlan) return

    setPlans((prev) => prev.filter((item) => item._id !== selectedPlan._id))
    handleCloseDeleteModal()
  }

  const filteredPlans = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return plans

    return plans.filter((plan) => {
      return (
        plan._id.toLowerCase().includes(keyword) ||
        plan.title.toLowerCase().includes(keyword) ||
        JSON.stringify(plan.feature).toLowerCase().includes(keyword) ||
        plan.billingCycle.toLowerCase().includes(keyword) ||
        plan.description.toLowerCase().includes(keyword) ||
        plan.status.toLowerCase().includes(keyword)
      )
    })
  }, [search, plans])

  const paginatedPlans = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return filteredPlans.slice(start, end)
  }, [filteredPlans, page, rowsPerPage])

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='flex-start'
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '40px',
              fontWeight: 600,
              color: '#111827',
              lineHeight: 1.2
            }}
          >
            Plan
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: '22px',
              color: '#374151'
            }}
          >
            Manage your plan collection
          </Typography>
        </Box>

        <Button
          variant='contained'
          onClick={() => navigate('/admin/plan/create')}
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
          Add Plan
        </Button>
      </Stack>

      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 2 }}
      >
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search plans...'
          size='small'
          sx={{
            '& .MuiInputLabel-root': {
              color: '#6b7280'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ea6b3d'
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              color: '#111827',
              '& fieldset': {
                borderColor: '#d1d5db'
              },
              '&:hover fieldset': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ea6b3d'
              }
            },
            '& .MuiInputBase-input': {
              color: '#111827'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />

        <Stack direction='row' spacing={1.2}>
          <Button
            variant='outlined'
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
            variant='outlined'
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
            variant='outlined'
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

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}
      >
        <PlanTable
          plans={paginatedPlans}
          page={page}
          rowsPerPage={rowsPerPage}
          onEdit={(plan) =>
            navigate(`/admin/plan/update/${plan._id}`, {
              state: { planData: plan }
            })
          }
          onDelete={handleOpenDeleteModal}
        />

        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{
            px: 1,
            py: 1,
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#fff'
          }}
        >
          <Typography sx={{ pl: 1, fontSize: '15px', color: '#111827' }}>
            Showing plan per page
          </Typography>

          <TablePagination
            component='div'
            count={filteredPlans.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 8, 10]}
            labelRowsPerPage=''
            sx={{
              '.MuiTablePagination-toolbar': {
                minHeight: 40,
                paddingLeft: 0
              },
              '.MuiTablePagination-selectLabel': {
                display: 'none'
              }
            }}
          />
        </Stack>
      </Paper>

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title='Delete Plan'
        description={
          selectedPlan
            ? `Are you sure you want to delete plan "${selectedPlan.title}"?`
            : 'Are you sure you want to delete this plan?'
        }
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  )
}