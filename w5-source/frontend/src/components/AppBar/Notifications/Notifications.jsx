import moment from 'moment'
import Badge from '@mui/material/Badge'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import DoneIcon from '@mui/icons-material/Done'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import { getInitials } from '~/helpers/getInitials'
import { useNotification } from '~/hooks/notification.hook'

const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
}

function Notifications() {
  const {
    open,
    notifications,
    newNotification,
    handleClickNotificationIcon,
    handleUpdateNotification,
    handleClose,
    anchorEl
  } = useNotification()

  return (
    <Box>
      <Tooltip title="Notifications">
        <Badge
          color="warning"
          variant={newNotification ? 'dot' : 'standard'}
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              boxShadow: (theme) =>
                `0 0 0 2px ${theme.palette.background.paper}`
            }
          }}
        >
          <IconButton
            id="basic-button-open-notification"
            aria-controls={open ? 'basic-notification-drop-down' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClickNotificationIcon}
            sx={{
              color: newNotification ? 'warning.main' : 'white',
              bgcolor: open ? 'rgba(255,255,255,0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.12)'
              }
            }}
          >
            <NotificationsNoneIcon />
          </IconButton>
        </Badge>
      </Tooltip>

      <Menu
        id="basic-notification-drop-down"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{
          'aria-labelledby': 'basic-button-open-notification',
          disablePadding: true
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              width: 420,
              maxWidth: 'calc(100vw - 24px)',
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 12px 32px rgba(0,0,0,0.45)'
                  : '0 12px 32px rgba(0,0,0,0.14)'
            }
          }
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
            Notifications
          </Typography>
        </Box>

        {notifications?.length === 0 && (
          <Box
            sx={{
              px: 3,
              py: 5,
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 36, opacity: 0.5, mb: 1 }} />
            <Typography variant="body2">
              You do not have any new notifications.
            </Typography>
          </Box>
        )}

        {notifications?.map((notification, index) => {
          const inviter = notification.inviter
          const workspace = notification.entityInfo
          const entity = notification.entity
          const title =
            workspace?.title ||
            `Untitled ${entity == 'board' ? 'board' : 'workspace'}`
          const status = notification.status
          const message = notification.message

          return (
            <Box key={notification._id ?? index}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor:
                    status === INVITATION_STATUS.PENDING
                      ? 'action.hover'
                      : 'background.paper',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5
                  }}
                >
                  <Box sx={{ position: 'relative', flexShrink: 0, mt: 0.25 }}>
                    <Avatar
                      src={inviter?.avatar || undefined}
                      sx={{
                        width: 44,
                        height: 44,
                        fontWeight: 700,
                        fontSize: 15,
                        bgcolor: 'primary.light',
                        color: 'primary.dark'
                      }}
                    >
                      {getInitials(inviter?.displayName)}
                    </Avatar>

                    {status === INVITATION_STATUS.PENDING && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: -2,
                          bottom: -2,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: 'info.main',
                          border: '2px solid',
                          borderColor: 'background.paper'
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* top */}
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.55,
                          color: 'text.primary',
                          wordBreak: 'break-word'
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          {inviter?.displayName || 'Someone'}
                        </Box>{' '}
                        invited you to join{' '}
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          {title}
                        </Box>
                      </Typography>

                      <Box
                        sx={{
                          mt: 0.75,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap'
                        }}
                      >
                        <Chip
                          label={entity != 'board' ? 'Workspace' : 'Board'}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            borderRadius: 999,
                            fontWeight: 600,
                            height: 24
                          }}
                        />

                        <Typography variant="caption" color="text.secondary">
                          {moment(notification.createdAt).fromNow()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* middle */}
                    {message && (
                      <Box
                        sx={{
                          mb: 1.25,
                          px: 1.25,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: 'action.selected',
                          borderLeft: '3px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontStyle: 'italic',
                            lineHeight: 1.5,
                            wordBreak: 'break-word'
                          }}
                        >
                          “{message}”
                        </Typography>
                      </Box>
                    )}

                    {/* bottom */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap'
                      }}
                    >
                      {status === INVITATION_STATUS.PENDING && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handleUpdateNotification({
                                notification,
                                status: INVITATION_STATUS.ACCEPTED
                              })
                            }
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              px: 2,
                              minWidth: 88,
                              borderRadius: 999
                            }}
                          >
                            Accept
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            onClick={() =>
                              handleUpdateNotification({
                                notification,
                                status: INVITATION_STATUS.REJECTED
                              })
                            }
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              px: 2,
                              minWidth: 88,
                              borderRadius: 999
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {status === INVITATION_STATUS.ACCEPTED && (
                        <Chip
                          icon={<DoneIcon />}
                          label="Accepted"
                          color="success"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 999
                          }}
                        />
                      )}

                      {status === INVITATION_STATUS.REJECTED && (
                        <Chip
                          icon={<NotInterestedIcon />}
                          label="Rejected"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 999
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {index < notifications.length - 1 && (
                <Divider sx={{ ml: 9, mr: 2 }} />
              )}
            </Box>
          )
        })}
      </Menu>
    </Box>
  )
}

export default Notifications
