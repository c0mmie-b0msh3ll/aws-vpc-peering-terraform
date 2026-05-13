import ModeSelect from '~/components/ModeSelect/ModeSelect'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import Typography from '@mui/material/Typography'
import Profiles from './Menus/Profiles'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'
import Box from '@mui/material/Box'
import { Link } from 'react-router-dom'

function AppBar() {
  return (
    <Box
      sx={{
        width: '100%',
        height: (theme) => theme.trello.appBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? '#2c3e50' : '#1565c0'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Link to="/h">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewKanbanIcon sx={{ color: 'white' }} fontSize="large" />
            <Typography
              variant="span"
              sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}
            >
              Taskio
            </Typography>
          </Box>
        </Link>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AutoCompleteSearchBoard />

        <ModeSelect />

        <Notifications />

        <Tooltip title="Help">
          <HelpOutlineIcon sx={{ cursor: 'pointer', color: 'white' }} />
        </Tooltip>

        <Profiles />
      </Box>
    </Box>
  )
}

export default AppBar
