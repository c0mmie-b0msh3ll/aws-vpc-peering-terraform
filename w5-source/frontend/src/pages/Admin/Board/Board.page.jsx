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
import BoardTable from '~/components/Admin/Board/BoardTable'

const workspaceOptions = [
  { id: 'WKS001', title: 'Main Workspace' },
  { id: 'WKS002', title: 'Marketing Workspace' },
  { id: 'WKS003', title: 'Design Workspace' }
]

const ownerOptions = [
  { id: 'USR001', displayName: 'Nguyen Truong Phuc' },
  { id: 'USR002', displayName: 'System Admin' },
  { id: 'USR003', displayName: 'Content Editor' }
]

const backgroundOptions = [
  {
    id: 'BG001',
    title: 'Ocean Blue',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
  },
  {
    id: 'BG002',
    title: 'Mountain View',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
  },
  {
    id: 'BG003',
    title: 'Dark Pattern',
    image: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482'
  }
]

const mockBoards = [
  {
    _id: 'BRD001',
    workspaceId: 'WKS001',
    title: 'Project Alpha Board',
    description: 'Main board for alpha project planning.',
    ownerId: 'USR001',
    visibility: 'workspace',
    backgroundId: 'BG001',
    type: 'normal',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    status: 'active'
  },
  {
    _id: 'BRD002',
    workspaceId: 'WKS002',
    title: 'Marketing Campaign Board',
    description: 'Track marketing activities and campaign progress.',
    ownerId: 'USR002',
    visibility: 'public',
    backgroundId: 'BG002',
    type: 'template',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    status: 'inactive'
  }
]

function getWorkspaceTitle(workspaceId) {
  return workspaceOptions.find((item) => item.id === workspaceId)?.title || workspaceId
}

function getOwnerName(ownerId) {
  return ownerOptions.find((item) => item.id === ownerId)?.displayName || ownerId
}

function getBackgroundTitle(backgroundId) {
  return backgroundOptions.find((item) => item.id === backgroundId)?.title || backgroundId
}

export default function BoardPages() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [boards, setBoards] = useState(mockBoards)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState(null)

  const filteredBoards = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return boards

    return boards.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        getWorkspaceTitle(item.workspaceId).toLowerCase().includes(keyword) ||
        getOwnerName(item.ownerId).toLowerCase().includes(keyword) ||
        item.visibility.toLowerCase().includes(keyword) ||
        item.type.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        getBackgroundTitle(item.backgroundId).toLowerCase().includes(keyword)
      )
    })
  }, [search, boards])

  const paginatedBoards = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return filteredBoards.slice(start, end)
  }, [filteredBoards, page, rowsPerPage])

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDeleteModal = (board) => {
    setSelectedBoard(board)
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedBoard(null)
  }

  const handleConfirmDelete = () => {
    if (!selectedBoard) return
    setBoards((prev) => prev.filter((item) => item._id !== selectedBoard._id))
    handleCloseDeleteModal()
  }

  const handleEditBoard = (board) => {
    navigate(`/admin/board/update/${board._id}`, {
      state: { boardData: board }
    })
  }

  return (
    <Box>
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '40px', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
            Board
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '22px', color: '#374151' }}>
            Manage your board collection
          </Typography>
        </Box>

        <Button
          variant='contained'
          onClick={() => navigate('/admin/board/create')}
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
          Add Board
        </Button>
      </Stack>

      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search boards...'
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

      <BoardTable
        boards={paginatedBoards}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredBoards.length}
        getWorkspaceTitle={getWorkspaceTitle}
        getOwnerName={getOwnerName}
        getBackgroundTitle={getBackgroundTitle}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleEditBoard}
        onDelete={handleOpenDeleteModal}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title='Delete Board'
        description={
          selectedBoard
            ? `Are you sure you want to delete board "${selectedBoard.title}"?`
            : 'Are you sure you want to delete this board?'
        }
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  )
}