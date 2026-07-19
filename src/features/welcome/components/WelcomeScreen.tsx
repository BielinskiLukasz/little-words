import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'

interface WelcomeScreenProps {
  childName: string
}

export function WelcomeScreen({ childName }: WelcomeScreenProps) {
  const { t } = useTranslation('onboarding')
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex h-[100dvh] items-center justify-center bg-gradient-to-br from-background to-amber-50 p-6">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6 animate-bounce">
          <CheckCircle size={80} className="text-teal-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          {t('welcome.title', { name: childName })}
        </h1>
        <p className="text-muted-foreground">
          {t('welcome.subtitle', { name: childName })}
        </p>
      </div>
    </div>
  )
}
