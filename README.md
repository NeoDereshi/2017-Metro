# 2017-Metro

## Utilisation

1. Placez-vous à la racine
2. Dans un terminal, lancez la commande : node serveur.js
3. Dans votre navigateur, aller à la page : localhost:8080
4. Enjoy !

## Modules installés

- fs
- express
- body-parser
- ejs
- bootstrap

## Fonctionnalités minimales attendues par le sujet

Tout est implémenté :
* Saisie d'une station de départ et d'une station d'arrivée
* Calcul d'un parcours avec l'algorithme de Dijsktra
* Affichage du parcours :
    * Il me paraît assez intuitif pour comprendre les lignes concernées ainsi que les changements à faire

    * L'affichage est segment par segment :
        * D'abord synthétique, ligne de métro par ligne de métro avec la station de départ et la station d'arrivée sur cette ligne-ci
        
        * On peut alors cliquer pour afficher le détail des stations parcourues (toujours par ligne de métro)

    * Gérer les erreurs : Reste fonctionnel, si le nom d'une station est fausse, affiche un message d'erreur

## Fonctionnalités optionnelles implémentées :

* Proposer une estimation du temps de parcours
    * Proposition d'une heure de départ dans le formulaire

    * Affichage de l'heure de départ, de l'heure d'arrivée ainsi que du temps de parcours dans la page de résultat

    * Calculé avec les temps donnés dans le sujet


* Suggestion des noms de stations
    * A l'aide de tous les outils vus en cours (JS, jQuery, node.js, AJAX, Bootstrap)

    * Affiche 5 noms maximum en dessous de l'input dans lequel on écrit, en commençant par les noms de stations commençant par ce que l'utilisateur a écrit

    * Ensuite, s'il y a moins de 5 résultats, la liste est complétée par les noms de stations contenant ce que l'utilisateur a écrit : cela facilite la recherche pour l'utilisateur (notamment avec les noms de stations comprenant plusieurs mots)

    * L'utilisateur peut rentrer le nom des stations en minuscules sans problème, mon seul regret étant de ne pas gérer lorsque les accents ne sont pas mis sur les lettres

## Commentaires

Pour la fonctionnalité optionnelle qui est de proposer des corrections de nom après soumission, je ne considère pas cela comme très important à faire grâce à l'auto-complétion que j'ai implémenté. Cependant, je reconnais que cela n'empêchera pas un utilisateur de pouvoir entrer un nom de station erroné
