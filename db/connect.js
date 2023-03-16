const mongoose = require('mongoose')

const connectDB = (url) => {
  mongoose.set('setDefaultsOnInsert', false);
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
}

module.exports = connectDB
