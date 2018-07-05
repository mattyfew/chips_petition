const spicedPg = require('spiced-pg')
const db = spicedPg('postgres:mattfewer:postgres@localhost:5432/petition')

exports.getSigners = function() {
    const q = 'SELECT * FROM users'

    return db.query(q).then(results => results.rows)
}

exports.insertNewSigner = function(firstName, lastName, sig) {
    const q = `
        INSERT INTO users (first_name, last_name, signature)
            VALUES ($1, $2, $3)
            RETURNING *
    `
    const params = [ firstName, lastName, sig ]

    return db.query(q, params).then(results => results.rows[0])
}

exports.getSignerCount = function() {
    const q = 'SELECT COUNT(*) FROM users'

    return db.query(q)
        .then(results => results.rows[0].count)
}

exports.getSig = function(sigId) {
    const q = 'SELECT signature FROM users WHERE id = $1'
    const params = [ sigId ]

    return db.query(q, params)
        .then(results => results.rows[0].signature)
}
