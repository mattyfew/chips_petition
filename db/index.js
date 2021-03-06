const spicedPg = require('spiced-pg')
const db = spicedPg('postgres:mattfewer:postgres@localhost:5432/petition')
const bcrypt = require('bcryptjs')

exports.getSigners = function() {
    const q = `
        SELECT users.first_name, users.last_name, user_profiles.age, user_profiles.city, user_profiles.url, signatures.user_id
        FROM users
        FULL OUTER JOIN user_profiles
            ON users.id = user_profiles.user_id
        JOIN signatures
            ON users.id = signatures.user_id
        WHERE signatures.id IS NOT NULL;
    `

    return db.query(q)
        .then(results => results.rows)
        .catch(e => console.log("There was an error in getSigners", e))
}

exports.getSignersByCity = function(city) {
    const q = `
        SELECT users.first_name, users.last_name, user_profiles.age, user_profiles.city, user_profiles.url
        FROM users
        JOIN user_profiles
            ON users.id = user_profiles.user_id
        JOIN signatures
            ON user_profiles.user_id = signatures.user_id
        WHERE signatures.id IS NOT NULL
        AND city = $1;
    `
    const params = [ city]

    return db.query(q, params)
        .then(results => results.rows)
        .catch(e => console.log("There was an error in getSignersByCity", e))
}

exports.insertNewSigner = function(userId, sig) {
    const q = `
        INSERT INTO signatures (user_id, signature)
            VALUES ($1, $2)
            RETURNING *
    `
    const params = [ userId, sig ]

    return db.query(q, params)
        .then(results => results.rows[0])
        .catch(e => console.log("There was an error in insertNewSigner", e))
}

exports.getSignerCount = function() {
    const q = 'SELECT COUNT(*) FROM users'

    return db.query(q)
        .then(results => results.rows[0].count)
        .catch(e => console.log("There was an error in getSignerCount", e))

}

exports.getSig = function(sigId) {
    const q = 'SELECT signature FROM signatures WHERE id = $1'
    const params = [ sigId ]

    return db.query(q, params)
        .then(results => results.rows[0].signature)
        .catch(e => console.log("There was an error in getSig", e))
}

exports.login = function(userInfo, plainTextPassword) {
    checkPassword(plainTextPassword, userInfo.password)
        .then(match => {
            console.log(match);

            if (match) {

            }
        })
}

exports.checkForEmail = function(email) {
    const q = 'SELECT * FROM users WHERE email = $1'
    const params = [ email ]

    return db.query(q, params)
        .then(results => {
            return results.rows[0]
                ? results.rows[0]
                : false
        })
}

exports.registerNewUser = function(firstName, lastName, email, password) {
    return exports.hashPassword(password)
        .then(hash => {
            const q = `
                INSERT INTO users (first_name, last_name, email, password)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id
            `
            const params = [ firstName, lastName, email, hash ]

            return db.query(q, params)
                .then(results => Promise.resolve(results.rows[0].id))
        })
        .catch(e => console.log("There was an error in registerNewUser", e))
}

exports.insertProfileInfo = function(userId, age, city, url) {
    const q = `
        INSERT INTO user_profiles (user_id, age, city, url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
    `
    const params = [ userId, age || null, city || null, url || null ]

    return db.query(q, params)
        .then(results => results.rows[0])
}

exports.getProfileInfo = function(userId) {
    const q = `
        SELECT * FROM users
        JOIN user_profiles
            ON users.id = user_profiles.user_id
        WHERE users.id = $1
    `
    const params = [ userId ]

    return db.query(q, params)
        .then(results => results.rows[0])
}

exports.checkForSigId = function(userId) {
    const q = `SELECT id FROM signatures WHERE user_id = $1`
    const params = [ userId ]

    return db.query(q, params)
        .then(results => results.rows[0] && results.rows[0].id)
}

exports.deleteSig = function(sigId){
    const q = `
        DELETE FROM signatures WHERE id = $1
    `
    const params = [ sigId ]

    return db.query(q, params)
}

// ============= BCRYPT ================

exports.hashPassword = function(plainTextPassword) {
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

exports.checkPassword = function(textEnteredInLoginForm, hashedPasswordFromDatabase) {
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
