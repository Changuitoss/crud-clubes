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

app.get('/agregarequipo', (req, res) => {
  res.render('agregarequipo', {
    layout: 'base'
  });
});

app.post('/agregarequipo', upload.single('crestUrl'), (req, res) => {
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
    venue,
    squad: []
  }

  equipos.push(equipoNuevo);
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos));
  fs.writeFileSync(`./data/equipos/${tla}.json`, JSON.stringify(equipoNuevo));

  res.render('equipo', {
    layout: 'base',
    equipo: JSON.parse(fs.readFileSync(`./data/equipos/${tla}.json`))
  });
});

app.get('/editar/:tla', (req, res) => {
  let equipo = JSON.parse(fs.readFileSync(`./data/equipos/${req.param('tla')}.json`));
  
  res.render('editar', {
    layout: 'base',
    equipo
  });
});

app.post('/editar/:tla', upload.single('escudo'), (req, res) => {
  let equipo = JSON.parse(fs.readFileSync(`./data/equipos/${req.param('tla')}.json`));
  
  if (req.file) {
    equipo.crestUrl = `/imagenes/${req.file.filename}`;
    fs.writeFileSync(`./data/equipos/${req.param('tla')}.json`, JSON.stringify(equipo));

    return res.render('editar', {
      layout: 'base',
      equipo
    });
  }

  const { name, tla, founded, venue } = req.body;
  equipo.name = name;
  equipo.tla = tla;
  equipo.founded = founded;
  equipo.venue = venue;

  if(equipo.squad) {
    equipo.squad.forEach((jugador, i) => {
      jugador.name = req.body.jugadorname[i];
      jugador.countryOfBirth = req.body.countryOfBirth[i];
      jugador.position = req.body.position[i];
    })
  }

  res.render('equipo', {
    layout: 'base',
    equipo
  }); 
});

app.get('/agregarjugador/:tla', (req, res) => {
  res.render('agregarjugador', {
    layout: 'base',
    equipo: req.param('tla')
  });
});

app.post('/agregarjugador/:tla', (req, res) => {
  const equipo = JSON.parse(fs.readFileSync(`./data/equipos/${req.param('tla')}.json`));
  const idJugadores = equipo.squad.map(jugador => jugador.id).sort((a,b) => a > b ? 1 : -1);
  const dataJugador = req.body;

  dataJugador.id = idJugadores[idJugadores.length - 1] + 1;
  equipo.squad.push(req.body);
  fs.writeFileSync(`./data/equipos/${req.param('tla')}.json`, JSON.stringify(equipo));

  res.render('equipo', {
    layout: 'base',
    equipo: JSON.parse(fs.readFileSync(`./data/equipos/${req.param('tla')}.json`))
  });
});

app.post('/borrarequipo/:tla', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.json'));
  const equiposNuevo = equipos.filter(equipo => equipo.tla !== req.param('tla'));
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equiposNuevo))
  
  res.render('home', {
    layout: 'base',
    equipos: JSON.parse(fs.readFileSync('./data/equipos.json'))
  })
})


app.listen(PUERTO);
