const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const hb = require('express-handlebars')

app.engine('handlebars', hb({
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))


app.get('/', (req, res) => {
    res.render('sign')
})

app.listen(8080, () => {
    console.log("listening on port 8080")
})
