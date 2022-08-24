import React from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from "react-native";


const Credits = () => {

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView >
            <View style={styles.section}>
                <Text style={styles.title}>Illustrations</Text>
                <Text style={styles.text}>Richard Allen, Adam Bowley, Clive Byers, Dan Cole, John Cox, Gerald Driessens, Carl d'Silva, Kim Franklin, John Gale, Alan Harris, Peter Hayman, Craig Robson, Christopher Schmidt, Brian Small, Jan Wilczur, Tim Worfolk and Martin Woodcock.</Text>
                <Text style={styles.text}>All illustrations are taken (with permission) from Birds of Nepal Revised edition (2016) by Richard Grimmett, Carol Inskipp, Tim Inskipp and Hem Sagar Baral. Helm Field Guide, Christopher Helm, London, UK.</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Photos</Text>
                <Text style={styles.text}>All photos are taken in Nepal, and nearly all by Nepal residents. The photographer’s name is shown below each photo, except for photos taken by the app makers themselves. </Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Sounds</Text>
                <Text style={styles.text}>Orin Pearson (15), Marc Anderson(12), Peter Boesman(4), Mike Dooher (3), Benj Smelt (2),  Ian Hearn(1), Stuart Fisher(1), Natalie Raeber(1), Mohan Bikram Shrestha (1) and Arend van Riessen (50).</Text>
                <Text style={styles.text}>All sounds except one (India) are recorded in Nepal. Due to overall app size limitations, some sound clips combine calls and song and have been shortened.</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>App Development</Text>
                <Text style={styles.text}>Felix van Riessen and FriendsofBird</Text>
            </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Credits;

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white'
    },
    section:{
        display:'flex',
        alignItems:'center',
        paddingHorizontal:10,
        marginBottom:20,
    },
    title:{
        fontSize:20,
        color:'#8ea604',
        textAlign:'center'
    },
    text:{
        fontSize:16,
        color:'black',
        textAlign:'center'
    }
})