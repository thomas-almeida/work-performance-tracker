const express = require('express')
const {
    PrismaClient
} = require('./prisma/generated/client')

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.post('/create-daily', async (req, res) => {

    const { day, userId } = req.body
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!user) {
        return res.status(404).json({
            error: 'user not found'
        })
    }
    const daily = await prisma.daily.create({
        data: {
            day: day,
            userId: userId
        }
    })
    res.json(daily)

})

app.post('/create-note', async (req, res) => {
    const { title, content, userId } = req.body
    const note = await prisma.note.create({
        data: { title, content, userId }
    })
    res.json(note)
})

app.post('/create-task', async (req, res) => {
    const { title, description, deadline, score, userId } = req.body
    const task = await prisma.task.create({
        data: { title, description, deadline, score, userId }
    })
    res.json(task)
})

app.get('/tasks/:userId', async (req, body) => {
    const { userId } = req.params
    const tasks = await prisma.task.findMany({
        where: {
            userId
        }
    })
    res.json(tasks)
})

app.post('/mods/populate', async (req, res) => {
    await populateDB()
    res.send('Dados populados artificialmente')
})

app.listen(PORT, () => {
    console.log(`Backend: ${PORT}`)
})

async function populateUser(username) {
    const user = await prisma.user.create({
        name: username
    })
}

async function populateDaily(day, userId) {
    const note1 = await populateNote('Nota 1', 'Conteúdo da Nota 1', 1);
    const note2 = await populateNote('Nota 2', 'Conteúdo da Nota 2', 1);
    const task1 = await populateTask('Tarefa 1', 'Descrição da Tarefa 1', 1);
    const task2 = await populateTask('Tarefa 2', 'Descrição da Tarefa 2', 1);

    const daily = await prisma.daily.create({
        data: {
            day: day,
            userId: userId,
            tasks: {
                connect: [{ id: task1.id }, { id: task2.id }]
            },
            notes: {
                connect: [{ id: note1.id }, { id: note2.id }]
            },
        }
    })

    return daily

}

async function populateNote(title, content, userId) {
    const note = await prisma.note.create({
        data: {
            title: title,
            content: content,
            userId: userId
        }
    })

    return note
}

async function populateTask(name, description, userId) {
    const task = await prisma.task.create({
        data: {
            name: name,
            description: description,
            deadline: new Date(),
            userId: userId
        }
    })

    return task
}


async function populateDB() {
    const daily = await populateDaily('2023-12-01', 1)
}