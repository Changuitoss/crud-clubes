const fs = require('fs');
const express = require('express');
const multer = require('multer');

const upload = multer({ dest: './uploads/imagenes' });
const exphbs = require('express-handlebars');

const PUERTO = 8080;
const app = express();
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(`${__dirname}/public`));
app.use(express.static(`${__dirname}/uploads`));
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('home', {
    layout: 'base',
    equipos: JSON.parse(fs.readFileSync('./data/equipos.json'))
  });
});

app.get('/equipo/:id', (req, res) => {
  res.render('equipo', {
    layout: 'base',
    equipo: JSON.parse(fs.readFileSync(`./data/equipos/${req.param('id')}.json`))
  });
});

app.get('/agregar', (req, res) => {
  res.render('agregar', {
    layout: 'base'
  });
});

app.post('/agregar', upload.single('crestUrl'), (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.json'));
  const ids = equipos.map(equipo => equipo.id).sort((a,b) => a > b ? 1 : -1);
  const idNuevo = ids[ids.length - 1] + 1;
  const { name, tla, founded, venue } = req.body;
  const equipoNuevo = {
    id: idNuevo,
    name,
    crestUrl: `/imagenes/${req.file.filename}`,
    tla,
    founded,
    venue
  }
  equipos.push(equipoNuevo);
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos));
  fs.writeFileSync(`./data/equipos/${tla}.json`, JSON.stringify(equipoNuevo));
  console.log(JSON.parse(fs.readFileSync('./data/equipos.json'))); 

/*   res.render(`/equipo:${idNuevo}`, {
    layout: 'base',
    equipo: JSON.parse(fs.readFileSync(`./data/equipos/${req.param('id')}.json`))
  }); */
});

app.listen(PUERTO);
