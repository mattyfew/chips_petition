const spicedPg = require('spiced-pg')
const db = spicedPg('postgres:mattfewer:postgres@localhost:5432/petition')
const bcrypt = require('bcryptjs')

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

exports.login = function() {}

exports.registerNewUser = function(firstName, lastName, email, password) {
    return hashPassword(password)
        .then(hash => {
            const q = `
                INSERT INTO users (first_name, last_name, email, password)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id
            `
            const params = [ firstName, lastName, email, hash ]

            return db.query(q, params)
                .then(results => {
                    console.log(results.rows);
                    return Promise.resolve(results.rows[0].id)
                })
        })
        .catch(e => {
            console.log("There was an error in registerNewUser", e)
        })
}

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err)
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err)
                }
                resolve(hash)
            })
        })
    })
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                reject(err)
            } else {
                resolve(doesMatch)
            }
        })
    })
}
