import * as React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { Card } from 'react-native-paper';

import {WORDS} from './WordsArray';
import Keyboard from './components/Keyboard';
import Box from './components/Box';


Array.prototype.getRandomElement = function() {
  let index = Math.floor(Math.random() * this.length);
  return this[index]; 
} 


Array.prototype.getRandomElementWithCondition = function(condition) {
  let qualifiedElements = this.filter(w => condition(w));
  
  if(qualifiedElements.length){
    return qualifiedElements.getRandomElement(); 
  }
}


var refHolder;
var registerLetters;


var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var words = [];
var definitions = [];

  
function getRandomWordWithCondition(condition){
  let selectedWords = WORDS.filter(w => condition(w));
  
  if(selectedWords.length){
    return selectedWords.getRandomElement().split(""); 
  }
}  


function resetting(changeDirection, boxSelection, keySelection){
  changeDirection(true);
  boxSelection([0, 5]);
  keySelection("");

  for(var k in refHolder){
    refHolder[k]?.setState({style: "letter"});
    refHolder[k]?.setState({letter: ""});
    refHolder[k]?.setState({correctLetterFound: false});
  } 
}


function renderBoard(changeDirection, boxSelection, keySelection, reset=false){
  if(reset){
    resetting(changeDirection, boxSelection, keySelection);
  } else if(registerLetters){
    return;
  }

  words = []; 
  registerLetters = {}; 
  refHolder = {};
  definitions = [];

  const VERTICAL_WORD = WORDS.getRandomElementWithCondition(w => w.length >= 8).split("");

  for(let i = 0; i < VERTICAL_WORD.length; ++i){
    registerLetters[""+i+"5"] = VERTICAL_WORD[i]; 
 
    if(i % 2 == 0){
      let word = WORDS.getRandomElementWithCondition(w => w.length <= 6 && w.indexOf(VERTICAL_WORD[i]) != -1).split("");

      if(word){
        words.push(word);
        let columnStart = 5 - word.indexOf(VERTICAL_WORD[i]);

        for(let j = 0; j < word.length; ++j){
          registerLetters[i + "" + columnStart++] = word[j];
        }
      }
    }
  }

  var board = [];   

  for(let r = 0; r < 15; ++r){
    let row = [];
     
    for(let c = 0; c < 11; ++c){
      if(registerLetters[r + "" + c]){
        row.push(<Box ref={box => refHolder[r + "" + c] = box}
                      styles={styles.box} 
                      selection={boxSelection}
                      highlightSelection={highlightSelection}
                      removeSelection={removeSelection}
                      r={r} c={c}/>);
      } else {
        row.push(<Card style={styles.noLetter}></Card>);
      }
    }

    board.push(<View style={styles.row}>{row}</View>);
  }

  console.log(registerLetters);
  
  return board;
}


function getWordDefinition(changeHintButtonVisibility, changeDefs, index = 0){ 
  if(index < words.length){
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + words[index].join("").toLowerCase()) 
        .then(response => response.json()) 
        .then(data => {
          if(data instanceof Array){
            data = data[0];
            const meanings = data.meanings[0];
            const definition = meanings.definitions.getRandomElement().definition;
            console.log("definition: ", definition);
            definitions.push(definition);
          }
      
          getWordDefinition(changeHintButtonVisibility, changeDefs, ++index)
        });
  } else {
    changeHintButtonVisibility(true);
    defsView = definitions.map(def => <li>{def}</li>)
    changeDefs([...defsView])
  }
} 


function returnNewBoard(board, r, c){  
  let newBoard = [...board];

  newBoard[r].props = {...newBoard[r].props};
  newBoard[r].props.children = [...newBoard[r].props.children];

  return newBoard;
}


function highlightSelection(box){
  const [r, c] = box;
  
  refHolder[r+""+c]?.setState({style: "selected"});
} 


function removeSelection(box){
  const [r, c] = box;

  if(refHolder[r+""+c]?.state.letter == ""){
    refHolder[r+""+c]?.setState({style: "letter"});
  }
}


function selectNextBox(board, r, c, direction, changeDirection, boxSelection){
  if(direction && !registerLetters[(r+1)+""+c]){
    direction = false;
    changeDirection(false);
  } else if(!direction && !registerLetters[r+""+(c+1)]) {
    direction = true;
    changeDirection(true);
  }
  
  let newBox = direction ? [r + 1, c] : [r, c + 1];

  if(registerLetters[newBox[0]+""+newBox[1]]){
    if(!refHolder[newBox[0]+""+newBox[1]].state.correctLetterFound){
      boxSelection(newBox);  
 
      highlightSelection(newBox);
    }
    else {
      selectNextBox(board, newBox[0], newBox[1], direction, changeDirection, boxSelection);
    }
  }
}


function placeLetter(board, changeBoard, key, 
                     keySelection, box, boxSelection, direction, changeDirection){
  const [r, c] = box;

  let ref = refHolder[r+""+c];

  if(ref.state.correctLetterFound){
    keySelection("");
    return; 
  }

  ref.setState({letter: key})
  
  let style;
  let flag = false;

  if(registerLetters[r+""+c] == key){
    ref.setState({correctLetterFound: true});
    ref.setState({style: "trueLetter"});

    selectNextBox(board, r, c, direction, changeDirection, boxSelection)
  } else {
    ref.setState({style: "wrongLetter"});
  }
  
  keySelection("");         
}

  

export default function App() {
  const [key, keySelection] = React.useState("");
  const [box, boxSelection] = React.useState([0,5]);
  const [board, changeBoard] = React.useState(renderBoard(changeDirection, boxSelection, keySelection));
  const [defs, changeDefs] = React.useState([]);
  const [direction, changeDirection] = React.useState(true); // true -> vertical, false -> horizontal.
  const [viewMode, changeViewMode] = React.useState(0);
  const [showHintsButton, changeHintButtonVisibility] = React.useState(false);
  
  React.useEffect(() => { 
                          changeHintButtonVisibility(false);
                          getWordDefinition(changeHintButtonVisibility, changeDefs);
                        }, 
                        [board]);  
 
  
  if(key != ""){
    placeLetter(board, changeBoard, key, keySelection, 
                box, boxSelection, direction, changeDirection); 
  } 
  
  return (
            <View style={styles.container}>
              {showHintsButton ? <TouchableOpacity style={{position:"absolute", top:"0px", left:"0px"}}><Text style={{fontSize:12}} onPress={() => {viewMode == 0 ? changeViewMode(1) : changeViewMode(0)}}>{viewMode == 0 ? "Show Hints" : "Return"}</Text></TouchableOpacity> : ""}
              {viewMode == 0 ? <View style={styles.newBoardButton}><TouchableOpacity onPress={() => { changeBoard(renderBoard(changeDirection, boxSelection, keySelection, true)) }}><Text style={styles.newBoardButtonText}>New Puzzle</Text></TouchableOpacity></View> : ""}
              <View style={{position:"relative", top:-500*viewMode}}>{board}</View>
              {viewMode == 0 ? <View style={styles.keyboard}><Keyboard selection={keySelection}/></View> : ""}
              {viewMode == 1 ? (<ol style={{position:"absolute", top:"0px"}}>{defs}</ol>) : ""}
            </View>
          );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    height: screenHeight
  },
  newBoardButton: {
    alignSelf: "flex-start",
    height: 25,
    width: 100,
    margin: "auto"
  },
  newBoardButtonText:{
    fontWeight: "bold",
    fontSize: 15,
    color: "grey",
    textAlign: "center"
  },
  noLetter: {
    width: 30,
    height: 30,
    textAlign: "center",
    fontSize: 36,
    fontWeight: 'bold',
    border: "1px solid black",
    opacity: 0
  },
  row: {
    flexDirection: "row"
  },
  keyboard: {
    width: 333,
    height: 96,
    margin: "auto"
  },
  box: {
    width: 30,
    height: 30,
    border: "1px solid black",
  }
});
