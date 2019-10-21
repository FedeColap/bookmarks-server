const path = require('path')
const express = require('express')
const uuid = require('uuid/v4');
const logger = require('./logger')
const ArticlesService = require('./articles-service')
const bookRouter = express.Router()
const bodyParser = express.json()
const xss = require('xss')

// const bookmarks = [
//     {
//       id: 0,
//       title: 'Google',
//       url: 'http://www.google.com',
//       rating: '3',
//       desc: 'Internet-related services and products.'
//     },
//     {
//       id: 2,
//       title: 'Github',
//       url: 'http://www.github.com',
//       rating: '4',
//       desc: 'brings together the world\'s largest community of developers.'
//     }
// ]

const sanitizeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    rating: bookmark.rating,
    description: xss(bookmark.description)
})

bookRouter
    .route('/')
    .get((req, res, next) => {
        // res.json(bookmarks);
        const knexInstance = req.app.get('db')
        ArticlesService.getAllArticles(knexInstance)
        .then(bookmarks => {
            res.json(bookmarks)
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { title, url, rating, description } = req.body
        const newBookmark = { title, url, rating, description }

        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }
        ArticlesService.insertArticle(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
                .json(sanitizeBookmark(bookmark))
        })
        .catch(next)

        // if (!title) {
        //     logger.error(`Title is required`);
        //     return res.status(400).send('Invalid data');
        // }
        // if (!url) {
        //     logger.error(`Url is required`);
        //     return res.status(400).send('Invalid data');
        // }
        // if (!rating) {
        //     logger.error(`Rating is required`);
        //     return res.status(400).send('Invalid data');
        // }
        // // if (!desc) {
        // //      return desc = null; -----------it gives me "message": "Assignment to constant variable."
        // // }
        // if (!description) {
        //     logger.error(`Description is required`);
        //     return res.status(400).send('Invalid data');
        // }
        // const id = uuid();
        // const bookmark = {
        //     id,
        //     title,
        //     url, 
        //     rating, 
        //     description
        // };
            
        // bookmarks.push(bookmark);

        // logger.info(`Bookmark with id ${id} created`);

        // res.status(201).location(`http://localhost:8000/list`).json(bookmark);

    })

bookRouter
    .route('/:id')
    .all((req, res, next) => {
        const { id } = req.params;
        const knexInstance = req.app.get('db')
            ArticlesService.getById(knexInstance, id)
            .then(bookmark => {
                if (!bookmark) {
                   return res.status(404).json({
                     error: { message: `Bookmark doesn't exist` }
                   })
                }
                res.bookmark = bookmark // save the bookmark for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    })
    .get((req, res, next) => {
        // const { id } = req.params;
        // const bookmark = bookmarks.find(c => c.id == id);

        // // make sure we found a card
        // if (!bookmark) {
        //     logger.error(`Bookmark with id ${id} not found.`);
        //     return res.status(404).send('Bookmark Not Found');
        // }

        // res.json(bookmark);
        //================================================================
        // const knexInstance = req.app.get('db')
        // ArticlesService.getById(knexInstance, id)
        //     .then(bookmark => {
        //         if (!bookmark) {
        //             return res.status(404).json({
        //                 error: { message: `Bookmark doesn't exist` }
        //             })
        //         }
        //         res.json(bookmark)
        //     })
        //     .catch(next)
        res.json(sanitizeBookmark(res.bookmark))
        
    })
    .delete((req, res, next) => {
        const { id } = req.params;
        const knexInstance = req.app.get('db')
        ArticlesService.deleteArticle(knexInstance, id)
            .then(() => {
                
              res.status(204).end()
            })
            .catch(next)
        // const { id } = req.params;
        // const listIndex = bookmarks.findIndex(li => li.id == id);
        // if (listIndex === -1) {
        //     logger.error(`Bookmark with id ${id} not found.`);
        //     return res.status(404).send('Not Found');
        // }
        // bookmarks.splice(listIndex, 1);
        
        // logger.info(`Bookmark with id ${id} deleted.`);
        // res.status(204).end();
    })
    .patch((req, res) => {
       res.status(204).end()
    })

module.exports = bookRouter

