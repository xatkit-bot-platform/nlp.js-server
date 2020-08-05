const express = require('express')
const router = express.Router()


router.get('/', (_, res) => {
    res.send("Welcome to xatkit-nlp.js-server")
})


module.exports = router
