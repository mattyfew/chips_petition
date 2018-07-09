const router = require('express').Router()
const db = require('./db')


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

function checkForLogin(req, res, next) {
    if (!req.session.user || !req.session.user.id) {
        res.redirect('/')
    } else {
        next()
    }
}

function checkForNoLogin(req, res, next) {
    if (req.session.user && req.session.user.id) {
        res.redirect('/sign')
    } else {
        next()
    }
}



router.get('/', checkForNoLogin, (req, res) => {
    res.render('registration')
})

router.post('/registration', (req, res) => {
    const { firstname, lastname, email, password } = req.body

    db.registerNewUser(firstname, lastname, email, password)
        .then(id => {
            req.session.user = {
                id, firstname, lastname, email
            }
            res.redirect('/profile')
        })
})

router.get('/login', checkForNoLogin, (req, res) => {
    res.render('login')
})

router.post('/login', (req, res) => {
    db.checkForEmail(req.body.email)
        .then(result => {
            if (result) {
                db.loginUser(result)
                    .then(() => {})
            } else {
                res.render('login', { error: true })
            }
        })
})

router.get('/profile', checkForLogin, (req, res) => {
    res.render('profile')
})

router.post('/profile', (req, res) => {
    const { age, city, url } = req.body

    db.insertProfileInfo(req.session.user.id, age, city, url)
        .then(userProfileInfo => {
            console.log("success inserting profile info", userProfileInfo);
            res.redirect('/sign')
        })
})

router.get('/sign', checkForLogin, checkForNoSig, (req, res) => {
    res.render('sign')
})

router.post('/submit-signer', (req, res) => {
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

router.get('/thanks', checkForSig, (req, res) => {
    Promise.all([
        db.getSignerCount(),
        db.getSig(req.session.signatureId)
    ])
    .then(([ count, sig ]) => {
        res.render('thanks', { count, sig })
    })
})

router.get('/signers', checkForSig, (req, res) => {
    db.getSigners()
        .then(signers => {
            res.render('signers', { signers })
        })
})


module.exports = router
