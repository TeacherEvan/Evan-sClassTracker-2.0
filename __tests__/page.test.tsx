import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByText("Evan's Class Tracker 2.0")
    expect(heading).toBeInTheDocument()
  })

  it('renders the get started button', () => {
    render(<Home />)
    
    const button = screen.getByText('Get Started')
    expect(button).toBeInTheDocument()
  })
})