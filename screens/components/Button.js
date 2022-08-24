import React from 'react'
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native'

const Button = (props) => {
    //disabled = bool
    //text = string
    //color = string

    let color = {backgroundColor:'#8ea604'}
    if (props.color == 'red') {
        color = {backgroundColor:'#DB5461'}
    }
    if (props.color == 'neutral') {
        color = {backgroundColor:'#00A5CF'}
        // color = {backgroundColor:'#DD7230'}
    }

    let marginV = {}
    if (props.marginV != undefined) {
        marginV = {marginVertical:props.marginV}
    }

    let grow = {}
    if (props.grow == true) {
        grow = {flex:1}
    }

    let fontSize = 14
    if (props.big == true) {
        fontSize = 20
    }

    if (props.disabled == true) {
        return (
            <View style={[styles.btn, {backgroundColor:'#8AA29E'}, marginV, grow]}>
                <Text style={[styles.btnText, {fontSize:fontSize}]}>{props.text}</Text>
            </View>
        )
    }


    return (
        <TouchableOpacity style={[styles.btn, color, marginV, grow]} onPress={props.action}>
            <Text style={[styles.btnText, {fontSize:fontSize}]}>{props.text}</Text>
        </TouchableOpacity>
    )
}

export default Button;

const styles = StyleSheet.create({
    btn:{
        paddingVertical:5,
        paddingHorizontal:20,
        borderRadius:4,
        margin:10
    },
    btnText:{
        color:'white',
        textAlign:'center'
    }
})