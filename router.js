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



// ============= ROUTES ================


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
        .then(userInfo => {
            if (userInfo) {
                db.checkPassword(req.body.password, userInfo.password)
                    .then(match => {
                        if (match) {
                            req.session.user = {
                                id: userInfo.id,
                                email: userInfo.email,
                                firstName: userInfo.first_name,
                                lastName: userInfo.last_name
                            }
                            res.redirect('/sign')
                        } else {
                            res.render('login', {
                                error: "passwords did not match"
                            })
                        }
                    })
            } else {
                res.render('login', { error: "That email does not exist" })
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

router.get('/profile/edit', checkForLogin, (req, res) => {
    db.getProfileInfo(req.session.user.id)
        .then(userInfo => {
            res.render('edit', { userInfo })
        })
})

router.post('/profile/edit', checkForLogin, (req, res) => {
    const { firstname, lastname, password, age, city, url } = req.body

    if (password) {
        // change password
        console.log("they want to change their password");
        db.hashPassword(password)

    } else {
        // skip password stuff
        console.log("no password change");

    }
})




router.get('/sign', checkForLogin, checkForNoSig, (req, res) => {
    res.render('sign')
})

router.post('/submit-signer', (req, res) => {
    db.insertNewSigner(req.session.user.id, req.body.signature)
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

router.get('/thanks', checkForLogin, checkForSig, (req, res) => {
    Promise.all([
        db.getSignerCount(),
        db.getSig(req.session.signatureId)
    ])
    .then(([ count, sig ]) => {
        res.render('thanks', { count, sig })
    })
})

router.get('/signers', checkForLogin, checkForSig, (req, res) => {
    db.getSigners()
        .then(signers => {
            res.render('signers', { signers })
        })
})

router.get('/signers/:city', (req, res) => {
    db.getSignersByCity(req.params.city)
    // db.getSignersByCity(req.params.city.toLowerCase())
        .then(signers => {
            console.log(signers);
            res.render('city', { signers })
        })
})

module.exports = router
