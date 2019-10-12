
const app = require('../src/app')

describe('App', () => {
    it('GET / responds with 200 containing "Fede, Speranza e Carita"', () => {
        return supertest(app)
                            .get('/')
                            .expect(200, 'Fede, Speranza e Carita')
    })
})