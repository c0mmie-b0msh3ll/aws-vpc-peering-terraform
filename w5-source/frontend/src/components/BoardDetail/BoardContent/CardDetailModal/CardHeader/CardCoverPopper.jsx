import Typography from '@mui/material/Typography'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import cardCoverColor from '~/constant/cardCoverColor'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'

const UNSPLASH_PHOTOS = [
  'https://media.istockphoto.com/id/1410270664/vi/anh/v%C4%83n-ph%C3%B2ng-phong-c%C3%A1ch-hi%E1%BB%87n-%C4%91%E1%BA%A1i-v%E1%BB%9Bi-s%C3%A0n-b%C3%AA-t%C3%B4ng-l%E1%BB%99-thi%C3%AAn-v%C3%A0-r%E1%BA%A5t-nhi%E1%BB%81u-nh%C3%A0-m%C3%A1y.jpg?s=612x612&w=0&k=20&c=-7Qd3-U5wa46yvykbev5FnzumBiXf1eY2lvRTGShbsI=',
  'https://media.istockphoto.com/id/2181910847/vi/anh/kh%C3%B4ng-gian-v%C4%83n-ph%C3%B2ng-l%C3%A0m-vi%E1%BB%87c-chung-xanh-b%E1%BB%81n-v%E1%BB%AFng.jpg?s=612x612&w=0&k=20&c=5kg0sSGKWykAZKudHBdvIgaE-41n3qlpa4L7wBj5I-U=',
  'https://media.istockphoto.com/id/1456193345/vi/anh/g%C3%B3c-nh%C3%ACn-cao-c%E1%BB%A7a-ng%C6%B0%E1%BB%9Di-ph%E1%BB%A5-n%E1%BB%AF-kh%C3%B4ng-th%E1%BB%83-nh%E1%BA%ADn-ra-%C4%91%C3%A1nh-m%C3%A1y-b%C3%A1o-c%C3%A1o-kinh-doanh-tr%C3%AAn-b%C3%A0n-ph%C3%ADm-m%C3%A1y.jpg?s=612x612&w=0&k=20&c=IMHuRLZz1ND1UdfP3AKItONuO_wpYl-dirLCmf2nCAo=',
  'https://media.istockphoto.com/id/881384316/photo/vietnamese-food-arranged-on-table.jpg?s=612x612&w=0&k=20&c=wARkvNa_ON9GrCq_PXuEGQlAOXZwKSyy1aFqUltcR_Y=',
  'https://rukminim2.flixcart.com/image/480/480/kxgfzbk0/wall-decoration/2/o/t/pizza-food-vegetables-fruit-wallpaper-paper-poster-1-vp-221221-original-imag9wjxrzzuuxdf.jpeg?q=90',
  'https://img.freepik.com/premium-photo/traditional-vietnamese-rolls-rice-sheets-with-seafood_563354-1084.jpg?semt=ais_rp_progressive&w=740&q=80',
  'https://media.istockphoto.com/id/1154370446/vi/anh/g%E1%BA%A5u-tr%C3%BAc-h%C3%A0i-h%C6%B0%E1%BB%9Bc-trong-k%C3%ADnh-r%C3%A2m-m%C3%A0u-xanh-l%C3%A1-c%C3%A2y-cho-th%E1%BA%A5y-m%E1%BB%99t-c%E1%BB%AD-ch%E1%BB%89-%C4%91%C3%A1-b%E1%BB%8B-c%C3%B4-l%E1%BA%ADp-tr%C3%AAn-n%E1%BB%81n-tr%E1%BA%AFng.jpg?s=612x612&w=0&k=20&c=fovWkUQ13n-m4GM3EYiXp1SHS3Q_66MHZxqzk_fHsiY=',
  'https://media.istockphoto.com/id/585613602/vi/anh/c%E1%BA%ADn-c%E1%BA%A3nh-%C4%91%E1%BB%99ng-v%E1%BA%ADt-meerkat-d%E1%BB%85-th%C6%B0%C6%A1ng-th%C6%B0-gi%C3%A3n-trong-m%C3%B3n-tr%C3%A1ng-mi%E1%BB%87ng.jpg?s=612x612&w=0&k=20&c=HWIcXqAMWF4QYz33wq6GZR1x_lxU04xv95DPZ6l2_MI=',
  'https://media.istockphoto.com/id/170462856/vi/anh/ch%C3%B3-l%C3%A0m-vi%E1%BB%87c-tho%E1%BA%A3i-m%C3%A1i-t%E1%BA%A1i-nh%C3%A0.jpg?s=612x612&w=0&k=20&c=yDeNaI1J1mL4cehNKDfgSg6TJ5cF272YBrOx6-8QuvU=',
  'https://media.istockphoto.com/id/2149038061/vi/anh/tay-kinh-doanh-v%C3%A0-ghi-ch%C3%BA-d%C3%A1n-v%E1%BB%9Bi-k%E1%BA%BF-ho%E1%BA%A1ch-%C3%BD-t%C6%B0%E1%BB%9Fng-v%C3%A0-s%C3%A1ng-t%E1%BA%A1o-cho-ti%E1%BB%83u-thuy%E1%BA%BFt-v%C3%A0-l%E1%BB%8Bch-tr%C3%ACnh.jpg?s=612x612&w=0&k=20&c=Z5jW52kIEKo3SRsx1vDUjEmUeSumU7amJv8GX0P0re0=',
  'https://media.istockphoto.com/id/1074983828/vi/anh/chia-s%E1%BA%BB-%C3%BD-t%C6%B0%E1%BB%9Fng-kh%C3%A1i-ni%E1%BB%87m-v%E1%BB%9Bi-chi%E1%BA%BFn-l%C6%B0%E1%BB%A3c-vi%E1%BA%BFt-gi%E1%BA%A5y-tr%C3%AAn-v%C4%83n-ph%C3%B2ng-k%C3%ADnh-treo-t%C6%B0%E1%BB%9Dng-ti%E1%BA%BFp-th%E1%BB%8B-kinh.jpg?s=612x612&w=0&k=20&c=8YGhVTR9Pb94p1viRS9Bm71OinBoVJCXsfDZinGKA_Y=',
  'https://media.istockphoto.com/id/2173405087/vi/anh/g%C3%B3c-nh%C3%ACn-t%E1%BB%AB-tr%C3%AAn-xu%E1%BB%91ng-c%E1%BB%A7a-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-kinh-doanh-%C4%91%E1%BA%B7t-b%E1%BA%A3ng-scrum-tr%C3%AAn-b%C3%A0n-t%E1%BA%A1i-ph%C3%B2ng-h%E1%BB%8Dp-tri%E1%BB%87u.jpg?s=612x612&w=0&k=20&c=debffp9orbIzi8AQutfPVrAoVKS-2Dtk0fJYuwb2aKk='
]

function CardCoverPopper({
  cover = null,
  anchorEl,
  open,
  onClose,
  handleSelectCover,
  attachments = [],
  handleUpdateCover
}) {
  const COLORS = Object.keys(cardCoverColor)
  const selectedType = cover?.type ?? null
  const selectedValue = cover?.value ?? null
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
      sx={{ zIndex: 1300 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={8}
          sx={{
            width: 310,
            borderRadius: 2,
            overflow: 'hidden',
            p: 0
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ width: 24 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
              Cover
            </Typography>
            <Box
              onClick={onClose}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' }
              }}
            >
              <CloseOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>

          <Box sx={{ p: 2, maxHeight: 520, overflowY: 'auto' }}>
            <Button
              fullWidth
              variant="contained"
              disableElevation
              onClick={() => handleUpdateCover(null)}
              sx={{
                bgcolor: 'error.main',
                color: 'error.contrastText',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 1.5,
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
            >
              Remove cover
            </Button>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: 'text.secondary',
                mb: 1
              }}
            >
              Colors
            </Typography>

            <Grid container spacing={0.75} sx={{ mb: 2 }}>
              {COLORS.map((color) => (
                <Grid item key={color} xs={12 / 5}>
                  <Box
                    onClick={() =>
                      handleUpdateCover({ type: 'color', value: color })
                    }
                    sx={{
                      position: 'relative',
                      height: 36,
                      bgcolor: (theme) =>
                        cardCoverColor?.[color]?.[theme.palette.mode],
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor:
                        selectedType === 'color' && selectedValue === color
                          ? 'primary.main'
                          : 'transparent',
                      transition: 'transform 0.15s',
                      '&:hover': {
                        transform: 'scale(1.06)',
                        filter: 'brightness(1.08)'
                      }
                    }}
                  >
                    {selectedType === 'color' && selectedValue === color && (
                      <CheckRoundedIcon
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: 20,
                          color: 'common.white',
                          bgcolor: 'rgba(0,0,0,0.25)',
                          borderRadius: '50%',
                          p: 0.25
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box
              sx={{ borderTop: '1px solid', borderColor: 'divider', mb: 2 }}
            />

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: 'text.secondary',
                mb: 1
              }}
            >
              Attachments
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              {attachments.map((attachment, index) => {
                const attachmentValue =
                  attachment?._id ?? attachment?.id ?? index
                const attachmentSrc = attachment?.url ?? attachment

                return (
                  <Box
                    key={attachmentValue}
                    onClick={() =>
                      handleSelectCover({
                        type: 'attachment',
                        value: attachment?._id ?? attachment?.id ?? index
                      })
                    }
                    sx={{
                      width: 88,
                      height: 60,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor:
                        selectedType === 'attachment' &&
                        selectedValue === attachmentValue
                          ? 'primary.main'
                          : 'transparent'
                    }}
                  >
                    <Box
                      component="img"
                      src={attachmentSrc}
                      alt={`attachment-${index}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                )
              })}
            </Box>

            <Button
              fullWidth
              variant="contained"
              disableElevation
              onClick={handleUpdateCover}
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : '#f0f1f4',
                color: 'text.primary',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 1.5,
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.16)'
                      : '#e6e8ec'
                }
              }}
            >
              Upload a cover image
            </Button>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: 'text.secondary',
                mb: 1
              }}
            >
              Photos
            </Typography>

            <Grid container spacing={0.75}>
              {UNSPLASH_PHOTOS.map((src, i) => (
                <Grid item key={i} xs={4}>
                  <Box
                    onClick={() =>
                      handleUpdateCover({ type: 'attachment', value: src })
                    }
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 54,
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor:
                        selectedType === 'attachment' && selectedValue === src
                          ? 'primary.main'
                          : 'transparent',
                      overflow: 'hidden',
                      '&:hover img': {
                        opacity: 0.85
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={src}
                      alt={`photo-${i}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />

                    {selectedType === 'attachment' && selectedValue === src && (
                      <CheckRoundedIcon
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          fontSize: 18,
                          color: 'common.white',
                          bgcolor: 'rgba(0,0,0,0.28)',
                          borderRadius: '50%',
                          p: 0.25
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  )
}
export default CardCoverPopper
