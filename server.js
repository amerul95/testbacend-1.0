const express = require('express');
const sql = require('mssql');
const dbConfigEcom = require('./config/dbConfigecom.js'); // Correct path to ecom config
const dbConfigAuth = require('./config/dbConfigAuth.js');
const path = require('path')

const app = express();
const port = 3000;

app.use('/images', express.static(path.join(__dirname, 'images')));

const ecomDBPool = new sql.ConnectionPool(dbConfigEcom);
const authDBPool = new sql.ConnectionPool(dbConfigAuth);

ecomDBPool.connect(err => {
    if(err){
        console.log('cannot connect',err)
    } else {
        console.log('connected')
    }
})
authDBPool.connect(err => {
    if(err){
        console.log('cannot connect',err)
    } else {
        console.log('connected')
    }
})
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});