const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const hb = require('express-handlebars')
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

app.use(require('./router'))

app.listen(8080, () => {
    console.log("listening on port 8080")
})
