const express = require('express')
const router = express.Router()

router.get('/', (_, res) => {
    res.send("Welcome to nlp.js server")
})

module.exports = router
