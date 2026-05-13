import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCopy from '@mui/icons-material/ContentCopy'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import useColumn from '~/hooks/column.hook'
import { useEffect, useState } from 'react'
import { blue } from '@mui/material/colors'
import columnBackgroundColor from '~/constant/columnBackgroundColor'
import columnBackgroundConfig from '~/constant/columnBackgroundConfig'
import CheckIcon from '@mui/icons-material/Check'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'

function Column({ column, columnCollapseMode, clearColumnCollapseMode }) {
  const colorEntries = Object.entries(columnBackgroundConfig)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const {
    setNodeRef,
    dndKitColumnStyles,
    attributes,
    listeners,
    anchorEl,
    open,
    handleClick,
    handleClose,
    orderedCards,
    openNewCardForm,
    toggleOpenNewCardForm,
    newCardTitle,
    setNewCardTitle,
    addNewCard,
    handleArchiveColumn,
    onUpdateColumnTitle,
    onUpdateColumnColor,
    truncateText
  } = useColumn({ column })

  const toggleCollapseColumn = (e) => {
    e.stopPropagation()
    clearColumnCollapseMode()
    setIsCollapsed((prev) => !prev)
  }

  useEffect(() => {
    if (columnCollapseMode === 'collapse') {
      setIsCollapsed(true)
    }

    if (columnCollapseMode === 'expand') {
      setIsCollapsed(false)
    }
  }, [columnCollapseMode])

  if (isCollapsed) {
    return (
      <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
        <Box
          onClick={toggleCollapseColumn}
          sx={{
            width: '40px',
            minWidth: '40px',
            minHeight: '112px',
            height: 'auto',
            ml: 2,
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? columnBackgroundColor[column.color].dark
                : columnBackgroundColor[column.color].light,
            '&:hover': { cursor: 'pointer' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 1,
            gap: 1,
            pb: 2
          }}
        >
          <Tooltip title="Expand list">
            <IconButton
              size="small"
              onClick={toggleCollapseColumn}
              sx={{ p: 0.5 }}
            >
              <OpenInFullOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontWeight: 600,
              fontSize: '14px',
              userSelect: 'none'
            }}
          >
            {column?.title}
          </Box>
          <Box
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontWeight: 600,
              fontSize: '14px',
              userSelect: 'none'
            }}
          >
            {/* SỐ CARD CÓ TRONG BOARD  */}
            <Typography>{column?.cards.length}</Typography>
          </Box>
        </Box>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? columnBackgroundColor[column.color].dark
              : columnBackgroundColor[column.color].light,
          color: '#ebecf0',
          ml: 2,
          borderRadius: 4,
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        {/* Box Column Header */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <ToggleFocusInput
            value={truncateText(column?.title, 20)}
            onChangedValue={onUpdateColumnTitle}
            data-no-dnd="true"
          />
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Tooltip title="Collapse list">
                <IconButton
                  size="small"
                  onClick={toggleCollapseColumn}
                  sx={{ height: '35px', width: '35px', borderRadius: '5px' }}
                >
                  <CloseFullscreenIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              <IconButton
                sx={{ height: '35px', width: '35px', borderRadius: '5px' }}
              >
                <Tooltip title="More options">
                  <ExpandMoreIcon
                    sx={{ color: 'text.primary', cursor: 'pointer' }}
                    id="basic-column-dropdown"
                    aria-controls={
                      open ? 'basic-menu-column-dropdown' : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                  />
                </Tooltip>
              </IconButton>
            </Box>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown',
                sx: { p: 0 }
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 285,
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#1f2229' : '#ffffff',
                  border: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '1px solid rgba(255,255,255,0.06)'
                      : '1px solid rgba(9,30,66,0.08)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 10px 24px rgba(0,0,0,0.38)'
                      : '0 10px 24px rgba(15,23,42,0.10)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 1.2,
                  px: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#242830' : '#fbfbfc'
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#f1f5f9' : '#172b4d'
                  }}
                >
                  List Options
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClose()
                  }}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 26,
                    height: 26,
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#9aa4b2' : '#5e6c84',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(9,30,66,0.08)',
                      color: (theme) =>
                        theme.palette.mode === 'dark' ? '#fff' : '#172b4d'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
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

              <Box sx={{ p: 0.75 }}>
                <MenuItem
                  onClick={toggleOpenNewCardForm}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1,
                    mb: 0.25,
                    minHeight: 38
                  }}
                >
                  <ListItemIcon>
                    <AddCardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Add card" />
                </MenuItem>

                <MenuItem
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1,
                    mb: 0.25,
                    minHeight: 38
                  }}
                >
                  <ListItemIcon>
                    <ContentCopy fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Copy list" />
                </MenuItem>

                <MenuItem
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1,
                    mb: 0.75,
                    minHeight: 38
                  }}
                >
                  <ListItemIcon>
                    <DriveFileMoveOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Move list" />
                </MenuItem>

                <Box
                  sx={{
                    px: 1,
                    py: 1,
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? '#242830' : '#f8fafc',
                    border: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.05)'
                        : '1px solid rgba(9,30,66,0.06)'
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      mb: 1,
                      color: (theme) =>
                        theme.palette.mode === 'dark' ? '#f1f5f9' : '#172b4d'
                    }}
                  >
                    Change color
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 0.75
                    }}
                  >
                    {colorEntries.map(([name, value]) => {
                      const isSelected = column.color === name

                      return (
                        <Tooltip key={name} title={name}>
                          <Box
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateColumnColor(name)
                            }}
                            sx={{
                              position: 'relative',
                              width: '100%',
                              height: 24,
                              borderRadius: 1.5,
                              bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? value.dark
                                  : value.light,
                              border: (theme) => {
                                const bg =
                                  theme.palette.mode === 'dark'
                                    ? value.dark
                                    : value.light
                                if (isSelected)
                                  return name === 'white' || bg === '#fff'
                                    ? '1px solid rgba(128,128,128,0.35)'
                                    : 'none'
                              },
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                              opacity: isSelected ? 1 : 0.95,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isSelected
                                ? '0 0 0 2px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.18)'
                                : 'none',
                              '&:hover': {
                                transform: 'scale(1.04)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.16)',
                                opacity: 1
                              }
                            }}
                          >
                            {isSelected && (
                              <CheckIcon
                                sx={{
                                  fontSize: 16,
                                  color: (theme) =>
                                    theme.palette.mode === 'dark'
                                      ? '#ffffff'
                                      : '#111827'
                                }}
                              />
                            )}
                          </Box>
                        </Tooltip>
                      )
                    })}
                  </Box>
                </Box>
              </Box>

              <Divider
                sx={{
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(9,30,66,0.08)'
                }}
              />

              <Box sx={{ p: 0.75 }}>
                <MenuItem
                  onClick={handleArchiveColumn}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1,
                    minHeight: 38
                  }}
                >
                  <ListItemIcon>
                    <ArchiveOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Archive this column" />
                </MenuItem>
              </Box>
            </Menu>
          </Box>
        </Box>

        {/* List Cards */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#ced0da' },
            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#bfc2cf' }
          }}
        >
          <ListCards cards={orderedCards} />
        </Box>

        {/* Box Column Footer */}
        <Box sx={{ p: 2, flexShrink: 0 }}>
          {!openNewCardForm ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
                // p: 1
              }}
            >
              <Button
                startIcon={<AddCardIcon />}
                onClick={toggleOpenNewCardForm}
                sx={{
                  fontSize: '15px',
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#fff' : '#000'
                }}
              >
                Add new card
              </Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon
                  sx={{
                    cursor: 'pointer',
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#fff' : '#6b7280'
                  }}
                />
              </Tooltip>
            </Box>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <TextField
                multiline
                minRows={2}
                maxRows={6}
                autoFocus
                fullWidth
                variant="outlined"
                placeholder="Enter a title for this card..."
                data-no-dnd="true"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    addNewCard()
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    alignItems: 'flex-start',
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? '#22272b' : '#ffffff',
                    color: 'text.primary',
                    fontSize: '0.95rem',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 1px 0 rgba(255,255,255,0.04)'
                        : '0 1px 0 rgba(9, 30, 66, 0.08)',
                    '& textarea': {
                      padding: 0
                    },
                    '& fieldset': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#3d474d' : '#dfe1e6'
                    },
                    '&:hover fieldset': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#4f5b62' : '#c1c7d0'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: (theme) => theme.palette.primary.main,
                      borderWidth: '1px'
                    }
                  },
                  '& .MuiOutlinedInput-input, & .MuiOutlinedInput-inputMultiline':
                    {
                      color: 'text.primary',
                      padding: '2px 0'
                    }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  className="interceptor-loading"
                  onClick={addNewCard}
                  variant="contained"
                  disableElevation
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 1.5,
                    py: 0.75,
                    width: '100px',
                    bgcolor: blue[500]
                  }}
                >
                  Add card
                </Button>

                <IconButton
                  size="small"
                  onClick={toggleOpenNewCardForm}
                  sx={{
                    borderRadius: 2,
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(9,30,66,0.08)',
                      color: 'text.primary'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  )
}

export default Column
