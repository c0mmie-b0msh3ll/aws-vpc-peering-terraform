import React, { useMemo, useState } from 'react'
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
import WorkspaceTable from '~/components/Admin/Workspace/WorkspaceTable'

const ownerOptions = [
  { id: 'USR001', displayName: 'Nguyen Truong Phuc' },
  { id: 'USR002', displayName: 'System Admin' },
  { id: 'USR003', displayName: 'Content Editor' },
  { id: 'USR004', displayName: 'Workspace Manager' }
]

const mockWorkspaces = [
  {
    _id: 'WKS001',
    title: 'Main Workspace',
    description: 'Default workspace for managing all system resources.',
    ownerId: 'USR001',
    status: 'active'
  },
  {
    _id: 'WKS002',
    title: 'Marketing Workspace',
    description: 'Workspace used for campaign planning and asset tracking.',
    ownerId: 'USR002',
    status: 'active'
  },
  {
    _id: 'WKS003',
    title: 'Design Workspace',
    description: 'Workspace for design system files and visual collaboration.',
    ownerId: 'USR003',
    status: 'inactive'
  },
  {
    _id: 'WKS004',
    title: 'Product Workspace',
    description: 'Workspace for product roadmap and internal planning.',
    ownerId: 'USR004',
    status: 'active'
  }
]

function getOwnerName(ownerId) {
  return ownerOptions.find((item) => item.id === ownerId)?.displayName || ownerId
}

export default function WorkspacePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [workspaces, setWorkspaces] = useState(mockWorkspaces)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)

  const filteredWorkspaces = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return workspaces

    return workspaces.filter((item) => {
      return (
        item._id.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.ownerId.toLowerCase().includes(keyword) ||
        getOwnerName(item.ownerId).toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword)
      )
    })
  }, [search, workspaces])

  const paginatedWorkspaces = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return filteredWorkspaces.slice(start, end)
  }, [filteredWorkspaces, page, rowsPerPage])

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDeleteModal = (workspace) => {
    setSelectedWorkspace(workspace)
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedWorkspace(null)
  }

  const handleConfirmDelete = () => {
    if (!selectedWorkspace) return

    setWorkspaces((prev) => prev.filter((item) => item._id !== selectedWorkspace._id))
    handleCloseDeleteModal()
  }

  const handleEditWorkspace = (workspace) => {
    navigate(`/admin/workspace/update/${workspace._id}`, {
      state: { workspaceData: workspace }
    })
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
            Workspace
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: '22px',
              color: '#374151'
            }}
          >
            Manage your workspace collection
          </Typography>
        </Box>

        <Button
          variant='contained'
          onClick={() => navigate('/admin/workspace/create')}
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
          Add Workspace
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
          placeholder='Search workspaces...'
          size='small'
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

      <WorkspaceTable
        workspaces={paginatedWorkspaces}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredWorkspaces.length}
        getOwnerName={getOwnerName}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleEditWorkspace}
        onDelete={handleOpenDeleteModal}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title='Delete Workspace'
        description={
          selectedWorkspace
            ? `Are you sure you want to delete workspace "${selectedWorkspace.title}"?`
            : 'Are you sure you want to delete this workspace?'
        }
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  )
}