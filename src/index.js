const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- Health check --------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- GET /tasks : list all tasks -----------------------------------------
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { id: 'asc' } });
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// --- GET /tasks/:id : get a single task -----------------------------------
app.get('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'id must be a number' });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// --- POST /tasks : create a task ------------------------------------------
app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'title is required and must be a non-empty string' });
    }

    const task = await prisma.task.create({ data: { title: title.trim() } });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// --- PUT /tasks/:id : update a task ---------------------------------------
app.put('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'id must be a number' });

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const { title, completed } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (completed !== undefined) data.completed = completed;

    const task = await prisma.task.update({ where: { id }, data });
    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// --- DELETE /tasks/:id : delete a task ------------------------------------
app.delete('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'id must be a number' });

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Task API listening on port ${PORT}`);
});
