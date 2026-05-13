import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ConfirmDeleteModal from '~/components/Admin/ModalDelete/ConfirmDeleteModal'
import BackgroundTable from '~/components/Admin/Background/BackgroundTable'
import { useAdminBackground } from '~/hooks/adminBackground.hook'

export default function BackgroundPage() {
  const {
    search,
    page,
    rowsPerPage,
    backgrounds,
    totalCount,
    deleteModalOpen,
    selectedBackground,
    handleSearchChange,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleEditBackground,
    handleCreateBackground,
    handleUpdateBlockBackground
  } = useAdminBackground()

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
            Background
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: '22px',
              color: '#374151'
            }}
          >
            Manage your background collection
          </Typography>
        </Box>

        <Button
          variant='contained'
          onClick={handleCreateBackground}
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
          Add Background
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
          onChange={handleSearchChange}
          placeholder='Search backgrounds...'
          size='small'
          sx={{
            width: 250,
            '& .MuiOutlinedInput-root': {
              height: 38,
              borderRadius: '8px',
              backgroundColor: '#fff'
            },
            '& .MuiInputBase-input': {
              fontSize: '15px',
              color: '#111827'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ color: '#000000', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />

      </Stack>

      <BackgroundTable
        backgrounds={backgrounds}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleEditBackground}
        onDelete={handleOpenDeleteModal}
        onUpdateBlock={handleUpdateBlockBackground}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title='Delete Background'
        description={
          selectedBackground
            ? `Are you sure you want to delete background "${selectedBackground.title}"?`
            : 'Are you sure you want to delete this background?'
        }
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  )
}