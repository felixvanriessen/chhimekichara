import React, { useState, useEffect } from 'react'
import { StyleSheet, SafeAreaView, TouchableOpacity, View, Text, FlatList, Modal } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'

import Button from './components/Button'

const Announcements = ({route}) => {

    const [stored, setStored] = useState(route.params.stored)
    const [read, setRead] = useState(route.params.read)

    useEffect(()=>{

    }, [])

    function sortMessages(msgs){
        let sortedList = msgs
        sortedList = sortedList.sort((a, b) => {
            return Number(a.data.time.split(':')[1]) - Number(b.data.time.split(':')[1])
        })
        //sort by hr
        sortedList = sortedList.sort((a, b) => {
            return Number(a.data.time.split(':')[0]) - Number(b.data.time.split(':')[0])
        })
        //sort by day
        sortedList = sortedList.sort((a, b) => {
            return Number(a.data.date.split('-')[0]) - Number(b.data.date.split('-')[0])
        })
        //sort by month
        sortedList = sortedList.sort((a, b) => {
            return Number(a.data.date.split('-')[1]) - Number(b.data.date.split('-')[1])
        })
        //sort by year
        sortedList = sortedList.sort((a, b) => {
            return Number(a.data.date.split('-')[2]) - Number(b.data.date.split('-')[2])
        })
        return sortedList.reverse()
    }

    const renderList = () => {
        let data = sortMessages(stored)
        return (
            <FlatList 
                style={styles.flatList}
                data={data}
                keyExtractor={item => item.msgID}
                renderItem={renderItem}
            />
        )
    }

    const renderItem = ({item}) => {
        let isRead = true
        if (read.indexOf(item.msgID) == -1) {
            isRead = false
        }
        return (
            <MessageCard data={item.data} id={item.msgID} addToRead={addToRead} isRead={isRead}/>
        )
    }

    const addToRead = async (id) => {
        let readMsgs = [...read, id]
        setRead(readMsgs)
        let saveObj = {
            messages:stored, read:readMsgs
        }
        saveObj = JSON.stringify(saveObj)
        await AsyncStorage.setItem('@messages', saveObj)
        setRead(readMsgs)
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderList()}
        </SafeAreaView>
    )
}

export default Announcements;

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'rgb(240,240,240)'
    },
    flatList:{
        paddingVertical:8
    },
    card:{
        borderWidth:1, borderColor:'#8ea604',
        marginBottom:8,
        marginHorizontal:8,
        paddingHorizontal:8,
        paddingVertical:4,
        borderRadius:8,
        backgroundColor:'white'
    },
    cardInfo:{
        textAlign:'left',
        fontSize:14,
        color:'rgb(100,100,100)'
    },
    cardHeader:{
        display:'flex',
        justifyContent:'space-between',
        flexDirection:'row',
        alignItems:'center'
    }, 
    cardTitle:{
        fontSize:18,
        color:'black',
        textAlign:'center'
    },
    cardMain:{

    },
    cardMessage:{
        textAlign:'left',
        fontSize:16,
        color:'black'
    }

})

const MessageCard = (props) => {

    const [show, setShow] = useState(false)
    const [isRead, setIsRead] = useState(props.isRead)

    let bgColor = 'white'
    if (!isRead) {
        bgColor = '#ffee32'
    }

    return (
        <View style={[styles.card, {backgroundColor:bgColor}]}>
            <Text style={styles.cardInfo}>{props.data.time} on {props.data.date}</Text>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{props.data.title}</Text>
                {
                    show ? 
                    <Button 
                        text='Close'
                        color='red'
                        action={()=>{
                            setShow(false)
                        }}
                    />
                    :
                    <Button 
                        text='Open'
                        action={()=>{
                            setShow(true)
                            props.addToRead(props.id)
                            setIsRead(true)
                        }}
                    />
                }
                
            </View>
            {
                show &&
                <View style={styles.cardMain}>
                    <Text style={styles.cardMessage}>{props.data.message}</Text>
                </View>
            }
        </View>
    )
}