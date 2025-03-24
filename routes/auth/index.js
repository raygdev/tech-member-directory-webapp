const router = require('express').Router()

const { postRegister } = require('./register')
const { getVerifyAccount, postVerifyAccount } = require('./verify-account')

router.post('/register', postRegister),
router.post('/verify', postVerifyAccount)
router.get('/verify', getVerifyAccount)

module.exports = router