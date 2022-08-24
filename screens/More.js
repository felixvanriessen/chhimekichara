import React, {useState, useEffect} from "react";
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, Platform, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/core'
import { useIsFocused } from '@react-navigation/native'
import { getUniqueId } from 'react-native-device-info'


import firestore from '@react-native-firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Button from "./components/Button";


const More = () => {
    const navigation = useNavigation()

    const [storedMsgs, setStoredMsgs] = useState(false)
    const [unreadMsgs, setUnreadMsgs] = useState(0)
    const [readMsgs, setReadMsgs] = useState([])
    const [messagesUpdated, setMessagesUpdated] = useState(false)

    const isFocused = useIsFocused()

    useEffect(()=>{
        checkMessages()
    }, [isFocused])

    async function checkMessages(){
        checkMsgStorage().then(async res => {
            let newMsgs = await getMessages()
            return {
                stored:res, new:newMsgs
            }
        }).then(async res => {
            //save new messages
            //count & update unread
            let newMessages = res.new
            let storedMessages = res.stored
            setReadMsgs(storedMessages.read)
            if (newMessages.length > 0) {
                let unreadCount = 0
                //count new unread msgs
                newMessages.forEach(el => {
                    if (storedMessages.read.indexOf(el.msgID) == -1) unreadCount++
                })
                setUnreadMsgs(unreadCount)
                //save new messages
                storedMessages.messages = newMessages
                let obj = JSON.stringify(storedMessages)
                await saveNewMsgs(obj)
                setStoredMsgs(newMessages)
            }
        }).then(()=>{
            setMessagesUpdated(true)
        })
    }

    async function checkMsgStorage(){
        let msgs = await AsyncStorage.getItem('@messages')
        let msgObj = {messages:[], read:[]}
        if (msgs == null) {
            msgObj = await createMsgStorage()
        } else {
            msgObj = JSON.parse(msgs)
        }
        if (msgObj.read == undefined) msgObj.read = []
        return msgObj
    }

    async function createMsgStorage(){
        let obj = JSON.stringify({messages:[], read:[]})
        await AsyncStorage.setItem('@messages', obj)
        return {messages:[], read:[]}
    }

    async function getMessages(){
        let msgs = await firestore().collection('announcements').get().then(query=>{
            let fetchedMsgs = []
            query.forEach(el => {
                fetchedMsgs.push({
                    msgID:el.id,
                    data:el.data()
                })
            })
            return fetchedMsgs
        }, ()=>{
            return []
        })
        msgs = msgs.filter(el => {
            if (el.data.target == undefined || el.data.target == 'all') return true
            else {
                let id = getUniqueId()
                if (id == el.data.target) return true
                else return false
            }
        })
        return msgs
    }

    async function saveNewMsgs(messages) {
        await AsyncStorage.setItem('@messages', messages)
    }



    return (
        <SafeAreaView style={styles.container}>
            {
                messagesUpdated ? 
                <View>
                <Button 
                text='Announcements'
                big={true}
                action={()=>{
                    navigation.navigate('Announcements', {stored:storedMsgs, read:readMsgs})
                }}
                />
                {
                    unreadMsgs > 0 &&
                    <Text style={{textAlign:'center', color:'black', fontSize:16}}>({unreadMsgs} unread announcements)</Text>
                }
                </View>
                :
                <Button 
                text='Loading...'
                big={true}
                disabled={true}
                />
            }
            <Button 
                text='See All Birds'
                big={true}
                action={()=>navigation.navigate('Seeallbirds')}
            />

            <Button 
                text='How to use this app'
                big={true}
                action={()=>navigation.navigate('Howtouse')}
            />
            <Button 
                text='Extra Website Links'
                big={true}
                action={()=>navigation.navigate('Websitelinks')}
            />
            <Button 
                text='About Chhimeki Chara'
                big={true}
                action={()=>navigation.navigate('AboutCC')}
            />
            
            <Button 
                text='Credits'
                big={true}
                action={()=>navigation.navigate('Credits')}
            />
        </SafeAreaView>
    )
}

export default More;

const styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        flex:1,
        display:'flex',
        justifyContent:'space-evenly',
        alignItems:'center',
    },

})