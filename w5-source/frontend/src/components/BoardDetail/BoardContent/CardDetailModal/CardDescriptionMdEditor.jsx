import { useEffect, useMemo, useState } from 'react'
import { useColorScheme } from '@mui/material/styles'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

function CardDescriptionMdEditor({
  cardDescriptionProp = '',
  handleUpdateCardDescription
}) {
  const { mode } = useColorScheme()

  const [markdownEditMode, setMarkdownEditMode] = useState(false)
  const [cardDescription, setCardDescription] = useState(
    cardDescriptionProp || ''
  )
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setCardDescription(cardDescriptionProp || '')
  }, [cardDescriptionProp])

  const normalizedOriginalValue = useMemo(
    () => (cardDescriptionProp || '').trim(),
    [cardDescriptionProp]
  )

  const normalizedCurrentValue = useMemo(
    () => (cardDescription || '').trim(),
    [cardDescription]
  )

  const isChanged = normalizedCurrentValue !== normalizedOriginalValue

  const handleEdit = () => {
    setMarkdownEditMode(true)
  }

  const handleCancel = () => {
    setCardDescription(cardDescriptionProp || '')
    setMarkdownEditMode(false)
  }

  const handleSave = async () => {
    if (!isChanged) {
      setMarkdownEditMode(false)
      return
    }

    try {
      setIsSaving(true)
      await handleUpdateCardDescription(normalizedCurrentValue)
      setMarkdownEditMode(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box sx={{ mt: 1 }}>
      {markdownEditMode ? (
        <Stack spacing={1.5}>
          <Box
            data-color-mode={mode}
            sx={{
              '& .w-md-editor': {
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
              },
              '& .w-md-editor-toolbar': {
                borderBottom: '1px solid',
                borderColor: 'divider'
              }
            }}
          >
            <MDEditor
              value={cardDescription}
              onChange={(value) => setCardDescription(value || '')}
              previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
              height={320}
              preview="edit"
            />
          </Box>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              type="button"
              variant="text"
              color="inherit"
              onClick={handleCancel}
              disabled={isSaving}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>

            <Button
              className="interceptor-loading"
              type="button"
              variant="contained"
              onClick={handleSave}
              disabled={!isChanged || isSaving}
              sx={{ textTransform: 'none' }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {cardDescription ? (
            <Box
              data-color-mode={mode}
              sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                cursor: 'pointer'
              }}
              onClick={handleEdit}
            >
              <MDEditor.Markdown
                source={cardDescription}
                style={{
                  whiteSpace: 'pre-wrap',
                  background: 'transparent',
                  color: 'inherit'
                }}
              />
            </Box>
          ) : (
            <Box
              onClick={handleEdit}
              sx={{
                px: 2,
                py: 1.75,
                minHeight: 120,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'transparent',
                color: 'text.secondary',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(9,30,66,0.04)',
                  borderColor: 'text.secondary'
                }
              }}
            >
              Add a more detailed description...
            </Box>
          )}
        </Stack>
      )}
    </Box>
  )
}

export default CardDescriptionMdEditor
