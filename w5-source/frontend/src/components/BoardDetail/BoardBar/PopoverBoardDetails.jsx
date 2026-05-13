import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import BoardModal from '../BoardModal/BoardModal'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, IconButton, Divider } from '@mui/material'
import AddToPhotosOutlinedIcon from '@mui/icons-material/AddToPhotosOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CloseIcon from '@mui/icons-material/Close'
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'

export default function PopoverBoardDetails({
  boardPopover,
  boardModal,
  columnCollapseMode,
  onCollapseAllColumns,
  onExpandAllColumns
}) {
  const {
    anchorEl,
    openMoreOption,
    handleCloseMoreOption,
    handleOpenLabelList,
    handleOpenActivityList,
    handleOpenArchivedList
  } = boardPopover
  const { handleOpen } = boardModal

  const handleOpenModal = () => {
    handleCloseMoreOption()
    handleOpen()
  }

  const isAllCollapsed = columnCollapseMode === 'collapse'

  const handleToggleLists = () => {
    if (isAllCollapsed) {
      onExpandAllColumns()
    } else {
      onCollapseAllColumns()
    }
  }

  const menuItemSx = {
    width: '100%',
    px: 1.5,
    py: 1.2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1.5,
    borderRadius: 2.5,
    textTransform: 'none',
    color: (theme) => (theme.palette.mode === 'dark' ? '#d0d4db' : '#172b4d'),
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f2f4'
    }
  }

  return (
    <div>
      <Popover
        open={openMoreOption}
        anchorEl={anchorEl}
        onClose={handleCloseMoreOption}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 360,
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 32px rgba(0,0,0,0.45)'
                : '0 12px 32px rgba(15, 23, 42, 0.12)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#1f2229' : '#ffffff',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(9,30,66,0.08)'
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 1.75,
            px: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#242830' : '#fbfbfc'
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 0.2,
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#f1f5f9' : '#172b4d'
            }}
          >
            Menu
          </Typography>

          <IconButton
            onClick={handleCloseMoreOption}
            size="small"
            sx={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 30,
              height: 30,
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#9aa4b2' : '#5e6c84',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(9,30,66,0.08)',
                color: (theme) =>
                  theme.palette.mode === 'dark' ? '#ffffff' : '#172b4d'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Divider
          sx={{
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(9,30,66,0.08)'
          }}
        />

        <Box sx={{ p: 1.5 }}>
          <Button
            onClick={handleOpenModal}
            sx={{
              width: '100%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#2b3038' : '#f4f5f7',
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#fff' : '#172b4d',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? '#343a44' : '#ebedf0'
              }
            }}
          >
            <InfoOutlinedIcon
              sx={{
                fontSize: 21,
                color: (theme) =>
                  theme.palette.mode === 'dark' ? '#cbd5e1' : '#44546f'
              }}
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#fff' : '#172b4d'
                }}
              >
                About this board
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  lineHeight: 1.25,
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#94a3b8' : '#5e6c84'
                }}
              >
                Update info, members, and board settings
              </Typography>
            </Box>
          </Button>

          <Box sx={{ mt: 1 }}>
            <Button
              sx={{ ...menuItemSx, mt: 0.5 }}
              onClick={handleOpenLabelList}
            >
              <LocalOfferOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                Labels
              </Typography>
            </Button>

            <Button
              sx={{ ...menuItemSx, mt: 0.5 }}
              onClick={handleOpenActivityList}
            >
              <HistoryOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                Activity
              </Typography>
            </Button>

            <Button
              sx={{ ...menuItemSx, mt: 0.5 }}
              onClick={handleOpenArchivedList}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                Archived items
              </Typography>
            </Button>

            <Button
              onClick={handleToggleLists}
              sx={{
                width: '100%',
                mt: 1,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                color: (theme) =>
                  theme.palette.mode === 'dark' ? '#e2e8f0' : '#172b4d',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#343a44' : '#ebedf0'
                }
              }}
            >
              {isAllCollapsed ? (
                <OpenInFullOutlinedIcon sx={{ fontSize: 20 }} />
              ) : (
                <CloseFullscreenIcon sx={{ fontSize: 20 }} />
              )}

              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {isAllCollapsed ? 'Expand all lists' : 'Collapse all lists'}
              </Typography>
            </Button>
          </Box>
        </Box>
      </Popover>

      <BoardModal boardModal={boardModal} />
    </div>
  )
}
