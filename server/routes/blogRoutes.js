const express = require('express');
const router = express.Router();
const { getBlogData } = require('../controller/blogController');

router.get('/blog/:userId', getBlogData);

module.exports = router;




