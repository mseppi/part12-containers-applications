import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Todo from './Todo'

test('Todo renders text and calls handlers when buttons are clicked', () => {
  const todo = { text: 'Learn containers', done: false }
  const onDelete = vi.fn()
  const onComplete = vi.fn()

  render(<Todo todo={todo} onDelete={onDelete} onComplete={onComplete} />)

  expect(screen.getByText('Learn containers')).toBeInTheDocument()

  const deleteButton = screen.getByText('Delete')
  const completeButton = screen.getByText('Set as done')

  fireEvent.click(deleteButton)
  fireEvent.click(completeButton)

  expect(onDelete).toHaveBeenCalledWith(todo)
  expect(onComplete).toHaveBeenCalledWith(todo)
})
