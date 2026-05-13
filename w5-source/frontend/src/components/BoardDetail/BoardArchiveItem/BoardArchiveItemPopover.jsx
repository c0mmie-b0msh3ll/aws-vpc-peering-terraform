import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Popover from '@mui/material/Popover'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined'
import CropPortraitOutlinedIcon from '@mui/icons-material/CropPortraitOutlined'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  deleteColumnAPI,
  fetchArchivedCardsAPI,
  fetchArchivedColumnsAPI,
  restoreColumnAPI
} from '~/apis/board.api'
import { useDispatch } from 'react-redux'
import {
  deleteCardAPI,
  restoreCardAPI
} from '~/redux/activeCard/activeCardSlice'
import {
  restoreCardInBoard,
  restoreColumnInBoard
} from '~/redux/activeBoard/activeBoardSlice'

function BoardArchivedItemsPopover({ open, anchorEl, onClose }) {
  const dispatch = useDispatch()
  const { boardId } = useParams()

  const [activeType, setActiveType] = useState('card')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [archivedCards, setArchivedCards] = useState([])
  const [archivedColumns, setArchivedColumns] = useState([])

  const displayedItems = useMemo(() => {
    const source = activeType === 'card' ? archivedCards : archivedColumns
    const q = keyword.trim().toLowerCase()

    if (!q) return source

    return source.filter((item) =>
      (item?.title || '').toLowerCase().includes(q)
    )
  }, [activeType, keyword, archivedCards, archivedColumns])

  const fetchArchivedItems = async () => {
    try {
      setLoading(true)
      const [cards, columns] = await Promise.all([
        fetchArchivedCardsAPI({ boardId }),
        fetchArchivedColumnsAPI({ boardId })
      ])
      setArchivedCards(cards || [])
      setArchivedColumns(columns || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && boardId) fetchArchivedItems()
  }, [open, boardId])

  const handleChangeType = (_, value) => {
    if (!value) return
    setActiveType(value)
    setKeyword('')
  }

  const handleRestoreCard = async ({ cardId }) => {
    const updatedCard = await dispatch(restoreCardAPI({ _id: cardId, boardId }))
    dispatch(restoreCardInBoard(updatedCard.payload.card))
  }

  const handleRestoreColumn = async ({ columnId }) => {
    const updatedColumn = await restoreColumnAPI({ columnId, boardId })
    dispatch(restoreColumnInBoard(updatedColumn))
  }

  const handleDeleteCard = async ({ cardId }) => {
    await dispatch(deleteCardAPI({ _id: cardId, boardId }))
  }

  const handleDeleteColumn = async ({ columnId }) => {
    await deleteColumnAPI({ columnId, boardId })
  }

  const handleRestore = async (item) => {
    if (activeType === 'card') {
      await handleRestoreCard({ cardId: item._id })
      setArchivedCards((prev) => prev.filter((c) => c._id !== item._id))
      return
    }
    await handleRestoreColumn({ columnId: item._id })
    setArchivedColumns((prev) => prev.filter((c) => c._id !== item._id))
  }

  const handleDelete = async (item) => {
    if (activeType === 'card') {
      await handleDeleteCard({ cardId: item._id })
      setArchivedCards((prev) => prev.filter((c) => c._id !== item._id))
      return
    }
    await handleDeleteColumn({ columnId: item._id })
    setArchivedColumns((prev) => prev.filter((c) => c._id !== item._id))
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            mt: 1,
            width: 400,
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: 3,
            overflow: 'hidden',
            color: theme.palette.mode === 'dark' ? '#f1f2f4' : '#172b4d',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 12px 28px rgba(0,0,0,0.45)'
                : '0 12px 28px rgba(9,30,66,0.18)'
          })
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 1
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            Archived items
          </Typography>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Tabs
          value={activeType}
          onChange={handleChangeType}
          variant="fullWidth"
          sx={{ minHeight: 40, mb: 1.5 }}
        >
          <Tab
            value="card"
            icon={<CropPortraitOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Cards"
            sx={{ minHeight: 40, textTransform: 'none' }}
          />
          <Tab
            value="column"
            icon={<ViewKanbanOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Columns"
            sx={{ minHeight: 40, textTransform: 'none' }}
          />
        </Tabs>

        <TextField
          fullWidth
          size="small"
          placeholder={`Search archived ${activeType}s...`}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ mb: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />

        <Box
          sx={{
            maxHeight: 520,
            overflowY: 'auto',
            pr: 0.5
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 4,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : displayedItems.length === 0 ? (
            <Typography
              sx={{
                py: 3,
                textAlign: 'center',
                fontSize: 14,
                color: 'text.secondary'
              }}
            >
              No archived {activeType}s found.
            </Typography>
          ) : (
            displayedItems.map((item) => (
              <Box
                key={item._id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  py: 1.25,
                  borderBottom: (theme) =>
                    `1px solid ${
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(9,30,66,0.08)'
                    }`
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      wordBreak: 'break-word'
                    }}
                  >
                    {item?.title || 'Untitled'}
                  </Typography>

                  {activeType === 'card' && item?.columnTitle && (
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: 12,
                        color: 'text.secondary'
                      }}
                    >
                      In column: {item.columnTitle}
                    </Typography>
                  )}
                </Box>

                <Button
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => handleDelete(item)}
                  sx={{ textTransform: 'none', flexShrink: 0 }}
                >
                  Delete
                </Button>

                <Button
                  size="small"
                  variant="text"
                  onClick={() => handleRestore(item)}
                  sx={{ textTransform: 'none', flexShrink: 0 }}
                >
                  Restore
                </Button>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Popover>
  )
}

export default BoardArchivedItemsPopover
