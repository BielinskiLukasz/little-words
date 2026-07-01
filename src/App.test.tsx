import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}))

import { useLiveQuery } from 'dexie-react-hooks'
import App from './App'
import { ErrorBoundary } from './shared/components/ErrorBoundary'

describe('AppGate', () => {
  it('shows splash when profileCount is undefined', () => {
    vi.mocked(useLiveQuery).mockReturnValue(undefined)
    render(<App />)
    // Should show app name heading (either 'Little Words' or 'Słówko')
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('shows onboarding when profileCount is 0', () => {
    vi.mocked(useLiveQuery).mockReturnValue(0)
    render(<App />)
    // OnboardingWizard renders — verify at least one text input is present (name field)
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  })

  it('shows router when profileCount > 0', () => {
    vi.mocked(useLiveQuery).mockReturnValue(1)
    render(<App />)
    // RouterProvider renders — no crash is sufficient; dashboard greeting is visible
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('ErrorBoundary catches errors', () => {
    const ThrowingComponent = () => { throw new Error('test error') }
    const { container } = render(<ErrorBoundary><ThrowingComponent /></ErrorBoundary>)
    expect(container.querySelector('button')).not.toBeNull()
  })
})
