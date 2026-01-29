const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const router = require("./routes");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 8000;

app.use(router);
router.use('/images', express.static('images'));

app.listen(port, () => console.log(`Magic happens on port ${port}`));
