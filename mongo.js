const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('include password as argument');
  process.exit(1);
}


const password = process.argv[2];

const url = `mongodb+srv://basil:${password}@cluster0.ebz6bgg.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model('Person', personSchema);


if (process.argv.length === 3) {
  Person.find({}).then( result => {
    console.log('Phonebook\n--------');
    result.forEach(person => {
      console.log(`${person.name}: ${person.number}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {

  const bobby = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  bobby.save().then(() => {
    console.log('Person saved.');
    mongoose.connection.close();
  });
} else {
  console.log('Usage: node mongo.js <password> <name> <number>. Omit name and number to view data.');
}