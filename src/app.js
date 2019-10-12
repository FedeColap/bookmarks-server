require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const winston = require('winston');
const uuid = require('uuid/v4');
const { NODE_ENV } = require('./config')

const app = express()

const morganOption = (NODE_ENV === 'production')? 'tiny': 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(express.json());
app.use(cors())

// set up winston
const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'info.log' })
     ]
});
   
if (NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
          format: winston.format.simple()
     }));
}
app.use(function validateBearerToken(req, res, next) {
     const apiToken = process.env.API_TOKEN
     const authToken = req.get('Authorization')
   
     if (!authToken || authToken.split(' ')[1] !== apiToken) {
          logger.error(`Unauthorized request to path: ${req.path}`);
          return res.status(401).json({ error: 'Unauthorized request' })
     }
     // move to the next middleware
     next()
})

const bookmarks = [
     {
       id: 0,
       title: 'Google',
       url: 'http://www.google.com',
       rating: '3',
       desc: 'Internet-related services and products.'
     },
     {
       id: 2,
       title: 'Github',
       url: 'http://www.github.com',
       rating: '4',
       desc: 'brings together the world\'s largest community of developers.'
     }
]

app.get('/', (req, res) => {
       res.send('Fede, Speranza e Carita')
})
// app.get('/bookmark', (req, res) => {
//      res.json(cards);
// });
   
app.get('/list', (req, res) => {
     res.json(bookmarks);
});
app.post('/list', (req, res) => {
     const { title, url, rating, desc } = req.body;


     if (!title) {
          logger.error(`Title is required`);
          return res.status(400).send('Invalid data');
     }
     if (!url) {
          logger.error(`Url is required`);
          return res.status(400).send('Invalid data');
     }
     if (!rating) {
          logger.error(`Rating is required`);
          return res.status(400).send('Invalid data');
     }
     // if (!desc) {
     //      return desc = null; -----------it gives me "message": "Assignment to constant variable."
     // }
     if (!desc) {
          logger.error(`Description is required`);
          return res.status(400).send('Invalid data');
     }
     const id = uuid();
     const bookmark = {
          id,
          title,
          url, 
          rating, 
          desc
     };
        
     bookmarks.push(bookmark);

     logger.info(`Bookmark with id ${id} created`);

     res.status(201).location(`http://localhost:8000/list`).json(bookmark);
});
app.delete ('/list/:id', (req, res) => { 
     const { id } = req.params;
     const listIndex = bookmarks.findIndex(li => li.id == id);
     if (listIndex === -1) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res.status(404).send('Not Found');
     }
     bookmarks.splice(listIndex, 1);
      
     logger.info(`Bookmark with id ${id} deleted.`);
     res.status(204).end();
});

app.use(function errorHandler(error, req, res, next) {
   let response
   if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
   } else {
        console.error(error)
        response = { message: error.message, error }
   }
   res.status(500).json(response)
})

module.exports = app;
