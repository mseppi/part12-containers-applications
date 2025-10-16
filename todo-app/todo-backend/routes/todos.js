const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const { getAsync, setAsync } = require('../redis')


/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  res.send(todo);
  let addedTodos = await getAsync("added_todos")
  addedTodos = Number(addedTodos) + 1 || 1
  await setAsync("added_todos", addedTodos)
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.json(req.todo);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const { text, done } = req.body || {}

  if (typeof text === 'undefined' && typeof done === 'undefined') {
    return res.status(400).json({ error: 'nothing to update' })
  }

  if (typeof text !== 'undefined') req.todo.text = text
  if (typeof done !== 'undefined') req.todo.done = done

  try {
    const updated = await req.todo.save()
    res.json(updated)
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    console.error(err)
    res.sendStatus(500)
  }
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
