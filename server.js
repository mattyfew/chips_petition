const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const hb = require('express-handlebars')
const db = require('./db')
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const csurf = require('csurf')

// const session = require('express-session')
// app.use(session({
//     secret: 'keyboard cat',
//     maxAge: 1000 * 60 * 60 * 24 * 90,
//     saveUninitialized: true,
//     resave: false
// }))

app.use(cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}))

app.use(cookieParser())

app.engine('handlebars', hb({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

app.use(csurf())

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken()
    next()
})

// ----- Custom Middleware -----

function checkForSig(req, res, next) {
    if (!req.session.signatureId) {
        res.redirect('/')
    } else {
        next()
    }
}

function checkForNoSig(req, res, next) {
    if (req.session.signatureId) {
        res.redirect('/thanks')
    } else {
        next()
    }
}


app.get('/', (req, res) => {
    res.render('sign')
})

app.post('/submit-signer', checkForNoSig, (req, res) => {
    const { firstname, lastname, signature } = req.body

    db.insertNewSigner(firstname, lastname, signature)
        .then(userInfo => {
            req.session = {
                signatureId: userInfo.id,
                user: {
                    id: userInfo.id,
                    firstName: userInfo.first_name,
                    lastName: userInfo.last_name
                }
            }

            res.redirect('/thanks')
        })
})

app.get('/thanks', checkForSig, (req, res) => {
    Promise.all([
        db.getSignerCount(),
        db.getSig(req.session.signatureId)
    ])
    .then(([ count, sig ]) => {
        res.render('thanks', { count, sig })
    })
})

app.get('/signers', (req, res) => {
    db.getSigners()
        .then(signers => {
            res.render('signers', { signers })
        })
})

app.listen(8080, () => {
    console.log("listening on port 8080")
})
