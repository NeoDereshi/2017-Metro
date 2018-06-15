var fs = require('fs');

//On va stocker tous les fichiers dans des variables
var dataLigne = [];
for (var i = 1; i <= 14; i++){
  dataLigne[i] = fs.readFileSync('docs/metro_ligne' + i + '.stations');
}
var dataLigne7b = fs.readFileSync('docs/metro_ligne7b.stations');
var dataLigne3b = fs.readFileSync('docs/metro_ligne3b.stations');
var labels = fs.readFileSync('docs/metro_graphe.labels');
var edges = fs.readFileSync('docs/metro_graphe.edges');

module.exports = {
  create_graph: function(){
    //On créé le graph
    var graph = new Graph();

    //On ajoute les sommets
    var datasplit = labels.toString().split("\n");

    for(var i = 0; i < datasplit.length - 1; i++){
      var infos = datasplit[i].split(/ (.+)/);
      graph.addVertex(infos[0], infos[1]);
    }

    //On ajoute chaque arête
    datasplit = edges.toString().split('\n');

    for(var i = 0; i < datasplit.length - 1; i++){
      var infos = datasplit[i].split(' ');
      graph.addEdge(infos[0], infos[1], infos[2]);
    }

    //Le graph est créé
    console.log("graph créé");
    return graph;
  },

  dijsktra: function(graph, vertexSource, vertexDestination){
    //On va lancer dijsktra sur tous les homonymes des stations concernées
    //Et récupérer le plus optimal
    var result;
    var path_to_return = [];
    var distance_min = 9999;

    //On boucle sur les homonymes de source et de destination
    //La condition est très longue à cause de Châtelet, perturbé dans la fichier, par la présence de Châtelet pont au change en plein milieu de plusieurs Châtelet
    for (var i = vertexSource; graph.verticesNames[i] == graph.verticesNames[vertexSource] || graph.verticesNames[i+1] == graph.verticesNames[vertexSource]; i++){
      for (var j = vertexDestination; graph.verticesNames[j] == graph.verticesNames[vertexDestination] || graph.verticesNames[j+1] == graph.verticesNames[vertexDestination]; j++){
        result = graph.dijsktraMain(i, j);
        if (result.distance < distance_min){
          path_to_return = result.optimal_path;
          distance_min = result.distance;
        }
      }
    }

    return path_to_return;
  },

  findByName: function(stationName){
    var datasplit = labels.toString().split('\n');

    for (var i = 0; i < datasplit.length; i++){
      if (datasplit[i].split(/ (.+)/)[1] == stationName){
        return datasplit[i].split(/ (.+)/)[0];
      }
    }
    return -1;
  },

  searchLines: function(result){
    var lignes = [];

    for (var i = 0; i < result.length; i++){
      //On regarde pour chaque ligne de métro
      for (var j = 1; j <= 14; j++){
        //On regarde pour la ligne k
        var split = dataLigne[j].toString().split('\n');
        for (var k = 0; k < split.length; k++){
          if (split[k] == result[i]){
            lignes.push(j.toString());
            break;
          }
        }
      }
      //On regarde pour la ligne 3b
      var split = dataLigne3b.toString().split('\n');
      for (var k = 0; k < split.length; k++){
        if (split[k] == result[i]){
          lignes.push("3b");
          break;
        }
      }
      //On regarde pour la ligne 7b
      split = dataLigne7b.toString().split('\n');
      for( var k = 0; k < split.length; k++){
        if (split[k] == result[i]){
          lignes.push("7b");
          break;
        }
      }
    }

    return lignes;
  },

  getNames: function(graph, result){
    return graph.getNames2(result);
  }

}

//Le code suivant est récupéré depuis http://blog.benoitvallon.com/data-structures-in-javascript/the-graph-data-structure/
//Il a ensuite été modifié pour les besoins du DM
//Il a, entre autre, fallu ajouter le poids des arêtes
function Graph() {
  this.vertices = [];
  this.verticesNames = [];
  this.edges = [];
  this.edgesWeight = [];
  this.numberOfEdges = 0;
}

Graph.prototype.addVertex = function(vertex, name) {
  this.vertices.push(vertex);
  this.verticesNames.push(name);
  this.edges[vertex] = [];
  this.edgesWeight[vertex] = [];
  console.log("J'ajoute le vertex : " + vertex + " de nom : " + name);
};

Graph.prototype.addEdge = function(vertex1, vertex2, weight) {
  this.edges[vertex1].push(vertex2);
  this.edgesWeight[vertex1][vertex2] = parseInt(weight);
  this.numberOfEdges++;
  console.log("J'ajoute l'arête de " + vertex1 + " vers " + vertex2 + " de poids : " + weight);
};

Graph.prototype.dijsktraInitialisation = function(vertexSource, distances, paths){
  //Initialisation
  for(var i = 0; i < this.vertices.length; i++){
    distances[i] = 9999; //Similaire à l'infini pour notre cas
    paths[i] = [];
  }
  distances[vertexSource] = 0;
  paths[vertexSource].push(vertexSource);
};

Graph.prototype.dijsktraFindMin = function(sommets, distances){
  "use strict";
  var mini = 9999; //L'infini
  var sommet = -1;

  for (let item of sommets){
    if (distances[item] < mini){
      mini = distances[item];
      sommet = item;
    }
  }

  console.log("sommet trouvé : " + sommet);
  return sommet;
};

Graph.prototype.dijsktraUpdateDistances = function(s1, s2, distances, paths){
  console.log("distance s1 : " + distances[s1]);
  console.log("distance s2 : " + distances[s2]);
  console.log("weight du chemin : " + this.edgesWeight[s1][s2]);
  if (distances[s2] > distances[s1] + this.edgesWeight[s1][s2]){
    distances[s2] = distances[s1] + this.edgesWeight[s1][s2];
    paths[s2] = paths[s1].slice();
    paths[s2].push(s2);
    console.log("Le distance de " + s2 + " devient de " + distances[s2]);
  }
};

Graph.prototype.dijsktraMain = function(vertexSource, vertexDestination){
  console.log("On va chercher le chemin de " + vertexSource + " à " + vertexDestination);
  //console.log(this.verticesNames[vertexSource]);

  var result = {
    optimal_path: [],
    distance: 0
  };


  var sommets = new Set(this.vertices);
  var paths = [];
  var distances = [];
  this.dijsktraInitialisation(vertexSource, distances, paths);

  while (sommets.size > 0){
    s1 = this.dijsktraFindMin(sommets, distances);
    sommets.delete(s1);

    console.log("Ses voisins sont : ");
    for(var i = 0; i < this.edges[s1].length; i++){
      console.log(this.edges[s1][i]);
      this.dijsktraUpdateDistances(s1, this.edges[s1][i], distances, paths);
    }
  }

  result.optimal_path = paths[vertexDestination];
  result.distance = distances[vertexDestination];

  return result;
};

Graph.prototype.getNames2 = function(result){
  var names = [];

  for (var i = 0; i < result.length; i++){
    names.push(this.verticesNames[result[i]]);
  }

  return names;
};
