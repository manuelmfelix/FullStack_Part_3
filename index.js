require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const mongoose = require ('mongoose')
const Person = require('./models/people')
const { response } = require('express')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('body', (req,res) => {return JSON.stringify(req.body)} )

app.use(morgan(':method :url :status :res[content-length] - :response-time ms {:body}'))

app.get('/', (req, res) => {
    res.send(
        `<div>${text}
        <br /><br />
        ${String(new Date())}
        </div>`
        )
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
    
})

app.get('/api/persons/:id', (req, res, next) => {

  Person.findById(req.params.id)
    .then(person => {
      if (person){
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savePerson => {
      res.json(savePerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req,res,next) => {
  const body = req.body
  const person = {
    number: body.number
  }
  Person.findByIdAndUpdate(req.params.id, person, { new:true })
    .then(updatePerson => {
      res.json(updatePerson)
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message})
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`)
})