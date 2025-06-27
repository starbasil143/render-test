require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const Person = require('./models/person')

const app = express();

morgan.token('body', (req, res) => req.method==="POST"?JSON.stringify(req.body):"");

app.use(express.json());
app.use(express.static('dist'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let data = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/sine', (request,response)=>{
  response.send('<h1>Cosine.</h1>');
})

app.get('/api/persons', (request,response)=>{
  Person.find({}).then(people => {
    response.json(people);
  })
})

app.post('/api/persons', (request, response)=>{
  const personData = request.body;

  if (!personData) {
    return response.status(400).json({error: 'content missing'});
  }
  
  if (data.some(p=>p.name===personData.name)) {
    response.json({ error: 'Name is already in use.' });
    response.status(400).end();
  } else if (!personData.name || !personData.number) {
    response.json({ error: "Request must include fields 'name' and 'number'" });
    response.status(400).end();
  } else
  {
    const newPerson = new Person({
      name: personData.name,
      number: personData.number,
    });
    
    do {
      newPerson.id = Math.floor(Math.random()*143143143)
    } while (data.some(p=>p.id===newPerson.id)) 

    newPerson.save().then(savedPerson => {
      response.json(savedPerson)
    })
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end();
      }

      person.name = name;
      person.number = number;
      
      return person.save()
        .then(updatedPerson => {
          response.json(updatedPerson)
        })
    })
    .catch (error => next(error));
})
  
app.get('/api/persons/:id', (request, response, next)=>{
  Person.findById(request.params.id)
    .then(person => {
      if (person){
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
})
  
app.delete('/api/persons/:id', (request, response, next)=>{
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error));
})

app.get('/info', (request,response)=>{
  response.send(`
    <p>Phonebook has info for ${data.length} people</p>
    <p>${Date()}</p>
    `);
  })

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name==='CastError'){
    return response.status(400).send({error: 'malformatted id'})
  }

  next (error);
}
app.use(errorHandler);
  
const PORT = process.env.PORT;
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
})