const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const hb = require('express-handlebars')
const db = require('./db')
const session = require('express-session')

app.use(session({
  secret: 'keyboard cat',
  maxAge: 1000 * 60 * 60 * 24 * 90
}))

app.engine('handlebars', hb({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))


app.get('/', (req, res) => {
    res.render('sign')
})

app.post('/submit-signer', (req, res) => {
    const { firstname, lastname, signature } = req.body

    db.insertNewSigner(firstname, lastname, signature)
        .then(userInfo => {
            req.session.user = {
                id: userInfo.id,
                firstName: userInfo.first_name,
                lastName: userInfo.last_name
            }
            res.redirect('/thanks')
        })
})

app.get('/thanks', (req, res) => {
    db.getSignerCount()
        .then(count => {
            res.render('thanks', { count })
        })
})

app.get('/signers', (req, res) => {
    res.render('signers')
})

app.listen(8080, () => {
    console.log("listening on port 8080")
})
