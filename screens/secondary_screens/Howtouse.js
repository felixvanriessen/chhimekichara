import React from 'react'
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, Platform, ScrollView, Linking } from "react-native";
import Button from '../components/Button';


const Howtouse  = () => {
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.title}>Neighbourhood Bird Count Events</Text>
                    <Text style={styles.text}>Go to 'Start Counting'</Text>
                    <Text style={styles.text}>Stay in your neighbourhood/home and count all the birds you see for at least 15 minutes.</Text>
                    <Text style={styles.text}>Submit 1 list per counting session.</Text>

                    <Text style={styles.text}>When you are finished, press "Save and Review" {">"} "Confirm" {">"} "Save and Submit".</Text>
                    <Text style={styles.text}>You can find the national results on birdlifenepal.org.</Text>
                    <Button 
                        text='See Results'
                        action={()=>{
                            Linking.openURL('https://www.birdconservationnepal.org/chhimekichara')
                        }}
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.title}>Personal use</Text>
                    <Text style={styles.text}>
                        You can use this app for keeping personal records of birds you have seen. You are not required to submit your records, but we appreciate any extra data you send us.
                    </Text>
                    <Text style={styles.text}>
                        Go to "My Counting Lists" to see all the counts you have made.
                    </Text>
                    <Text style={styles.text}>
                        Inside the "Start Counting" section, you will see the "Help Identify" button. You can use this feature when you are not sure which bird you have seen, it will narrow down the list of birds shown to match the description you give.
                    </Text>
                    <Text style={styles.text}>
                        Press the image of any bird in a list to get more information on it.
                    </Text>
                </View>
                <View>
                    <Text style={styles.title}>Youtube Demonstrations</Text>
                    <Button 
                        text='English'
                        action={()=>{
                            Linking.openURL('https://www.youtube.com/watch?v=8OiVTlAz6pQ&t=2s')
                        }}
                    />
                    <Button 
                        text='Nepali'
                        action={()=>{
                            Linking.openURL('https://www.youtube.com/watch?v=QWt8qlDA-_g')
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Howtouse;

const styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        flex:1
    },
    section:{
        display:'flex',
        // alignItems:'center',
        marginHorizontal:10,
        // borderWidth:1,
        marginBottom:20
    },
    title:{
        fontSize:20,
        color:'#8ea604',
        textAlign:'center',
        marginBottom:8
    },
    text:{
        fontSize:16,
        color:'black',
        // textAlign:'center',
        marginTop:4
    }
})