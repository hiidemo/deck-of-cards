// run a single card game
function runSimulation(level) {

    if(level > 6) {
        // not enough cards in a deck to do level 7 here
        return 0;
    }

    var deck = Deck();
    deck.shuffle();

    // there are 7 "rounds" for a level
    // level 1 = 1,1,2,2,3,3,boss
    // level 2 = 2,2,3,3,4,4,boss
    // level 3 = 3,3,4,4,5,5,boss
    // level 4 = 4,4,5,5,6,6,boss 
    // etc

    // you initially draw level+1 cards
    // the last card is the 'suit' card, and sets the 'suit' for the level
    // therefore, we can statically pull # of cards based on input level
    // level+1 cards for your team
    // 1 card for boss
    // 12 cards level 1, 18 cards level 2, 24 cards level 3, 30 cards level 4
    // generalize as 6 *+(6*level) 
    // so we have 6 + (6*level) + 1 + level + 1
    // which reduces to 8 + (7*level)
    // meaning our maximum level = (52-8)/7 = 44/7 = level 6! 
    // higher levels appear to have equal or higher levels of win %.. interesting!!  


    // draw our 8+(7*level) cards   
    var playCards = deck.cards.splice(0, (8+(7*level)) );

    // set our commander
    var commander = playCards.shift();

    // get all of our team cards
    var teamCards = playCards.splice(0,level);

    // our suit card sets the level suit, which doubles the values of all cards of that suite this level
    var suitCard = teamCards[teamCards.length-1];
    var suit = suitCard.suit;

    //console.log("suit is " + suit);

    // 7 rounds 
    for(var round = 0;round<7;round++) {
        var roundEnemies;

        if(round == 6) {
            roundEnemies = playCards.splice(0,1);
        }else if(round == 0 || round == 1){
            roundEnemies = playCards.splice(0,level);
        }else if(round == 2 || round == 3){
            roundEnemies = playCards.splice(0,level+1);
        }else if(round == 4 || round == 5){
            roundEnemies = playCards.splice(0,level+2);
        }

        // calculate rank of enemy cards
        // store the highest card in case we want to swap it later, except for the boss
        var enemyRank = 0;
        var highestEnemyRank = 0;
        var enemyRankIndex = 0;

        // boss round, boss cards are worth +1 and then triple times level !! 
        if(round == 6) {
            enemyRank = (roundEnemies[0].rank + 1) * (level*3);
            //console.log("Round " + round + " and boss card rank " + enemyRank);
                
        }else {
            for (const [i,card] of roundEnemies.entries()) {
                var cardRank;

                //console.log("Round " + round + " and enemy card rank " + card.rank + "and card suit" + card.suit);
                

                if(card.suit == suit) {
                    cardRank = (card.rank * 2);
                }else {
                    cardRank = card.rank;
                }

                enemyRank += cardRank;
                if(cardRank > highestEnemyRank) {
                    enemyRankIndex = i;
                    highestEnemyRank = cardRank;
                }
            }
        }

        // calculate rank of hand cards
        // store the lowest card in case we want to swap it later
        var rank = commander.rank;
        var lowestHandRank = 26;
        var lowestRankIndex = 0;
        for (const [i,card] of teamCards.entries()) {
            var cardRank;

            if(card.suit == suit) {
                cardRank = (card.rank * 2);
            }else {
                cardRank = card.rank;
            }
            rank += cardRank;

            if(cardRank < lowestHandRank) {
                lowestHandRank = cardRank;
                lowestRankIndex = i;
            }
            //console.log("Round " + round + " and player card rank " + card.rank + "and card suit" + card.suit);
            
        }


        // check if we lost the game!! 
        if(enemyRank > rank) {
            return 0;
        }

        // check for a swip-swap    
        if(round != 6) {
            if(lowestHandRank < highestEnemyRank) {
                teamCards[lowestRankIndex] = roundEnemies[enemyRankIndex];
            }
        }else {
            //console.log("Round " + round + " and hero card rank " + rank);
        }

    }


    // we made it through all rounds!  Return 1 or 'win';
    return 1;

}


window.onload = function() {    

    var simDiv = document.getElementById("simulator");

    // programmatically create our input elements for the simulator
    var levelElement = document.createElement('input')
    levelElement.id = "level";
    levelElement.type = "number";
    levelElement.max = 6;
    levelElement.min = 1;
    levelElement.value = 1;
    levelElement.title = "Level";
  
    simDiv.appendChild(levelElement);

    var levelLabel = document.createElement("Label");
    levelLabel.setAttribute("for","level");
    levelLabel.innerHTML = "Level";
    simDiv.appendChild(levelLabel);

    simDiv.appendChild(document.createElement('br'));

    var iterationsElement = document.createElement('input')
    iterationsElement.id = "iterations";
    iterationsElement.type = "number";
    iterationsElement.min = 1;
    iterationsElement.value = 100;
    iterationsElement.title = "Number of Simulations to Run";
    simDiv.appendChild(iterationsElement);

    var iterLabel = document.createElement("Label");
    iterLabel.setAttribute("for","iterations");
    iterLabel.innerHTML = "Number of Simulations to Run";
    simDiv.appendChild(iterLabel);
       

    simDiv.appendChild(document.createElement('br'));

    var runElement = document.createElement('input')
    runElement.id = "runsim";
    runElement.type = "button";
    runElement.value = "Run Simulation(s)";
    simDiv.appendChild(runElement);
    
    var outputElement = document.createElement('p');
    outputElement.id = "output";
    simDiv.appendChild(outputElement);


    simDiv.appendChild(document.createElement('br'));
    
    document.getElementById("runsim").onclick = function fun() {
        var level = 1*document.getElementById("level").value;
        var numSims = 1*document.getElementById("iterations").value;
        var totalWins = 0;
        console.time("runsim");
        for(var i = 0;i<numSims;i++) {
            totalWins += runSimulation(level);
        }
        
        console.timeLog("runsim");
        document.getElementById("output").textContent =  "Total level " + level + " Wins out of " + numSims + " are " + totalWins;

    }
}