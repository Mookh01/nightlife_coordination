If Program isn't working locally:
1. create a env.js file
2. Place the following information inside. 


    process.env['CONSUMER_KEY'] = "YuqNwDTWEYNoS286colqow"
    process.env['CONSUMER_SECRET'] = "ApZGcNohWDBaU1nYTYj-9KMd3mo"
    process.env['ACCESS_TOKEN_KEY'] = "VyhRLBUiXga_9pCOXZPmUV16FZXrGlJ5"
    process.env['ACCESS_TOKEN_SECRET'] = "bz4Ydhx4VHZVTiUxQzaHKtXW6HY"


3. In the app.js file, place right below "module.exports = router;"

if (!process.env.CONSUMER_KEY) {
         var env = require('./env.js')
 }
