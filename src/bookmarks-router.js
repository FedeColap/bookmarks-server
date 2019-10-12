const express = require('express')
const uuid = require('uuid/v4');
const logger = require('./logger')
const bookRouter = express.Router()
const bodyParser = express.json()

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

bookRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
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

    })

bookRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(c => c.id == id);

     // make sure we found a card
     if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res.status(404).send('Card Not Found');
     }

     res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;
        const listIndex = bookmarks.findIndex(li => li.id == id);
        if (listIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res.status(404).send('Not Found');
        }
        bookmarks.splice(listIndex, 1);
        
        logger.info(`Bookmark with id ${id} deleted.`);
        res.status(204).end();
    })

module.exports = bookRouter