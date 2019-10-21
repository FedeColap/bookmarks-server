const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')
const bookRouter = require('../src/bookmarks-router')


describe.only('Bookmarks Endpoints', function() {
    let db
    before('make knex instance', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    //TEST I HAVE NOT EVEN CONSIDERED THE UNAUTHORIZED CASE----------------------------

    // describe(`Unauthorized requests`, () => {
    //     it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
    //       return supertest(app)
    //         .get('/bookmarks')
    //         .expect(401, { error: 'Unauthorized request' })
    //     })
    
    //     it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
    //       return supertest(app)
    //         .post('/bookmarks')
    //         .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
    //         .expect(401, { error: 'Unauthorized request' })
    //     })
    
    //     it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
    //       const secondBookmark = store.bookmarks[1]
    //       return supertest(app)
    //         .get(`/bookmarks/${secondBookmark.id}`)
    //         .expect(401, { error: 'Unauthorized request' })
    //     })
    
    //     it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
    //       const aBookmark = store.bookmarks[1]
    //       return supertest(app)
    //         .delete(`/bookmarks/${aBookmark.id}`)
    //         .expect(401, { error: 'Unauthorized request' })
    //     })
    // })

    describe(`GET /api/bookmarks`, () => {
        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
        
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
        
            it('responds with 200 and all of the articles', () => {
                return supertest(app)
                    .get('/api/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks)
            })
        })

        context(`Given no bookmarks`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })
    })
    
    describe(`GET /api/bookmarks/:bookmark_id`, () => {
        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
        
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
        
            it('responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedBookmark)
            })
        })

        context(`Given an XSS attack article`, () => {
            const maliciousBookmark = {
                id: 911,
                title: 'Naughty naughty very naughty <script>alert("xss");</script>',
                url: 'https://www.hackers.com',
                description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                rating: 1,
            }
        
            beforeEach('insert malicious article', () => {
               return db
                .into('bookmarks')
                .insert([ maliciousBookmark ])
            })
        
            it.skip('removes XSS attack content', () => {
                return supertest(app)
                  .get(`/api/bookmarks`)
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .expect(200)
                  .expect(res => {
                    expect(res.body[0].title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                    expect(res.body[0].description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                  })
              })
        })

        context(`Given no bookmarks`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                    .get(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })
    })

    describe(`POST /api/bookmarks`, () => {
        const requiredFields = ['title', 'url', 'description', 'rating']
        requiredFields.forEach(field => {
            const newBookmark = {
                title: 'Test new bookmark',
                url: 'http://www.examplebookmark.com',
                rating: 4,
                description: 'Test new bookmark description...'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field] 
                return supertest(app)
                    .post('/api/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })


        it(`creates a bookmark, responding with 201 and the new bookmark`,  function() {
            const newBookmark = {
                   title: 'Test new bookmark',
                   url: 'http://www.examplebookmark.com',
                   rating: 4,
                   description: 'Test new bookmark description...'
            }
            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
                })
                .then(postRes =>
                    supertest(app)
                    .get(`/api/bookmarks/${postRes.body.id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(postRes.body)
                )
        })

        context(`Given an XSS attack article`, () => {
            const maliciousBookmark = {
                id: 911,
                title: 'Naughty naughty very naughty <script>alert("xss");</script>',
                url: 'https://www.hackers.com',
                description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                rating: 1,
            }
        
            it.skip('removes XSS attack content in POST', () => {
                return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(maliciousBookmark)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                        expect(res.body.rating).to.eql(maliciousBookmark.rating)
                        expect(res.body.url).to.eql('https://url.to.file.which/does-not.exist')
                        expect(res.body.description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                    })
                    .then(postRes =>
                        supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(postRes.body)
                    )
            })
        })

    })

    describe('DELETE /api/bookmarks/:id', () => {
        context(`Given no bookmarks`, () => {
          it(`responds 404 whe bookmark doesn't exist`, () => {
            return supertest(app)
              .delete(`/api/bookmarks/123`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(404, {
                error: { message: `Bookmark doesn't exist` }
              })
          })
        })
    
        context('Given there are bookmarks in the database', () => {
          const testBookmarks = makeBookmarksArray()
    
          beforeEach('insert bookmarks', () => {
            return db
              .into('bookmarks')
              .insert(testBookmarks)
          })
    
          it('removes the bookmark by ID from the store', () => {
            const idToRemove = 2
            const expectedBookmarks = testBookmarks.filter(bm => bm.id !== idToRemove)
            return supertest(app)
              .delete(`/api/bookmarks/${idToRemove}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(204)
              .then(() =>
                supertest(app)
                  .get(`/api/bookmarks`)
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .expect(expectedBookmarks)
              )
          })
        })
      })

      describe(`PATCH /api/bookmarks/:bookmark_id`, () => {
           context(`Given no bookmarks`, () => {
             it(`responds with 404`, () => {
               const bookmarkId = 123456
               return supertest(app)
                    .patch(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
             })
           })

            context('Given there are bookmarks in the database', () => {
                const testBookmarks = makeBookmarksArray()
            
                 beforeEach('insert articles', () => {
                   return db
                     .into('bookmarks')
                     .insert(testBookmarks)
                 })
            
                 it('responds with 204 and updates the bookmark', () => {
                   const idToUpdate = 2
                   const updateBookmark = {
                     title: 'updated bookmark title',
                     description: 'updated bookmark content',
                   }
                   return supertest(app)
                     .patch(`/api/bookmarks/${idToUpdate}`)
                     .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                     .send(updateBookmark)
                     .expect(204)
                 })
            })
     })


})