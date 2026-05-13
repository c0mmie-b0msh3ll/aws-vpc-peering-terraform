import { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'

function ToggleFocusInput({
  value,
  onChangedValue,
  inputFontSize = '16px',
  color,
  fontWeight = 'bold',
  ...props
}) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Blur là khi chúng ta không còn Focus vào phần tử nữa thì sẽ trigger hành động ở đây.
  const triggerBlur = () => {
    // Support Trim cái dữ liệu State inputValue cho đẹp luôn sau khi blur ra ngoài
    setInputValue(inputValue.trim())

    // Nếu giá trị không có gì thay đổi hoặc Nếu user xóa hết nội dung thì set lại giá trị gốc ban đầu theo value từ props và return luôn không làm gì thêm
    if (!inputValue || inputValue.trim() === value) {
      setInputValue(value)
      return
    }
    // Khi giá trị có thay đổi ok thì gọi lên func ở Props cha để xử lý
    onChangedValue(inputValue)
  }

  return (
    <TextField
      id="toggle-focus-input-controlled"
      fullWidth
      variant="outlined"
      size="small"
      multiline
      minRows={1}
      maxRows={4}
      value={inputValue}
      onChange={(event) => {
        setInputValue(event.target.value)
      }}
      onBlur={triggerBlur}
      {...props}
      sx={{
        color,
        '& .MuiOutlinedInput-input': {
          fontSize: inputFontSize,
          fontWeight: fontWeight,
          lineHeight: 1.2
        },
        '& .MuiOutlinedInput-root': {
          alignItems: 'flex-start',
          backgroundColor: 'transparent',
          '& fieldset': { borderColor: 'transparent' }
        },
        '& .MuiOutlinedInput-root:hover': {
          '& fieldset': { borderColor: 'transparent' }
        },
        '& .MuiOutlinedInput-root.Mui-focused': {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#33485D' : 'white',
          '& fieldset': { borderColor: 'primary.main' }
        },
        '& .MuiOutlinedInput-inputMultiline': {
          px: '6px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }
      }}
    />
  )
}

export default ToggleFocusInput
