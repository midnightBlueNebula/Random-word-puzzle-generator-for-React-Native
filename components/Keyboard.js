import * as React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';


const KEY_ROW_1 = "qwertyuıop";
const KEY_ROW_2 = "asdfghjkl";
const KEY_ROW_3 = "zxcvbnm";

function renderKeyRow(parent, row){
  return row.toUpperCase()
            .split("")
            .map(r => (<TouchableOpacity onPress={() => parent.props.selection(r)}>
                         <Text style={styles.key}>{r}</Text>
                       </TouchableOpacity>));
}

export default class Keyboard extends React.Component {
  constructor(props){
    super(props);
  }

  render () {         
    return (<View>
              <View style={styles.keyRow}>
                {renderKeyRow(this, KEY_ROW_1)}
              </View>
              <View style={styles.keyRow}>
                {renderKeyRow(this, KEY_ROW_2)}
              </View>
              <View style={styles.keyRow}>
                {renderKeyRow(this, KEY_ROW_3)}
              </View>
            </View>);
  }
}



const styles = StyleSheet.create({
  keyRow: {
    flexDirection: "row",
    alignSelf: "center"
  },
  key: {
    height: 30,
    width: 30,
    color: "white",
    backgroundColor: "black",
    textAlign: "center",
    border: "1px solid grey",
    fontWeight: 'bold',
    fontSize: 20,
    margin: 1
  }
});