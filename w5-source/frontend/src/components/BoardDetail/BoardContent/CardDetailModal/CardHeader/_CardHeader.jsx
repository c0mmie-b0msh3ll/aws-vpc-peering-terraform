import Typography from '@mui/material/Typography'
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import cardCoverColor from '~/constant/cardCoverColor'
import CardCoverPopper from './CardCoverPopper'
import Box from '@mui/material/Box'
import MoreOptionPopper from './MoreOptionPopper'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import dayjs from 'dayjs'
import { useState, useRef } from 'react'

const coverActionButtonSx = {
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  cursor: 'pointer',
  flexShrink: 0,
  bgcolor: 'rgba(255,255,255,0.92)',
  color: (theme) => (theme.palette.mode === 'dark' ? '#1f2328' : '#172b4d'),
  boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
  transition: 'all 0.2s ease',
  '&:hover': {
    bgcolor: '#fff',
    transform: 'scale(1.06)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.16)'
  }
}

const coverActionIconSx = { fontSize: 20 }

function CoverActionButton({ children, onClick }) {
  return (
    <Box onClick={onClick} sx={coverActionButtonSx}>
      {children}
    </Box>
  )
}

function CardHeader({ data, handler }) {
  const { columnName, status, memberIds, cover, archivedAt } = data
  const {
    handleCloseModal,
    handleUpdateCover,
    handleArchiveCard,
    handleRestoreCard,
    handleDeleteCard,
    handleJoinCard,
    handleLeaveCard
  } = handler
  const [coverPopperOpen, setCoverPopperOpen] = useState(false)
  const [moreOptionPopperOpen, setMorOptionPopperOpen] = useState(false)
  const imageButtonRef = useRef(null)
  const moreOptionButtonRef = useRef(null)

  const handleToggleCoverPopper = () => setCoverPopperOpen((prev) => !prev)

  const handleCloseCoverPopper = () => setCoverPopperOpen(false)

  const handleToggleMoreOptionPopper = () =>
    setMorOptionPopperOpen((prev) => !prev)

  const handleCloseMoreOptionPopper = () => setMorOptionPopperOpen(false)

  const customDeleteCard = async () => {
    await handleDeleteCard()
    handleCloseMoreOptionPopper()
  }

  return (
    <Box sx={{ mt: -5, mr: -2.5, ml: -2.5 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: 70,
          maxHeight: 200,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
          bgcolor:
            cover?.type === 'attachment'
              ? (theme) =>
                  theme.palette.mode === 'dark' ? '#6f8fb0' : '#7d9cbc'
              : 'transparent'
        }}
      >
        <Box
          sx={{
            width: '100%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden'
          }}
        >
          {cover?.type === 'attachment' ? (
            <Box
              component="img"
              src={cover?.value}
              alt="card-cover"
              sx={{
                height: 200,
                display: 'block',
                mx: 'auto'
              }}
            />
          ) : cover?.type === 'color' ? (
            <Box
              sx={{
                height: 140,
                width: '100%',
                bgcolor: (theme) =>
                  cardCoverColor?.[cover?.value]?.[theme.palette.mode]
              }}
            />
          ) : null}
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.25,
            py: 0.5,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.92)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.12)'
          }}
        >
          <Typography
            sx={{
              color: '#172b4d',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: 1
            }}
          >
            {columnName}
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box ref={imageButtonRef}>
            <CoverActionButton onClick={handleToggleCoverPopper}>
              <ImageOutlinedIcon sx={coverActionIconSx} />
            </CoverActionButton>
          </Box>

          <Box ref={moreOptionButtonRef}>
            <CoverActionButton onClick={handleToggleMoreOptionPopper}>
              <MoreHorizOutlinedIcon sx={coverActionIconSx} />
            </CoverActionButton>
          </Box>

          <CoverActionButton onClick={handleCloseModal}>
            <CloseOutlinedIcon sx={coverActionIconSx} />
          </CoverActionButton>
        </Box>
      </Box>

      {status === 'archived' && (
        <Box
          sx={{
            height: '60px',
            bgcolor: '#4B4D51',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            color: 'white'
          }}
        >
          <DeleteOutlinedIcon />
          <Typography variant="h6">
            {archivedAt
              ? `This card was archived on ${dayjs(archivedAt).format('MMM D, YYYY [at] h:mm A')}`
              : ''}
          </Typography>
        </Box>
      )}

      {/* Cover Popper */}
      <CardCoverPopper
        cover={cover}
        anchorEl={imageButtonRef.current}
        open={coverPopperOpen}
        onClose={handleCloseCoverPopper}
        handleUpdateCover={handleUpdateCover}
      />

      <MoreOptionPopper
        status={status}
        memberIds={memberIds}
        anchorEl={moreOptionButtonRef.current}
        open={moreOptionPopperOpen}
        onClose={handleCloseMoreOptionPopper}
        handleArchiveCard={handleArchiveCard}
        handleRestoreCard={handleRestoreCard}
        handleDeleteCard={customDeleteCard}
        handleJoinCard={handleJoinCard}
        handleLeaveCard={handleLeaveCard}
      />

      {/* More option Popper */}
    </Box>
  )
}

export default CardHeader
