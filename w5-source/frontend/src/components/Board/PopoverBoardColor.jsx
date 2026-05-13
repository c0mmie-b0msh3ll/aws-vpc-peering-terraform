import { Box, Popover, Typography } from '@mui/material'
import { backgroundBoardList } from '~/constant/backgroundBoard'
import CheckIcon from '@mui/icons-material/Check'

export function PopoverBoardColor({
  handleCloseBackgroundPopover,
  handleSelectBackground,
  anchorEl,
  selectedBackground,
  openBackgroundPopover,
  imagesBackground
}) {
  return (
    <Popover
      open={openBackgroundPopover}
      anchorEl={anchorEl}
      onClose={handleCloseBackgroundPopover}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left'
      }}
      PaperProps={{
        sx: {
          ml: 1,
          p: 2,
          borderRadius: 3,
          width: 380
        }
      }}
    >
      <Typography sx={{ fontWeight: 600, mb: 1.5, textAlign: 'center' }}>
        Board background
      </Typography>

      <Box mb={2}>Photos</Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1
        }}
      >
        {imagesBackground?.map((item) => {
          const isSelected = selectedBackground?._id === item._id

          return (
            <Box
              key={item._id}
              sx={{
                position: 'relative',
                width: 110,
                height: 60,
                flexShrink: 0,
                cursor: 'pointer'
              }}
              onClick={() => handleSelectBackground(item, 'image')}
            >
              <Box
                component="img"
                src={item.image}
                alt={item._id}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'transparent'
                }}
              />

              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 2
                  }}
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Box>
              )}
            </Box>
          )
        })}
      </Box>

      <Box mb={2} mt={2}>
        Colors
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1
        }}
      >
        {backgroundBoardList.map((item) => {
          const isSelected = selectedBackground?.key === item.key

          return (
            <Box
              key={item.key}
              sx={{
                position: 'relative',
                width: 110,
                height: 60,
                flexShrink: 0,
                cursor: 'pointer'
              }}
              onClick={() => handleSelectBackground(item, 'color')}
            >
              <Box
                component="img"
                src={item.src}
                alt={item.key}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'transparent'
                }}
              />

              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 2
                  }}
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Popover>
  )
}

export default PopoverBoardColor
