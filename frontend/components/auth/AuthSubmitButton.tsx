import { Button } from '@/components/ui/Button'

interface AuthSubmitButtonProps {
  isLoading: boolean
  loadingText?: string
  text?: string
}

export default function AuthSubmitButton({
  isLoading,
  loadingText = 'Loading...',
  text = 'Submit',
}: AuthSubmitButtonProps) {
  return (
    <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
      {isLoading ? loadingText : text}
    </Button>
  )
}
