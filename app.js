// Final Team Project
// Submission By: 
// Dhariya Vinod Vayas: C0840249
// Hemani Patel: C0853622
// Anik Hasan: C0847377
// Md Kamrul Islam Antar: C0826256
// Ishank Agarwal: C0850072

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public', {
    extensions: ['html']
  }));
app.set('views', path.join(__dirname, 'public'));

app.use(function (req, res, next) {
    console.log("METHOD ::>> ", req.method , " URL :>> ", req.protocol + '://' + req.get('host') + req.originalUrl);
    console.log('req.body :>> ', req.body);
    console.log('req.params :>> ', req.params);
    console.log('req.query :>> ', req.query);
    console.log("------------------------");
    next();
});
const carController = require('./controllers/cars');
app.use('/', carController);


app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});
