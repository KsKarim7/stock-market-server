const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('the virtual warehouse is manufacturing')
});

app.listen(port, () => {
    console.log('hearing to port', port)
})