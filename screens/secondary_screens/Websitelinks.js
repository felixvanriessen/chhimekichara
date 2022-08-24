import React from 'react'
import { SafeAreaView, StyleSheet, Text, View, Linking, ScrollView } from "react-native";
import Button from '../components/Button';


const Websitelinks  = () => {
    
    return (
        <SafeAreaView style={styles.container}>
        <ScrollView>
            <View style={styles.section}>
                <Text style={styles.title}>Bird Conservation Nepal</Text>
                <Button 
                    text='go to website'
                    big={true}
                    action={()=>{
                        Linking.openURL('https://www.birdlifenepal.org/')
                    }}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>eBird</Text>
                <Button 
                    text='go to website'
                    big={true}
                    action={()=>{
                        Linking.openURL('https://ebird.org/')
                    }}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Merlin Bird Identification</Text>
                <Button 
                    text='go to website'
                    big={true}
                    action={()=>{
                        Linking.openURL('https://merlin.allaboutbirds.org/')
                    }}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Zeiss Nature Observation</Text>
                <Button 
                    text='go to website'
                    big={true}
                    action={()=>{
                        Linking.openURL('https://www.zeiss.com/consumer-products/int/nature-observation.html')
                    }}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>FriendsOfBird Facebook page</Text>
                <Button 
                    text='go to website'
                    big={true}
                    action={()=>{
                        Linking.openURL('https://www.facebook.com/FoB2007')
                    }}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Chhimeki Chara Facebook page</Text>
                <Button 
                    text='go to website'
                    big={true}
                    action={()=>{
                        Linking.openURL('https://www.facebook.com/chhimekichara')
                    }}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Chhimeki Chara Facebook group</Text>
                <Button 
                    text='go to website'
                    big={true}
                    action={()=>{
                        Linking.openURL('https://www.facebook.com/groups/673155714049751')
                    }}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Bird ID Nepal</Text>
                <Button 
                    text='go to website'
                    big={true}
                    action={()=>{
                        Linking.openURL('https://www.facebook.com/groups/511007206097826')
                    }}
                />
            </View>
        </ScrollView>
        </SafeAreaView>
    )
}

export default Websitelinks;

const styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        flex:1
    },
    section:{
        display:'flex',
        alignItems:'flex-end',
        marginHorizontal:10,
        marginBottom:20,
        borderTopColor:'#8ea604',
        borderTopWidth:1,
        borderRightColor:'#8ea604',
        borderRightWidth:1,
        borderTopRightRadius:16,
        paddingTop:4
    },
    title:{
        color:'black',
        fontSize:18,
        textAlign:'center',
        alignSelf:'flex-start'
    }
})