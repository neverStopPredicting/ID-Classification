const express = require('express');
const app = express();
const submit = require('./submit');

app.use('/submit', submit)

const port = +process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})