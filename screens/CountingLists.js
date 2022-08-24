import React, {useState, useEffect} from 'react'
import {SafeAreaView, StyleSheet, View, Text, FlatList, TouchableOpacity, Modal, Alert, ScrollView} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
c
import { getUniqueId } from 'react-native-device-info'

import Button from './components/Button'

const CountingLists = () => {
    const [allCountData, setAllCountData] = useState([])
    const [allDataSize, setAllDataSize] = useState(0)

    const [alreadySubmittedIDs, setAlreadySubmittedIDs] = useState([])
    const [notSubmittedData, setNotSubmittedData] = useState([])

    const [groupingLimit, setGroupingLimit] = useState(10)
    const [grouping, setGrouping] = useState(false)

    const [dataWithoutSubmitProperty, setDataWithoutSubmitProperty] = useState(true)

    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [modalData, setModalData] = useState(undefined)
    const [modalNote, setModalNote] = useState(false)

    useEffect(()=>{
        checkFirestoreUser()
        initData()
    }, [grouping, dataWithoutSubmitProperty])


    async function checkFirestoreUser(){
        let id = getUniqueId()
        const user = await firestore().collection('users').doc(id).get();
        if (!user.exists) {
           firestore().collection('users').doc(id).set({deviceID:id})
        }
    }
    

    function sortList(arr){
        let tempArr = arr.sort((a, b) => {
            if (a.data.date.split('-')[2] == b.data.date.split('-')[2]) {
                if (a.data.date.split('-')[1] == b.data.date.split('-')[1]) {
                    if (a.data.date.split('-')[0] == b.data.date.split('-')[0]) {
                        if (a.data.time.split(':')[0] == b.data.time.split(':')[0]) {
                            if (a.data.time.split(':')[1] == b.data.time.split(':')[1]) {
                                return 0
                            } else return Number(b.data.time.split(':')[1]) - Number(a.data.time.split(':')[1])
                        } else return Number(b.data.time.split(':')[0]) - Number(a.data.time.split(':')[0])
                    } else return Number(b.data.date.split('-')[0]) - Number(a.data.date.split('-')[0])
                } else return Number(b.data.date.split('-')[1]) - Number(a.data.date.split('-')[1])
            } else return Number(b.data.date.split('-')[2]) - Number(a.data.date.split('-')[2])
        })
        return tempArr
    }

    function sortDays(arr){
        let sortedArr = [...arr]
        sortedArr = sortedArr.sort((a, b) => {
            if (a.split('-')[2] !== b.split('-')[2]) return Number(b.split('-')[2]) - Number(a.split('-')[2])
            if (a.split('-')[1] !== b.split('-')[1]) return Number(b.split('-')[1]) - Number(a.split('-')[1])
            if (a.split('-')[0] !== b.split('-')[0]) return Number(b.split('-')[0]) - Number(a.split('-')[0])
        })
        return sortedArr
    }

    function groupLists(data){
        if (data.length <= groupingLimit) return data
        setGrouping(true)
        let dataArray = []
        let days = []
        data.forEach(el=>{
           if (days.indexOf(el.data.date) == -1) days.push(el.data.date)
        })
        days = sortDays(days)
        dataArray = days.map(el=>{
           let arr = []
           data.forEach(el2=>{
              if (el2.data.date == el) arr.push(el2)
           })
           return {
              date:el,
              list:sortList(arr),
              size:arr.length
           }
        })
        return dataArray
    }

    async function getStoredCountData(){
        let allKeys = await AsyncStorage.getAllKeys()
        allKeys = allKeys.filter(el=>{
            if (el.split('_')[0] == '@countData') return true
        })
        let missingSubmitProp = false
        let data = await AsyncStorage.multiGet(allKeys)
        data = data.map(el => {
            if (JSON.parse(el[1]).submitted == undefined) missingSubmitProp = true
            return {
                key:el[0],
                data:JSON.parse(el[1])
            }
        })

        if (data.length > 0) {
            let sortedData = sortList(data)
            setAllDataSize(sortedData.length)
            return [sortedData, missingSubmitProp]
        } else return [[], false]
    }

    async function initData(){
        let storedData = await getStoredCountData()
        let submitPropsMissing = storedData[1]
        storedData = storedData[0]

        if (storedData.length == 0) return

        let submittedIDs = await getFirestoreCountDataIDList()
        let notSubmittedList = checkNotSubmittedData(submittedIDs, storedData)

        if (submitPropsMissing) {
            let isMissingSubmitProp = checkMissingSubmitProp(storedData)
            let missingSubPropTrue = []
            let missingSubPropFalse = []
            isMissingSubmitProp.forEach(el => {
                if (submittedIDs.indexOf(el.key) !== -1) missingSubPropTrue.push(el)
                else missingSubPropFalse.push(el)
            })
            if (missingSubPropTrue.length > 0) {
                addSubmitProperty(missingSubPropTrue, true)
            }
            if (missingSubPropFalse.length > 0) {
                addSubmitProperty(missingSubPropFalse, false)
            }
            setDataWithoutSubmitProperty(false)
        }

        storedData = groupLists(storedData)

        setAllCountData(storedData)
        setAlreadySubmittedIDs(submittedIDs)
        setNotSubmittedData(notSubmittedList)
    }

    async function initLite(skip = false){
        let storedData = await getStoredCountData()
        storedData = storedData[0]

        let notSubmittedList = checkNotSubmittedData(alreadySubmittedIDs, storedData)

        storedData = groupLists(storedData)

        setAllCountData(storedData)
        if (!skip){
            setNotSubmittedData(notSubmittedList)
        }
    }

    function removeFromNotSubmittedList(key) {
        let submittedIDs = [...alreadySubmittedIDs]
        submittedIDs.push(key)
        let notSubmitted = [...notSubmittedData]
        notSubmitted = notSubmitted.filter((el) => {
            if (el.key == key) return false
            return true
        })
        setAlreadySubmittedIDs(submittedIDs)
        setNotSubmittedData(notSubmitted)
    }

    async function getFirestoreCountDataIDList(){
        let id = getUniqueId()
        let idList = []
        idList = await firestore().collection('users').doc(id).collection('countdata').get().then(query => {
            let arr = []
            query.forEach(el => {
                arr.push(el.id)
            })
            return arr
        })
        return idList
    }

    function checkNotSubmittedData(submittedIDs, storedData){
        let notSubmitted = []
        notSubmitted = storedData.filter(el => {
            if (submittedIDs.indexOf(el.key) == -1) return true
        })
        return notSubmitted
    }

    async function submitAll(){
        let id = getUniqueId()
        notSubmittedData.forEach(async el => {
            let dataObj = el.data
            dataObj.submitted = true
            let jsonData = JSON.stringify(dataObj)
            firestore().collection('users').doc(id).collection('countdata').doc(el.key).set({key:el.key, data:dataObj})
            await AsyncStorage.setItem(el.key, jsonData)
        })
        initData()
    }

    async function submitSingle(data, key){
        let id = getUniqueId()

        await firestore().collection('users').doc(id).collection('countdata').doc(key).set(data)
        let dataObj = data
        dataObj.submitted = true

        let jsonData = JSON.stringify(dataObj)
        await AsyncStorage.setItem(key, jsonData)
        removeFromNotSubmittedList(key)

        initLite(true)
    }

    async function addSubmitProperty(data, submittedBool = false){
        data = data.map(el => {
            let dataObj = el.data
            dataObj.submitted = submittedBool

            return [el.key, JSON.stringify(dataObj)]
        })

        await AsyncStorage.multiSet(data)
    }

    function checkMissingSubmitProp(data){
        let arr = data.filter(el => {
            if (el.data.submitted == undefined) return true
        })
        return arr
    }

    async function deleteItem(key) {
        await AsyncStorage.removeItem(key)
        initLite()
    }

    function mainRender(){
        if (allDataSize > 0) {
            return (
                <View style={{flex:1}}>
                    {renderList()}
                    {renderSubmitButton()}
                </View>
            )
        } else {
            return (
                <Text style={{color:'black', fontSize:20, textAlign:'center', marginTop:50}}>Nothing here yet...</Text>
            )
        }
    }

    function renderSubmitButton(){
        if (notSubmittedData.length > 0) {
            return (
                <View style={{display:'flex', alignItems:'center', paddingVertical:10}}>
                    <Button 
                        text="Submit All"
                        big={true}
                        action={()=>{
                            submitAll()
                        }}
                    />
                </View>
            )
        } else {
            return (
                <View style={{display:'flex', alignItems:'center', paddingVertical:10}}>

                    <Button 
                        text="All Submitted"
                        disabled={true}
                        big={true}

                    />
                </View>
                )
        }
    }

    function renderList(){
        if (grouping) {
            return (
                <FlatList 
                    style={styles.flatlist}
                    data={allCountData}
                    keyExtractor={item => item.date}
                    renderItem={renderItemGroup}
                    ListFooterComponent={<View style={{height:10}}></View>}
                />
            )
        } else {
            return (
                <FlatList 
                    style={styles.flatlist}
                    data={allCountData}
                    keyExtractor={item => item.key}
                    renderItem={renderItem}
                    ListFooterComponent={<View style={{height:10}}></View>}
                />
            )
        }
    }

    function showModal(data, key){
        let dataObject = {...data, key}
        setModalData(dataObject)
        setShowDetailsModal(true)
    }

    function renderItem({item}){
        return (
            <SessionCard data={item.data} storageKey={item.key} removeFromNotSubmitted={removeFromNotSubmittedList} showModal={showModal}/>
        )
    }

    function renderItemGroup({item}){
        return (
            <SessionGrouper date={item.date} size={item.size} datalist={item.list} removeFromNotSubmitted={removeFromNotSubmittedList} showModal={showModal}/>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                visible={showDetailsModal}
                transparent={true}
                animationType='slide'
                style={{flex:1}}
            >
                <View style={styles.modal}>
                    {modalData != undefined && 
                        <View style={styles.modalMainView}>
                            <View style={styles.modalTopSection}>
                                <View style={styles.modalDetails}>
                                <Text style={styles.text}>{modalData.date} {modalData.time}</Text>
                                <Text style={styles.text}>Species: {modalData.data.length}</Text>
                                <Text style={styles.text}>Total Counted: {modalData.totalCount}</Text>
                                {
                                    (() => {
                                       if (modalData.duration != undefined) {
                                          if (modalData.duration < 1) {
                                             return <Text style={styles.text}>Duration: {'< 1min'}</Text>
                                             
                                          }
                                          if (modalData.duration > 60) {
                                             let hr = modalData.duration / 60
                                             let min = modalData.duration%60
                                             return <Text style={styles.text}>Duration: ~ {hr}hr {min}min</Text>
                                          }
                                          return <Text style={styles.text}>Duration: ~ {modalData.duration}min</Text>
                                       }
                                    })()
                                }
                                {
                                    modalData.note != '' && modalData.note != undefined &&
                                    <TouchableOpacity style={[styles.btn, {paddingVertical:5}]} onPress={()=>{
                                        setModalNote(prev => !prev)
                                    }}>
                                        <Text style={[styles.btnTxt, {fontSize:18}]}>Note</Text>
                                    </TouchableOpacity>
                                }
                                </View>
                                {
                                    modalData.submitted ?
                                    <View style={styles.submitDetail}>
                                        <Text style={[styles.text, {fontSize:16, color:'green'}]}>Submitted</Text>
                                    </View>
                                    :
                                    <TouchableOpacity style={[styles.submitDetail, {backgroundColor:'green'}]} onPress={()=>{
                                        submitSingle(modalData, modalData.key)
                                    }}>
                                        <Text style={[styles.text, {fontSize:18, color:'white'}]}>Submit</Text>
                                    </TouchableOpacity>
                                }

                            </View>
                            {
                                modalNote ?
                                <ScrollView style={{width:'100%', padding:10, flex:1, backgroundColor:'rgb(200,200,200)'}}>
                                    <Text style={[styles.text, {fontSize:18, textAlign:'left', backgroundColor:'white', borderRadius:5, padding:5}]}>{modalData.note}</Text>
                                </ScrollView>
                                :
                                <FlatList 
                                style={{backgroundColor:'rgb(200,200,200)', padding:10, width:'100%'}}
                                data={modalData.data}
                                keyExtractor={(item, i) => i}
                                renderItem={({item}) => {
                                    return (
                                        <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', backgroundColor:'white', borderRadius:5, marginBottom:10, padding:5, paddingHorizontal:10}}>
                                            <Text style={styles.text}>{item.name}</Text>
                                            <Text style={styles.text}>{item.count}</Text>
                                        </View>
                                    )
                                }}
                                ListFooterComponent={<View style={{height:10}}></View>}
                                />
                            }

                            <TouchableOpacity style={[styles.btn, {backgroundColor:'red', marginVertical:10}]} onPress={()=>{
                                Alert.alert(
                                    'Delete list?',
                                    'Are you sure you want to delete this counting data?',
                                    [
                                       {
                                          text:'Delete',
                                          style:'default',
                                          onPress: ()=>{
                                            deleteItem(modalData.key)
                                            setShowDetailsModal(false)
                                            setModalNote(false)
                                          }
                                       },
                                       {
                                          text:'Cancel',
                                          style:'default',
                                          onPress: ()=>{}
                                       }
                                    ],
                                    
                                )
                            }}>
                                <Text style={styles.btnTxt}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    <Button 
                        text='Close'
                        color='red'
                        big={true}
                        action={()=>{
                            setShowDetailsModal(false)
                            setModalNote(false)
                        }}
                    />
                </View>
            </Modal>
            {mainRender()}
        </SafeAreaView>
    )
}

export default CountingLists;


const SessionGrouper = (props) => {
    const [expand, setExpand] = useState(false)

    function displayDate(){
        let today = getDate()
        if (props.date == today){
           return `${today} (Today)`
        }
        return props.date
     }

    function getDate(){
        let datum = new Date()
        let year = datum.getFullYear()
        let month = datum.getMonth() + 1
        let day = datum.getDate()
        return `${day}-${month}-${year}`
     }

    function renderList(){
        return (
            <FlatList 
                style={styles.grouperList}
                data={props.datalist}
                keyExtractor={item => item.key}
                renderItem={renderItem}
            />
        )
    }

    function renderItem({item}){
        return (
            <SessionCard data={item.data} storageKey={item.key} removeFromNotSubmitted={props.removeFromNotSubmitted} showModal={props.showModal}/>
        )
    }

    return (
        <View style={styles.grouper}>
            <View style={styles.grouperInfoSection}>
                <View style={styles.grouperDetails}>
                    <Text style={styles.text}>{displayDate()}</Text>
                    <Text style={[styles.text, {textAlign:'left'}]}>{props.size} Records</Text>
                </View>
                {
                    expand ?
                    <Button 
                        text='Hide'
                        action={()=>{
                            setExpand(false)
                        }}
                        color='red'
                        big={true}
                    />
                    :
                    <Button 
                        text='Show'
                        action={()=>{
                            setExpand(true)
                        }}
                        big={true}
                    />
                }
            </View>
                {
                    expand &&
                    renderList()
                }
        </View>
    )
}

const SessionCard = (props) => {

    async function submitSingle(){
        let id = getUniqueId()

        await firestore().collection('users').doc(id).collection('countdata').doc(props.storageKey).set({key:props.storageKey, data:props.data})
        let dataObj = props.data
        dataObj.submitted = true

        let jsonData = JSON.stringify(dataObj)
        await AsyncStorage.setItem(props.storageKey, jsonData)
        props.removeFromNotSubmitted(props.storageKey)
    }

    return (
        <View style={styles.sessionCard}>
            <View style={styles.cardInfo}>
                <View style={styles.infoBlock}>
                    <Text style={styles.infoText}>{props.data.date}</Text>
                    <Text style={styles.infoText}>{props.data.time}</Text>
                    {
                        (() => {
                           if (props.data.duration != undefined) {
                              if (props.data.duration < 1) {
                                 return <Text style={styles.infoText}>{'< 1min'}</Text>
                                 
                              }
                              if (props.data.duration > 60) {
                                 let hr = props.data.duration / 60
                                 let min = props.data.duration%60
                                 return <Text style={styles.infoText}>~ {hr}hr {min}min</Text>
                              }
                              return <Text style={styles.infoText}>~ {props.data.duration}min</Text>
                           }
                        })()
                    }
                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.infoText}>Species: {props.data.data.length}</Text>
                    {
                        props.data.totalCount > 999 ? 
                        <Text style={styles.infoText}>Total: {'> 999'}</Text>
                        :
                        <Text style={styles.infoText}>Total: {props.data.totalCount}</Text>
                    }
                    {
                        props.data.submitted ?
                        <View style={styles.submitDetail}>
                            <Text style={[styles.text, {fontSize:16, color:'green'}]}>Submitted</Text>
                        </View>
                        :
                        <TouchableOpacity style={[styles.submitDetail, {backgroundColor:'green'}]} onPress={()=>{
                            submitSingle()
                        }}>
                            <Text style={[styles.text, {fontSize:16, color:'white'}]}>Submit</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
            <Button 
                text='Details'
                color='neutral'
                big={true}
                action={()=>{
                    props.showModal(props.data, props.storageKey)
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'rgb(220,220,220)'
    },
    flatlist:{
        // paddingHorizontal:10,
        marginTop:10
    },
    btn:{
        backgroundColor:'green',
        paddingVertical:8,
        paddingHorizontal:12,
        borderRadius:5
    },
    btnTxt:{
        color:'white',
        fontSize:20,
        textAlign:'center'
    },
    text:{
        color:'black',
        fontSize:20,
        textAlign:'center'
    },
    infoText:{
        color:'black',
        fontSize:18,
        textAlign:'center'
    },
    sessionCard:{
        backgroundColor:'white',
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginBottom:20,
        padding:5,
        paddingHorizontal:10,
        borderRadius:6,
    },
    cardInfo:{
        display:'flex',
        flexDirection:'row'
    },
    infoBlock:{
        display:'flex',
        alignItems:'flex-start',
        marginRight:20
    },
    submitDetail:{
        borderColor:'green',
        borderWidth:1,
        backgroundColor:'white',
        borderRadius:5,
        paddingHorizontal:4
    },
    grouper:{
        backgroundColor:'white',
        marginBottom:20,
        // borderRadius:10,
        // borderWidth:1,
        
    },
    grouperInfoSection:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        padding:5,
        paddingHorizontal:10,
    },
    grouperList:{
        backgroundColor:'rgb(180,180,180)',
        padding:10,
        // borderBottomRightRadius:10,
        // borderBottomLeftRadius:10,
        // borderWidth:2,
        // borderColor:'grey',
        // borderTopWidth:0
    },
    modal:{
        flex:1, 
        display:'flex', 
        justifyContent:'center', 
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.7)'
    },
     modalMainView:{
        backgroundColor:'white',
        width:'90%',
        height:'80%',
        borderRadius:10,
        display:'flex',
        alignItems:'center'
    },
    modalDetails:{
        display:'flex',
        alignItems:'flex-start',
        padding:5,
        paddingHorizontal:10,
    },
    modalTopSection:{
        width:'100%',
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingRight:10
    }
})