const express = require('express')
const { PrismaClient } = require('./prisma/generated/client')

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(express.json())

// Carregar o usuário e seus dados
app.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(userId)
            },
            include: {
                dailies: {
                    include: {
                        tasks: true,
                        notes: true
                    }
                }
            }
        })

        if (!user) {
            return res.status(404).json({
                error: 'user not found'
            })
        }

        res.json(user)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'internal server error'
        })
    }
})

// Criar uma nova daily passando como título o dia e o mês
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

// Criar uma nova tarefa dentro da daily
app.post('/create-task/:dailyId', async (req, res) => {
    const { title, description, deadline, userId } = req.body
    const { dailyId } = req.params

    const task = await prisma.task.create({
        data: {
            title: title,
            description: description,
            deadline: deadline,
            userId: userId,
            dailyId: parseInt(dailyId)
        }
    })

    res.json(task)
})

// Criar uma nova nota dentro da daily
app.post('/create-note/:dailyId', async (req, res) => {
    const { title, content, userId } = req.body
    const { dailyId } = req.params

    const note = await prisma.note.create({
        data: {
            title: title,
            content: content,
            userId: userId,
            dailyId: parseInt(dailyId)
        }
    })

    res.json(note)
})

// Excluir uma daily, juntamente com suas tarefas e notas
app.delete('/delete-daily/:dailyId', async (req, res) => {
    const { dailyId } = req.params

    await prisma.task.deleteMany({
        where: {
            dailyId: parseInt(dailyId)
        }
    })

    await prisma.note.deleteMany({
        where: {
            dailyId: parseInt(dailyId)
        }
    })

    await prisma.daily.delete({
        where: {
            id: parseInt(dailyId)
        }
    })

    res.json({ message: 'Daily, tasks, and notes deleted successfully' })
})

// Excluir uma nota
app.delete('/delete-note/:noteId', async (req, res) => {
    const { noteId } = req.params

    await prisma.note.delete({
        where: {
            id: parseInt(noteId)
        }
    })

    res.json({ message: 'Note deleted successfully' })
})

// Excluir uma tarefa
app.delete('/delete-task/:taskId', async (req, res) => {
    const { taskId } = req.params

    await prisma.task.delete({
        where: {
            id: parseInt(taskId)
        }
    })

    res.json({ message: 'Task deleted successfully' })
})

// Listar todas as dailies do usuário com suas tarefas e notas
app.get('/dailies/:userId', async (req, res) => {
    const { userId } = req.params

    const dailies = await prisma.daily.findMany({
        where: {
            userId: parseInt(userId)
        },
        include: {
            tasks: true,
            notes: true
        }
    })

    res.json(dailies)
})

// Popular de forma artificial a tabela de daily
app.post('/populate', async (req, res) => {
    const { day, userId } = req.body
    const daily = await populateDaily(day, userId)
    res.json(daily)
})

async function populateDaily(day) {

    const userId = 1
    const dailyId = 1

    const note1 = await populateNote('Nota 1', 'Conteúdo da Nota 1', userId, dailyId)
    const note2 = await populateNote('Nota 2', 'Conteúdo da Nota 2', userId, dailyId)
    const task1 = await populateTask('Tarefa 1', 'Descrição da Tarefa 1', userId, dailyId)
    const task2 = await populateTask('Tarefa 2', 'Descrição da Tarefa 2', userId, dailyId)

    const currentDate = new Date()
    const options = { day: 'numeric', month: 'long' }
    const formattedDate = currentDate.toLocaleDateString('pt-BR', options)

    const daily = await prisma.daily.create({
        data: {
            day: formattedDate,
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

async function populateNote(title, content, userId, dailyId) {
    const note = await prisma.note.create({
        data: {
            title: title,
            content: content,
            user: {
                connect: {
                    id: userId
                }
            },
            daily: {
                connect: {
                    id: dailyId
                }
            }
        }
    })

    return note
}

async function populateTask(name, description, userId, dailyId) {
    const task = await prisma.task.create({
        data: {
            name: name,
            description: description,
            deadline: new Date(),
            user: {
                connect: {
                    id: userId
                }
            },
            daily: {
                connect: {
                    id: dailyId
                }
            }
        }
    })

    return task
}

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`)
}) 
