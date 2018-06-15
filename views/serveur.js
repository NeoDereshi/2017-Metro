var express = require('express');
var serv = express();
var bodyParser = require('body-parser');
var functions = require('./create_graph.js');

serv.set('view engine', 'ejs');
serv.use(bodyParser.urlencoded({ extended: false}));
serv.use(express.static('docs/icones'))

//Pour bootstrap, code trouvé ici : http://stackoverflow.com/questions/26773767/purpose-of-installing-bootstrap-through-npm
//Sauf pour le dernier
serv.use('/', express.static(__dirname + '/www')); // redirect root
serv.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
serv.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
serv.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
serv.use('/fonts/', express.static(__dirname + '/node_modules/bootstrap/fonts'));

serv.listen(8080);

var graph = functions.create_graph();

serv.get('/', function(req, res){
  res.render("accueil.ejs", {v_error: "", v_s1: "", v_s2: ""});
});

serv.get('/#', function(req, res){
  res.render("accueil.ejs", {v_error: "", v_s1: "", v_s2: ""});
});

serv.get('/request', function(req, res){
  //console.log(req);
  var result = [];
  var nbOfResults = 0;

  /*if (req.query.search == ""){
    res.send("");
  }*/

  //On recherche déjà par les stations commençant par req.query.search
  for (var i = 0; i < graph.verticesNames.length; i++){
    if (graph.verticesNames[i].toLowerCase().startsWith(req.query.search.toLowerCase())){
      var presence = 0;

      for (var j = 0; j < nbOfResults; j++){
          if (result[j] == graph.verticesNames[i]){
            presence = 1;
          }
      }

      if (presence == 0){
        result.push(graph.verticesNames[i])
        nbOfResults++;
        if (nbOfResults == 5){
          break;
        }
      }
    }
  }

  //S'il reste encore des résultats possibles, on étend la sélection aux stations contenant le string req.query.search
  if (nbOfResults < 5){
    for (var i = 0; i < graph.verticesNames.length; i++){
      if (graph.verticesNames[i].toLowerCase().search(req.query.search.toLowerCase()) != -1){
        var presence = 0;

        for (var j = 0; j < nbOfResults; j++){
            if (result[j] == graph.verticesNames[i]){
              presence = 1;
            }
        }

        if (presence == 0){
          result.push(graph.verticesNames[i])
          nbOfResults++;
          if (nbOfResults == 5){
            break;
          }
        }
      }
    }
  }

  console.log(req.query.search);
  res.render('autocompletion.ejs', { v_res: result, v_input: req.query.input});
});

serv.post('/', function(req, res){
  //On regarde si les noms de station rentrées existent
  var error = "";
  var s1 = functions.findByName(req.body.s1);
  var s2 = functions.findByName(req.body.s2);

  //Si une des deux n'existe pas, on render l'accueil avec un message d'erreur
  if (s1 == -1 || s2 == -1){
    res.render("accueil.ejs", {v_s1: req.body.s1, v_s2: req.body.s2, v_error: "Au moins une des stations n'existe pas, veuillez vérifier l'orthographe" });
  }

  //Sinon on continue normalement
  //Objet contenant les variables qu'on donnera à render
  var args = {
    result: [],
    lignes: [],
    names: [],
    heure_dep: req.body.heure,
    minute_dep: req.body.minute,
    temps_trajet: 0,
    heure_arr: 0,
    minute_arr: 0
  };

  //On applique Dijsktra
  args.result = functions.dijsktra(graph, s1, s2);

  //On cherche les lignes auxquelles appartiennent les stations parcourues
  args.lignes = functions.searchLines(args.result);
  args.names = functions.getNames(graph, args.result);

  console.log(args.names);

  //On calcule le temps de trajet
  calcul_temps_parcours(args);

  //On render les résultats
  res.render("resultat.ejs", { v_args: args});
});

calcul_temps_parcours = function(args){
  var tmp_sec = 0;

  for (var i = 0; i < args.result.length - 1; i++){
    console.log(args.lignes[i]);
    if (args.lignes[i] != args.lignes[i + 1]){
      tmp_sec += 90;
      console.log(tmp_sec + " changement de ligne");
    } else {
      if (i != 0 && args.lignes[i] == args.lignes[i-1]){
        tmp_sec += 20;
        console.log(tmp_sec + " temps à quai");
      }
      tmp_sec += 72;
      console.log(tmp_sec + " trajet entre stations");

    }
  }

  args.temps_trajet = parseInt(tmp_sec/60);
  args.minute_arr = (parseInt(args.minute_dep) + parseInt(tmp_sec/60))%60;
  args.heure_arr = parseInt((parseInt(args.heure_dep) + (parseInt(args.minute_dep) + tmp_sec/60)/60)%24);
}
