import React from 'react'

const Todo = ({ todo, onDelete, onComplete }) => {
  return (
    <div>
      <span>{todo.text}</span>
      <button onClick={() => onDelete && onDelete(todo)}>Delete</button>
      {!todo.done && <button onClick={() => onComplete && onComplete(todo)}>Set as done</button>}
    </div>
  )
}

export default Todo
