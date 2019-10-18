function makeBookmarksArray() {
    return [
        {
            id: 1, 
            title: 'Etsy',
            url: 'https://www.etsy.com/',
            description: 'sito di opere fai da te',
            rating: 3
        },
        {
            id: 2, 
            title: 'OVS',
            url: 'https://www.ovsfashion.com/',
            description: 'negozio di abbigliamento',
            rating: 4
        },
        {
            id: 3, 
            title: 'Chi Chi London',
            url: 'https://www.chichiclothing.com/',
            description: 'negozio di abbigliamento online',
            rating: 3
        }
    ]
}
module.exports = {
    makeBookmarksArray
}