import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import Box from '@mui/material/Box'
import useCardDetail from '~/hooks/cardDetail.hook'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CardDetailActionButton from './ActionButton/_CardDetailActionButton'
import CardHeader from './CardHeader/_CardHeader'
import CardDateBadge from '../CardDateBadge'
import CardChecklist from './Checklist/CardChecklist'
import CardMemberGroup from './CardMemberGroup'
import CardAttachment from './Attachment/CardAttachment'
import CardLabelGroup from './CardLabelGroup'

function CardDetailModal() {
  const {
    activeCard,
    isShowModalActiveCard,
    handleCloseModal,
    handleUpdateCardTitle,
    handleUpdateCardDescription,
    data,
    handler
  } = useCardDetail()

  const { handleUpdateIsCompleted } = handler

  return (
    <Modal
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'center',
        pt: 7.3
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 1200,
          maxWidth: '100%',
          maxHeight: '90vh',
          bgcolor: 'white',
          boxShadow: 24,
          borderRadius: 5,
          border: 'none',
          outline: 0,
          padding: '40px 20px 20px',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header cố định, không co giãn */}
        <Box sx={{ flexShrink: 0 }}>
          <CardHeader data={data.cardHeader} handler={handler.cardHeader} />
        </Box>

        {/* Body dùng flex thay Grid — dễ kiểm soát scroll hơn */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0, // 👈 bắt buộc để scroll con hoạt động
            display: 'flex',
            gap: '30px',
            mt: 2
          }}
        >
          {/* Left side */}
          <Box
            sx={{
              flex: 8,
              minWidth: 0,
              minHeight: 0,
              overflowY: 'auto', // 👈 scroll riêng bên trái
              pr: 1
            }}
          >
            <Box sx={{ pr: 2.5, display: 'flex', alignItems: 'center' }}>
              <Box
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpdateIsCompleted()
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  transition: 'width 0.15s ease, opacity 0.15s ease',
                  color: activeCard?.isCompleted ? '#94C748' : 'text.disabled',
                  '&:hover': {
                    cursor: 'pointer',
                    color: activeCard?.isCompleted
                      ? '#a5dd50'
                      : 'text.secondary'
                  }
                }}
              >
                {activeCard?.isCompleted ? (
                  <CheckCircleIcon sx={{ fontSize: 35 }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 35 }} />
                )}
              </Box>

              <ToggleFocusInput
                inputFontSize="26px"
                value={activeCard?.title}
                onChangedValue={handleUpdateCardTitle}
              />
            </Box>

            <Box sx={{ mt: 3, mb: 3 }}>
              <CardDetailActionButton
                data={data.cardButton}
                handler={handler.cardButton}
                activeCard={activeCard}
              />
            </Box>

            <Box sx={{ mb: 3, mt: 5 }}>
              <CardLabelGroup labelIds={activeCard?.labelIds} />
            </Box>

            <Box sx={{ mb: 3, mt: 5 }}>
              <CardMemberGroup
                memberIds={activeCard?.memberIds}
                handler={handler.cardButton}
              />
            </Box>

            <Box sx={{ mb: 3, mt: 5 }}>
              <CardDateBadge
                startedAt={activeCard?.startedAt}
                dueAt={activeCard?.dueAt}
                isCompleted={activeCard?.isCompleted}
                handleUpdate={handler.cardButton.handleUpdateCardDates}
                clickable={true}
              />
            </Box>

            <Box sx={{ mb: 3, mt: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon />
                <Typography
                  variant="span"
                  sx={{ fontWeight: 600, fontSize: 20 }}
                >
                  Description
                </Typography>
              </Box>
              <CardDescriptionMdEditor
                cardDescriptionProp={activeCard?.description}
                handleUpdateCardDescription={handleUpdateCardDescription}
              />
            </Box>

            <Box sx={{ mb: 3, mt: 5 }}>
              <CardAttachment
                data={data.attachments}
                handler={handler.attachments}
              />
            </Box>

            <Box sx={{ mb: 3, mt: 5 }}>
              <CardChecklist
                data={data.checklists}
                handler={handler.checklists}
              />
            </Box>
          </Box>

          {/* Right side */}
          <Box
            sx={{
              flex: 5,
              minWidth: 0,
              minHeight: 0,
              overflowY: 'auto',
              pr: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ChatOutlinedIcon />
              <Typography
                variant="span"
                sx={{ fontWeight: '700', fontSize: '18px' }}
              >
                Comments and activity
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <CardActivitySection
                data={data.cardActivity}
                handler={handler.cardActivity}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default CardDetailModal
