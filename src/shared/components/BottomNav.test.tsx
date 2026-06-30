import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import '@testing-library/jest-dom'
import { BottomNav } from './BottomNav'
import '../../i18n/index'

describe('BottomNav', () => {
  function renderNav(initialPath = '/dashboard') {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <BottomNav />
      </MemoryRouter>,
    )
  }

  it('renders exactly 4 navigation links', () => {
    renderNav()
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })

  it('renders tab labels in Polish (default locale)', () => {
    renderNav()
    expect(screen.getByText('Pulpit')).toBeInTheDocument()
    expect(screen.getByText('Znaczenia')).toBeInTheDocument()
    expect(screen.getByText('Formy słów')).toBeInTheDocument()
    expect(screen.getByText('Więcej')).toBeInTheDocument()
  })

  it('each tab link has an href containing the correct route path', () => {
    renderNav()
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toEqual(
      expect.arrayContaining(['/dashboard', '/meanings', '/word-forms', '/more']),
    )
  })

  it('the active tab receives the text-primary class when on its route', () => {
    renderNav('/dashboard')
    const dashboardLink = screen.getByText('Pulpit').closest('a')
    expect(dashboardLink).toHaveClass('text-primary')
  })
})
