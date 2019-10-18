const ArticlesService = {
    getAllArticles(knexInstance) {
        // return Promise.resolve('all the articles!!')
        return knexInstance.select('*').from('bookmarks')
        // return 'perche non fungi??'
    },
    insertArticle(knexInstance, newBookmark) {
       return knexInstance
            .insert(newBookmark)
            .into('bookmarks')
            .returning('*')
            .then(rows => {
                    return rows[0]
            })
    },
    getById(knexInstance, id) {
       return knexInstance
            .from('bookmarks')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteArticle(knexInstance, id) {
        return knexInstance
            .from('bookmarks')
            .where({ id })
            .delete()
    },
    updateArticle(knexInstance, id, newBookmarkFields) {
        return knexInstance
            .from('bookmarks')
            .where({ id })
            .update(newBookmarkFields)
    },
}

module.exports = ArticlesService