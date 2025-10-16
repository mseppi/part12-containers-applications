const express = require('express');
const router = express.Router();

const configs = require('../util/config')
const { getAsync } = require('../redis')

let visits = 0

/* GET index data. */
router.get('/', async (req, res) => {
  visits++

  res.send({
    ...configs,
    visits
  });
});

router.get('/statistics', async (req, res) => {
  try {
    const val = await getAsync('added_todos')
    const added_todos = Number(val) || 0
    res.json({ added_todos })
  } catch (err) {
    console.error('Error reading statistics from Redis:', err)
    res.json({ added_todos: 0 })
  }
})


module.exports = router;
