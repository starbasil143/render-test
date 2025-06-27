require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const Person = require('./models/person');

const app = express();

morgan.token('body', (req) => req.method==='POST'?JSON.stringify(req.body):'');

app.use(express.json());
app.use(express.static('dist'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/sine', (request,response) => {
  response.send('<h1>Cosine.</h1>');
});

app.get('/api/persons', (request,response) => {
  Person.find({}).then(people => {
    response.json(people);
  });
});

app.post('/api/persons', (request, response, next) => {
  const personData = request.body;

  const newPerson = new Person({
    name: personData.name,
    number: personData.number,
  });

  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error));

});

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
          response.json(updatedPerson);
        });
    })
    .catch (error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person){
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.get('/info', (request,response) => {
  Person.countDocuments({}).then(count => {
    response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${Date()}</p>
        `);
  });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name==='CastError'){
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name==='ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next (error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});