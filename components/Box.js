import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';


export default class Box extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      style: "letter",
      letter: "",
      correctLetterFound: false
    };
  }

  render () {         
    return (<TouchableOpacity onPress={() => { if(this.state.correctLetterFound) { return; }
                                               this.props.selection((prevBox)=>{this.props.removeSelection(prevBox);return [this.props.r, this.props.c]});
                                               this.props.highlightSelection([this.props.r, this.props.c])
                                                }}>
              <Card style={this.props.styles}>
                <Text style={styles[this.state.style]}>{this.state.letter}</Text>
              </Card>
            </TouchableOpacity>);
  }
}


const base = { height: 30,
               fontSize: 20,
               fontWeight: 'bold',
               textAlign: "center" };


const styles = StyleSheet.create({
  letter: {
    ...base
  },
  trueLetter: {
    ...base,
    backgroundColor: "lightgreen"
  },
  wrongLetter: {
    ...base,
    backgroundColor: "pink"
  }, 
  selected: { 
    ...base,
    backgroundColor: "cyan"
  }
});