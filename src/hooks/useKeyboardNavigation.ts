import { useEffect, useCallback } from 'react'

interface KeyboardNavigationOptions {
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onEnter?: () => void
  onEscape?: () => void
  onSpace?: () => void
  onTab?: (event: KeyboardEvent) => void
  disabled?: boolean
  preventDefault?: boolean
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onSpace,
    onTab,
    disabled = false,
    preventDefault = true,
  } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return

      switch (event.key) {
        case 'ArrowUp':
          if (onArrowUp) {
            if (preventDefault) event.preventDefault()
            onArrowUp()
          }
          break
        case 'ArrowDown':
          if (onArrowDown) {
            if (preventDefault) event.preventDefault()
            onArrowDown()
          }
          break
        case 'ArrowLeft':
          if (onArrowLeft) {
            if (preventDefault) event.preventDefault()
            onArrowLeft()
          }
          break
        case 'ArrowRight':
          if (onArrowRight) {
            if (preventDefault) event.preventDefault()
            onArrowRight()
          }
          break
        case 'Enter':
          if (onEnter) {
            if (preventDefault) event.preventDefault()
            onEnter()
          }
          break
        case 'Escape':
          if (onEscape) {
            if (preventDefault) event.preventDefault()
            onEscape()
          }
          break
        case ' ':
          if (onSpace) {
            if (preventDefault) event.preventDefault()
            onSpace()
          }
          break
        case 'Tab':
          if (onTab) {
            onTab(event)
          }
          break
      }
    },
    [
      disabled,
      preventDefault,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onEnter,
      onEscape,
      onSpace,
      onTab,
    ]
  )

  useEffect(() => {
    if (!disabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleKeyDown, disabled])

  return { handleKeyDown }
}

export default useKeyboardNavigation