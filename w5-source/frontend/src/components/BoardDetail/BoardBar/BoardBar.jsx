import Chip from '@mui/material/Chip'
import BoardMemberGroup from './BoardMemberGroup'
import Box from '@mui/material/Box'
import { IconButton } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PopoverBoardDetails from './PopoverBoardDetails'
import CardLabelPopoverContent from '../BoardContent/CardDetailModal/CardLabelPopoverContent'
import EditLabelPopover from '../BoardContent/CardDetailModal/EditLabelPopoverContent'
import { useLabel } from '~/hooks/label.hook'
import BoardArchivedItemsPopover from '../BoardArchiveItem/BoardArchiveItemPopover'
import BoardActivityPopover from '../BoardActivity/BoardActivityPopover'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar({
  board,
  members,
  boardModal,
  boardPopover,
  columnCollapseMode,
  onCollapseAllColumns,
  onExpandAllColumns
}) {
  const {
    anchorEl,
    action,
    selectedLabel,
    openLabelList,
    openLabelForm,
    openActivityList,
    openArchivedList,
    handleOpenMoreOption,
    handleCloseLabelList,
    handleOpenLabelForm,
    handleCloseLabelForm,
    handleCloseActivityList,
    handleCloseArchivedList,
    handleBack
  } = boardPopover

  const { handleCreateLabel, handleUpdateLabel, handleDeleteLabel } = useLabel()

  return (
    <Box
      sx={{
        width: '100%',
        height: (theme) => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 2,
        overflowX: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.24)',
        backdropFilter: 'blur(5px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={{ ...MENU_STYLES, fontSize: '22px', fontWeight: 600 }}
          label={board?.title}
          clickable
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <BoardMemberGroup members={members} />

        <IconButton
          onClick={handleOpenMoreOption}
          sx={{ fontSize: '20px', alignContent: 'center', color: 'white' }}
        >
          <MoreHorizIcon />
        </IconButton>

        <PopoverBoardDetails
          boardPopover={boardPopover}
          boardModal={boardModal}
          columnCollapseMode={columnCollapseMode}
          onCollapseAllColumns={onCollapseAllColumns}
          onExpandAllColumns={onExpandAllColumns}
        />

        <CardLabelPopoverContent
          anchorEl={anchorEl}
          isOpen={openLabelList}
          labelIds={[]}
          handler={{
            handleClose: handleCloseLabelList,
            handleOpenForm: handleOpenLabelForm
          }}
          showCheckBox={false}
        />

        <EditLabelPopover
          action={action}
          anchorEl={anchorEl}
          open={openLabelForm}
          onClose={handleCloseLabelForm}
          label={selectedLabel}
          onSave={action === 'create' ? handleCreateLabel : handleUpdateLabel}
          onBack={handleBack}
          onDelete={handleDeleteLabel}
        />

        <BoardArchivedItemsPopover
          anchorEl={anchorEl}
          open={openArchivedList}
          onClose={handleCloseArchivedList}
        />

        <BoardActivityPopover
          anchorEl={anchorEl}
          open={openActivityList}
          onClose={handleCloseActivityList}
        />
      </Box>
    </Box>
  )
}

export default BoardBar
