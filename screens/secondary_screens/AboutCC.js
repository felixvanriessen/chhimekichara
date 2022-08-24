import React from 'react'
import { SafeAreaView, StyleSheet, Text, View, Linking, ScrollView } from "react-native";

const AboutCC  = () => {
    
    return (
        <SafeAreaView style={styles.container}>
        <ScrollView>
            <View style={styles.section}>
                <Text style={styles.title}>Chhimeki Chara</Text>
                <Text style={styles.text}>The Chhimeki Chara app and the Neighbourhood Bird Count are an initiative by Bird Conservation Nepal (BCN, birdlifenepal.org) and FriendsofBird to popularise bird watching and bird conservation among the general public. The app is developed to help people identify the most common birds around the home and help people count birds during the semi-annual Neighbourhood Bird Count.
                Feedback about the app is welcome at {"\n"} <Text style={styles.textLink} onPress={()=>{
                   Linking.openURL('mailto:bcnbirdcounts@gmail.com')
                }}>bcnbirdcounts@gmail.com</Text> and <Text style={styles.textLink} onPress={()=>{
                    Linking.openURL('mailto:chhimekichara2022@gmail.com')
                 }}>chhimekichara2022@gmail.com</Text> for feedback about the campaign.
                </Text>
                <Text style={styles.text}>For bird count results and bird conservation information, visit
                <Text style={styles.textLink} onPress={()=>{
                   Linking.openURL('https://www.birdlifenepal.org/')
                }}> www.birdlifenepal.org.</Text><Text> </Text>
                For apps with more capacity and information, please use Merlin for bird identification and eBird for bird counting and information sharing.</Text>
                <Text style={styles.text}>
                    The Chhimeki Chara campaign are made possible by Zeiss, BCN and private sponsors.
                </Text>
            </View>
        </ScrollView>
        </SafeAreaView>
    )
}

export default AboutCC;

const styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        flex:1
    },
    section:{
        display:'flex',
        alignItems:'center',
        paddingHorizontal:5
    },
    title:{
        fontSize:24,
        color:'#8ea604',
        textAlign:'center'
    },
    text:{
        fontSize:18,
        color:'black',
        textAlign:'center',
        marginTop:20
    },
    textLink:{
        fontSize:18,
        color:'blue',
    }
})