import React, {useState, useEffect, Component, PureComponent, useRef} from 'react'
import { Dimensions, SafeAreaView, StyleSheet, Image, Text, View, TouchableOpacity, ScrollView, FlatList, TextInput, Alert, Modal, KeyboardAvoidingView } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import Geolocation from '@react-native-community/geolocation'
import firestore from '@react-native-firebase/firestore'
import { getUniqueId } from 'react-native-device-info'

import rawBirdData from '../jsondata/birdData.json'
import img from '../images/imageindex.js'
import allBirdsList from '../jsondata/nepalBirdList.json'
import Button from './components/Button'
import { useNavigation } from '@react-navigation/core'

const screenHeight = Dimensions.get('window').height

const CountingScreen = (props) => {
    const navigation = useNavigation()
    const [district, setDistrict] = useState('')
    const [userCoords, setUserCoords] = useState('')
    const [coordsStatus, setCoordsStatus] = useState(undefined)

    const [startTime, setStartTime] = useState(undefined)
    const [startTimeMS, setStartTimeMS] = useState(Date.now())
    const [currentTime, setCurrentTime] = useState(0)
    const [autoSavedTime, setAutoSavedTime] = useState(0)

    const [mode, setMode] = useState('default')

    const [birdData, setBirdData] = useState(rawBirdData.map((el, i)=>{
        return {...el, count:0, index:i}
    }))

    const [dataReady, setDataReady] = useState(false)

    const [totalCount, setTotalCount] = useState(0)

    const [savedNote, setSavedNote] = useState('')
    const [showList, setShowList] = useState(true)

    const [autoSaveCount, setAutoSaveCount] = useState(0)

    const [showBottomSection, setShowBottomSection] = useState(true)

    const [helpFilter, setHelpFilter] = useState({})
    const [helpFilterActive, setHelpFilterActive] = useState(false)

    const [showingCount, setShowingCount] = useState(0)

    const [showModal, setShowModal] = useState(false)
    const [showModal2, setShowModal2] = useState(false)

    const [finishedCounting, setFinishedCounting] = useState(false)

    const [firstTimeUpdate, setFirstTimeUpdate] = useState(true)

    //navigation listener
    useEffect(()=>{
        navigation.addListener('beforeRemove', listenerFunction)
        return ()=>{
            navigation.removeListener('beforeRemove', listenerFunction)
        }
    })

    async function listenerFunction(e) {
        e.preventDefault()

        let x = false
        x = await autoSave()
        if (x) {
            navigation.dispatch(e.data.action)
        }
    }

    //general
    useEffect(()=>{
        getDistrict()
        getCoords()
        getStartTime()
    }, [])

    const [timer1State, setTimer1State] = useState(false)
    useEffect(()=>{
        let timeGap = 5000
        if (firstTimeUpdate) {
            timeGap = 500
            setFirstTimeUpdate(false)
        }
        updateCurrentTime()
        let timer1 = setTimeout(()=>{
            setTimer1State(prev => !prev)
        }, timeGap)
        
        return ()=>{
            clearTimeout(timer1)
        }
    }, [timer1State])

    const [timer2State, setTimer2State] = useState(false)
    useEffect(()=>{
        autoSave()
        let timer2 = setTimeout(()=>{
            setTimer2State(prev => !prev)
        }, 15000)

        return ()=>{
            clearTimeout(timer2)
        }
    }, [timer2State])


    useEffect(()=>{
        if (district != '') {
            prepBirdData(district)
        }
    }, [district])

    async function prepBirdData(district){
        let data = birdData.sort((a, b) => {
            return Number(a.order) - Number(b.order)
        }).filter(el=>{
            if (el.locations.indexOf(district) != -1) return true
        }).map((el, i)=>{
            return {...el, count:0, index:i}
        })
        let autosavedata = await checkAutoSaveData()
        if (autosavedata !== false) {
            data = await mergeAutoSaveData(data, autosavedata)
        }

        setTotalCount(getTotalCount(data))
        setAutoSaveCount(getTotalCount(data))
        setBirdData(data)
        setDataReady(true)
    }

    async function checkAutoSaveData(){
        let dataJSON = await AsyncStorage.getItem('@autosave_data')
        if (dataJSON != null) {
            let data = JSON.parse(dataJSON)
            return data
        } else {
            return false
        }
    }

    async function mergeAutoSaveData(data1, data2){
        let cData = data2.countData
        let arr = data1.map(el => {
            let count = 0
            cData.forEach(el2 => {
                if (el2.name == el.name) {
                    count = el2.count + el.count
                }
            })

            if (count == 0) return el
            el.count = count
            return el
        })

        setAutoSavedTime(Number(data2.timeElapsed))
        return arr
    }

    async function getDistrict() {
        let userJSON = await AsyncStorage.getItem('@chhimekichara_user')
        if (userJSON != null) {
            let user = JSON.parse(userJSON)
            if (user.location) {
                setDistrict(user.location)
            } else setDistrict('locationError')
        } else {
            setDistrict('locationError')
        }
    }

    async function getCoords() {
        Geolocation.getCurrentPosition(info => {
            setUserCoords({lat:info.coords.latitude, lng:info.coords.longitude})
            setCoordsStatus('success')
        }, ()=>{
            setUserCoords({lat:'error', lng:'error'})
            setCoordsStatus('failed')
        }, {enableHighAccuracy:false, maximumAge:3600000, timeout:5000})
    }

    function getDisplayData(){
        let arr = [...birdData]

        if (searchFilter != undefined && searchFilter != '' && !helpFilterActive) {
            arr = filterResults(searchFilter, arr)
        }

        if (helpFilterActive) {
            arr = filterByHelp(arr)
        }

        return arr
    }

    function getShowingCount(n) {
        setShowingCount(n)
    }

    function updateMode(mode){
        setMode(mode)
        if (mode == undefined || mode == 'default') {
            setHelpFilter({})
            setHelpFilterActive(false)
        }
        if (mode == 'identify') {
            setShowList(false)
            setShowBottomSection(false)
        }
        else {
            setShowList(true)
            setShowBottomSection(true)
        }

    }

    const [searchFilter, setSearchFilter] = useState(undefined)

    function updateSearch(input) {
        setSearchFilter(input)
    }

    function filterResults(input, array){
        if (input == '') {
            return array
        }
        let searchWords = input.split(' ')
        let arr = [...array]
        let matchedArr = arr.filter(bird=>{
            let tempArr = searchWords.filter(searchTerm=>{
                let regex = new RegExp(`${searchTerm}`, 'gi')
                return bird.name.match(regex)
            })
            if (tempArr.length == searchWords.length) return true
        })
        return matchedArr
    }

    function getTotalCount(arr){
        let counted = 0
        arr.forEach(el=>{
            counted += el.count
        })
        return counted
    }

    function updateCount(index, n, set = false){
        let temp = birdData
        if (set) {
            temp[index].count = n
        } else {
            temp[index].count += n
        }
        setTotalCount(getTotalCount(temp))
        setBirdData(temp)
    }

    function updateNote(note) {
        if (note == undefined) note =''
        setSavedNote(note)
    }

    function updateShowList(bool) {
        setShowList(bool)
    }

    function getStartTime(){
        let date = new Date()
        let h = date.getHours()
        let m = date.getMinutes()
        let s = date.getSeconds()
        if (s < 10) s = '0' + s
        setStartTime(`${h}:${m}:${s}`)
    }

    function updateCurrentTime(){
        if (finishedCounting) return
        let newTime = Date.now()
        let time = (newTime - startTimeMS) + autoSavedTime
        time = (time / 1000).toFixed(0)
        let hr = undefined
        let min = ~~(time / 60)
        let sec = (time % 60).toFixed(0)
        if (min >= 60) {
            hr = ~~(min / 60)
            min = min - (hr * 60)
            setCurrentTime(`${hr} hr ${min} min ${sec} sec`)
        } else {
            setCurrentTime(`${min} min ${sec} sec`)
        }
    }

    async function deleteAutoSaveObject(){
        await AsyncStorage.removeItem('@autosave_data')
    }

    async function autoSave(){
        if (autosaveRef.current == false) return true
        let c = autoSaveCount
        setAutoSaveCount(totalCount)
        if (c == totalCount || totalCount == 0) {
            return true
        }
        let time = Date.now()
        let timeElapsed = (time - startTimeMS) + autoSavedTime
        
        let countData = birdData.filter(el => {
            if (el.count > 0) return true
        }).map(el => {
            return {name:el.name, count:el.count, index:el.index, order:el.order}
        })

        let autoSaveObject = {
            countData,
            timeElapsed,
        }

        let JSONObject = JSON.stringify(autoSaveObject)
        await AsyncStorage.setItem('@autosave_data', JSONObject)
        return true
    }

    function navigateToSpecies(data){
        navigation.navigate('SpeciesScreen', {data:data})
    }

    function showBottom(bool){
        setShowBottomSection(bool)
    }

    function updateHelpFilter(a, set=false){
        setHelpFilter(a)
        if(set) {
            setHelpFilterActive(true)
            setShowBottomSection(true)
            setShowList(true)
        }
    }

    function filterByHelp(arr){
        let idSize = helpFilter.sizes
        if (idSize != undefined) {
            if (idSize.split('_').length == 2) idSize = idSize.split('_')
            else idSize = [idSize]
        }

        arr = arr.filter(bird => {
            let match = true

            //colors
            if (helpFilter.colors.length > 0) {
                helpFilter.colors.forEach(col => {
                    if (bird.id.colors.indexOf(col) == - 1) match = false
                })
            }

            if (!match) return match

            if (idSize != undefined) {
                let oneMatch = false
                idSize.forEach(size => {
                    if (bird.id.size.indexOf(size) != -1) oneMatch = true
                })
                match = oneMatch
            }

            if (!match) return match
            
            if (helpFilter.locations != undefined) {
                if (bird.id.habitat.indexOf(helpFilter.locations) == -1) match = false
            }

            if (!match) return match

            if (helpFilter.amounts != undefined) {
                if (bird.id.numbers.indexOf(helpFilter.amounts) == -1) match = false
            }

            return match
        })

        return arr
    }

    function getSessionDuration(){
        let timeA = startTimeMS
        let timeB = Date.now()
        let duration = (((timeB - timeA) + autoSavedTime) / 1000) / 60
        return Math.round(duration)
    }

    async function uploadData(saveData){
        let id = getUniqueId()
        await firestore().collection('users').doc(getUniqueId()).collection('countdata').doc(saveData.key).set(Object.assign(saveData)).catch(err=>console.log('ERROR', err, 'ERROR'))
    }

    async function saveCountData(submitted = false){
        let countedBirds = birdData.filter(bird=>{
            if (bird.count > 0) return true
        }).map(bird=>{
            return {
                name:bird.name,
                order:bird.order,
                count:bird.count,
                code:bird.code
             }
        })

        let datum = new Date()
        let currentDate = `${datum.getDate()}-${datum.getMonth() + 1}-${datum.getFullYear()}`
        let currentMinutes = datum.getMinutes().toString()
        if (currentMinutes.split('').length == 1) {
           currentMinutes = '0' + currentMinutes
        }
        let currentTime = `${datum.getHours()}:${currentMinutes}:${datum.getSeconds()}`
        let displayTime = `${datum.getHours()}:${currentMinutes}`
        
        let sessionDuration = getSessionDuration()
        let isSubmitted = submitted

        let dataObject = {
            data:countedBirds,
            date:currentDate,
            time:displayTime,
            totalCount:totalCount,
            location:district,
            coords:userCoords,
            note:savedNote,
            duration:sessionDuration,
            submitted:isSubmitted
        }

        let jsonData = JSON.stringify(dataObject)
        let storageKey = `@countData_${currentDate}_${currentTime}`
        await AsyncStorage.setItem(storageKey, jsonData)
        return {data:dataObject, key:storageKey}
    }

    const autosaveRef = useRef(true)

    async function saveAndExit(upload = false){
        setShowModal(true)
        setFinishedCounting(true)
        setShowBottomSection(false)

    }

    async function saveFinal(upload = false) {
        saveCountData(upload).then(async saveData=>{
            if (upload) {
                uploadData(saveData)
            }
        }).then(()=>{
            autosaveRef.current = false
        }).then(()=>{
            deleteAutoSaveObject()
        }).then(()=>{
            navigation.goBack()
        })
    }

    function showFinalList(){
        if (!finishedCounting) return []
        let arr = birdData.filter(el => {
            return el.count > 0
        }).map(el => {
            return {
                name:el.name, count:el.count, key:el.order
            }
        })
        return arr
    }


    return (
        <SafeAreaView style={styles.container}>
        <Modal visible={showModal} transparent={true} style={{flex:1}} animationType='slide'>
            <View style={styles.modalBg}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={styles.modalInfoText}>Duration: {currentTime}</Text>
                        <Text style={styles.modalInfoText}>Total Counted: {totalCount}</Text>
                    </View>
                    <FlatList 
                        style={styles.flatList}
                        data={showFinalList()}
                        keyExtractor={item => item.key}
                        renderItem={({item})=>(
                            <View style={{backgroundColor:'white', marginBottom:6, paddingHorizontal:8}}>
                                <Text style={{textAlign:'left', fontSize:16, color:'black'}}>{item.count} - {item.name}</Text>
                            </View>
                        )}
                    />
                    <View style={styles.modalBtns}>
                        <Button 
                            color='red'
                            text='Cancel'
                            action={()=>{
                                setShowModal(false)
                                setFinishedCounting(false)
                                setShowBottomSection(true)
                            }}
                        />
                        <Button 
                            text='Confirm'
                            big={true}
                            action={()=>{
                                setShowModal(false)
                                setShowModal2(true)
                            }}
                        />
                    </View>    
                </View>
            </View>
        </Modal>
        <Modal visible={showModal2} transparent={true} style={{flex:1}} animationType='slide'>
            <View style={styles.modalBg}>
                <View style={{backgroundColor:'white', borderRadius:6, display:'flex', justifyContent:'center', alignItems:'center'}}>
                    <Button 
                        text='Save and Submit'
                        big={true}
                        action={()=>{
                            saveFinal(true)
                            setShowModal(false)
                            setShowModal2(false)
                        }}
                    />
                    <Button 
                        text='Save Only'
                        big={true}
                        action={()=>{
                            saveFinal(false)
                            setShowModal(false)
                            setShowModal2(false)
                        }}
                    />
                    <Button 
                        text='Cancel'
                        color='red'
                        big={true}
                        action={()=>{
                            setShowModal(false)
                            setShowModal2(false)
                            setFinishedCounting(false)
                            setShowBottomSection(true)
                        }}
                    />
                </View>
            </View>
        </Modal>
            {
                showBottomSection &&
                <LocationBar status={coordsStatus} coords={userCoords}/>
            }
            <TopSection update={updateMode} updateSearch={updateSearch} updateNote={updateNote} currentNote={savedNote} showList={updateShowList} showBottom={showBottom}/>
            {
                showBottomSection &&
                <View style={styles.infoBar}>
                    <Text style={styles.infoText}>Start: {startTime}</Text>
                    <Text style={styles.infoText}>{currentTime}</Text>
                    <Text style={styles.infoText}>Total: {totalCount}</Text>
                </View>
            }
            {
                showList && dataReady &&
                <ListSection listData={birdData} getDisplayData={getDisplayData} getShowing={getShowingCount} updateCount={updateCount} navigate={navigateToSpecies}/>
            }
            {
                totalCount > 0 && showBottomSection &&
                <BottomSection save={saveAndExit}/>
            }
            {
                mode == 'identify' && !showList &&
                <IdentifySection update={updateHelpFilter} helpFilter={helpFilter}/>
            }
        </SafeAreaView>
    )
}

export default CountingScreen;


const styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        flex:1
    },
    infoBar:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-evenly'
    },
    infoText:{
        fontSize:16,
        color:'black'
    },
    topSection:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-evenly',
        alignItems:'center'
    },
    textInput:{
        borderWidth:2,
        borderColor:'grey',
        borderRadius:20,
        paddingHorizontal:20,
        paddingVertical:5,
        backgroundColor:'white',
        fontSize:20,
        textAlign:'center',
        flex:1,
        marginRight:10,
        color:'black'
    },
    flatList:{
        backgroundColor:'rgb(230,230,230)',
        paddingTop:8,
    },
    noteInput:{
        borderWidth:2,
        borderColor:'rgb(220,220,220)',
        borderRadius:8,
        textAlignVertical:'top',
        margin:8,
        fontSize:18,
        // maxHeight:screenHeight * 0.6
    },
    noteSection:{
        // height:screenHeight * 0.8,
        flex:1,
    },
    addBirdSection:{

    },
    bottomSection:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-evenly',
        alignItems:'center'
    },
    modalBg:{
        backgroundColor:'rgba(0,0,0,0.5)',
        height:'100%',
        width:'100%',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        flex:1
    },
    modalView:{
        display:'flex',
        backgroundColor:'white',
        height:'80%',
        width:'90%',
        borderRadius:6,

    },
    modalInfo:{
        paddingHorizontal:8
    },
    modalInfoText:{
        color:'black',
        fontSize:18,

    },
    modalBtns:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    }
})

const LocationBar = (props) => {
    const [color, setColor] = useState('orange')
    const [text, setText] = useState('getting location')

    useEffect(()=>{
        if (props.status == 'failed') {
            setColor('red')
            setText('location error')
        }
        if (props.status == 'success') {
            setColor('green')
            setText(`LAT:${props.coords.lat}, LNG:${props.coords.lng}`)
        }
    }, [props.status])

    return (
        <View style={{backgroundColor:color}}>
            <Text style={{color:'white', fontSize:12, textAlign:'center'}}>{text}</Text>
        </View>
    )
}

const TopSection = (props) => {
    const [mode, setMode] = useState(undefined)
    const [addMode, setAddMode] = useState(undefined)
    const [searchInput, setSearchInput] = useState('')

    const [noteText, setNoteText] = useState(props.currentNote)

    const [addBirdInput, setAddBirdInput] = useState('')



    if (mode == 'identify') {
        return (
            <View style={styles.topSection}>
                <Button 
                big={true}
                text='Cancel Help'
                color='red'
                action={()=>{
                    setMode(undefined)
                    props.update('default')
                }}
                />
            </View>
        )
    }

    if (mode == 'search') {
        return (
            <View style={styles.topSection}>
                <TextInput 
                    style={styles.textInput}
                    placeholder='Search'
                    placeholderTextColor='grey'
                    autoFocus={true}
                    value={searchInput}
                    onChangeText={text=>{
                        setSearchInput(text)
                        props.updateSearch(text)
                     }}
                />
                <Button
                text='Cancel'
                color='red'
                action={()=>{
                    setSearchInput('')
                    setMode(undefined)
                    props.update('default')
                    props.updateSearch('')
                }}
                />
            </View>
        )
    }

    if (mode == 'more') {
        if (addMode == 'bird') {
            return (
                <View style={styles.addBirdSection}>
                    <TextInput 

                    />
                </View>
            )
        }

        if (addMode == 'note'){
            return (
                <KeyboardAvoidingView 
                    behavior={'padding'}
                    style={styles.noteSection}>
                    <TextInput 
                        style={styles.noteInput}
                        placeholder='Add note here...'
                        placeholderTextColor={'grey'}
                        value={noteText}
                        onChangeText={(text)=>{
                            setNoteText(text)
                        }}
                        multiline={true}
                        numberOfLines={6}
                    />
                    <View style={styles.topSection}>
                    <Button 
                        text='Cancel'
                        color="red"
                        action={()=>{
                            setNoteText(props.currentNote)
                            setAddMode(undefined)
                            props.showList(true)
                            props.showBottom(true)
                        }}
                    />
                    {
                        props.currentNote !== undefined &&
                        <Button 
                            text='Delete Note'
                            color='red'
                            action={()=>{
                                setNoteText(undefined)
                                setAddMode(undefined)
                                props.updateNote(undefined)
                                props.showList(true)
                                props.showBottom(true)
                            }}
                        />
                    }
                    <Button
                        text='Save'
                        action={()=>{
                            props.updateNote(noteText)
                            setAddMode(undefined)
                            props.showList(true)
                            props.showBottom(true)
                        }}
                    />
                    </View>
                </KeyboardAvoidingView>
            )
        }

        return (
            <View style={styles.topSection}>
                <Button
                    text='Add Bird'
                    color='neutral'
                    big={true}
                    action={()=>{
                        setAddMode('bird')
                        props.showList(false)
                    }}
                />
                {
                    props.currentNote == undefined ?
                    <Button
                        text='Add Note'
                        color='neutral'
                        big={true}
                        action={()=>{
                            setAddMode('note')
                            props.showBottom(false)
                            props.showList(false)
                        }}
                    />
                    :
                    <Button
                        text='Edit Note'
                        color='neutral'
                        big={true}
                        action={()=>{
                            setAddMode('note')
                            props.showBottom(false)
                            props.showList(false)
                        }}
                    />
                }
                <Button 
                    text='Back'
                    color='red'
                    action={()=>{
                        setMode(undefined)
                        setAddMode(undefined)
                        props.update('default')
                    }}
                />
            </View>
        )
    }


    return (
        <View style={styles.topSection}>
            <Button 
                text='Help Identify'
                big={true}
                action={()=>{
                    setMode('identify')
                    props.update('identify')
                }}
            />
            <Button 
                text='Search'
                big={true}
                action={()=>{
                    setMode('search')
                    props.update('search')
                }}
            />
            <Button 
                text='More'
                big={true}
                action={()=>{
                    setMode('more')
                    props.update('more')
                }}
            />
        </View>
    )
}

const BottomSection = (props) => {
    const navigation = useNavigation()
    return (
        <View style={styles.bottomSection}>
            <Button 
                text='Exit'
                color='red'
                action={()=>{
                    navigation.goBack()
                }}
            />
            <Button 
                text='Save & Review'
                big={true}
                action={()=>{
                    props.save()
                }}
            />
        </View>
    )
}

const sparrowIcon = require('../images/sparrow_icon.png')
const robinIcon = require('../images/robin_icon.png')
const mynaIcon = require('../images/myna_icon.png')
const crowIcon = require('../images/crow_icon.png')
const gooseIcon = require('../images/goose_icon.png')

const IdentifySection = (props) => {

    const [colors, setColors] = useState([])
    const [sizes, setSizes] = useState(undefined)
    const [locations, setLocations] = useState(undefined)
    const [amounts, setAmounts] = useState(undefined)

    const colorChoices = ['black', 'white', 'grey', 'blue', 'green', 'red', 'orange', 'yellow', 'brown']
    const sizeChoices = ['sparrow','sparrow_robin', 'robin', 'robin_myna', 'myna', 'myna_crow', 'crow', 'crow_goose', 'goose']
    const sizeLabels = ['Sparrow', 'Robin', 'Myna', 'Crow', 'Goose']
    const locationChoices = ['tree', 'air', 'shrub/crops', 'ground', 'building/rock', 'wire/fence', 'waterside']
    const amountChoices = ['1', '2-5', '6-15', '16-50', '>50']

    function chooseColor(color){
        let colorArray = colors
        let colorIndex = colorArray.indexOf(color)
        if (colorIndex == -1) {
            colorArray.push(color)
        } else {
            colorArray.splice(colorIndex, 1)
        }
        setColors(colorArray)
        props.update({...props.helpFilter,
            colors:colorArray
        })
    }

    return (
        <ScrollView style={{flex:1}}>
            <View style={idStyles.container}>
                <View style={idStyles.optionBlock}>
                    <Text style={idStyles.optionTitle}>What colors did it have?</Text>
                    <View style={idStyles.optionChoices}>
                        {
                            colorChoices.map((color, i) => {
                                let styling = idStyles.colorOption
                                if (colors.indexOf(color) != -1) {
                                    styling = idStyles.colorOptionActive
                                }
                                let bgcolor = color
                                if (color == 'brown') bgcolor = '#b37c3d'
                                return (
                                    <TouchableOpacity key={i} style={[styling, {backgroundColor:bgcolor}]} onPress={()=>{
                                        chooseColor(color)
                                    }}/>
                                )
                            })
                        }
                    </View>
                </View>
                <View style={idStyles.splitter}/>
                <View style={idStyles.optionBlock}>
                    <Text style={idStyles.optionTitle}>How big was it?</Text>
                    <View style={[idStyles.optionChoices, {justifyContent:'space-between'}]}>
                        <Image source={sparrowIcon} style={idStyles.icon}/>
                        <Image source={robinIcon} style={idStyles.icon}/>
                        <Image source={mynaIcon} style={idStyles.icon}/>
                        <Image source={crowIcon} style={idStyles.icon}/>
                        <Image source={gooseIcon} style={idStyles.icon}/>
                    </View>
                    <View style={[idStyles.optionChoices, {justifyContent:'space-between'}]}>
                        {
                            sizeChoices.map((size, i) => {
                                let styling = {
                                    height:24,
                                    width:24,
                                    borderRadius:12,
                                    backgroundColor:'white',
                                    borderWidth:1,
                                    borderColor:'black'
                                }
                                if (sizes == size) {
                                    styling = {
                                        height:28,
                                        width:28,
                                        borderRadius:14,
                                        backgroundColor:'#8ea604',
                                        borderWidth:1,
                                        borderColor:'#8ea604'
                                    }
                                }
                                return (
                                    <TouchableOpacity key={i} style={styling} onPress={()=>{
                                        if (sizes == size) setSizes(undefined)
                                        else setSizes(size)
                                    }} />
                                )
                            })
                        }
                    </View>
                    <View style={[idStyles.optionChoices, {justifyContent:'space-between'}]}>
                        {
                            sizeLabels.map((label, i) => {
                                return (
                                    <Text style={idStyles.optionText} key={i}>{label}</Text>
                                )
                            })
                        }
                    </View>
                </View>
                <View style={idStyles.splitter}/>
                <View style={idStyles.optionBlock}>
                    <Text style={idStyles.optionTitle}>Where was it?</Text>
                    <View style={idStyles.optionChoices}>
                        {
                            locationChoices.map((location, i)=>{
                                let styling = idStyles.optionBox
                                let textStyling = idStyles.optionText
                                if (locations == location){
                                    styling = idStyles.optionBoxActive
                                    textStyling = [idStyles.optionText, {color:'white'}]
                                }

                                return (
                                    <TouchableOpacity key={i} style={styling} onPress={()=>{
                                        if (locations == location) setLocations(undefined)
                                        else setLocations(location)
                                    }}>
                                        <Text style={textStyling}>{location}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
                <View style={idStyles.splitter}/>
                <View style={idStyles.optionBlock}>
                    <Text style={idStyles.optionTitle}>How many were there?</Text>
                    <View style={idStyles.optionChoices}>
                        {
                            amountChoices.map((amount, i) => {
                                let styling = idStyles.optionBox
                                let textStyling = idStyles.optionText

                                if (amounts == amount) {
                                    styling = idStyles.optionBoxActive
                                    textStyling = [idStyles.optionText, {color:'white'}]
                                }

                                return (
                                    <TouchableOpacity key={i} style={styling} onPress={()=>{
                                        if (amounts == amount) {
                                            setAmounts(undefined)
                                        } else {
                                            setAmounts(amount)
                                        }
                                    }}>
                                        <Text style={textStyling}>{amount}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
                <View>
                    <Button 
                        text='Find matching birds'
                        big={true}
                        action={()=>{
                            let obj = {
                                colors, sizes, locations, amounts
                            }
                            props.update(obj, true)
                        }}
                    />
                </View>
            </View>
        </ScrollView>
    )
}

const idStyles = StyleSheet.create({
    container:{
        flex:1,
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
    },
    icon:{
        resizeMode:'contain',
        height:50,width:50,
    },
    optionBlock:{
        width:'100%'
    },
    splitter:{
        borderTopWidth:2,
        borderColor:'#8ea604',
        width:'90%',
        // marginHorizontal:16,
        marginVertical:4
    },
    optionTitle:{
        fontSize:20,
        color:'black',
        textAlign:'center'
    },
    optionChoices:{
        // borderWidth:1,
        // borderColor:'red',
        display:'flex',
        flexDirection:'row',
        flexWrap:'wrap',
        padding:8,
        justifyContent:'space-evenly'
    },
    colorOption:{
        width:40,
        height:25,
        borderWidth:1,
        borderColor:'black',
        borderRadius:4,
        marginHorizontal:10,
        marginVertical:5
    },
    colorOptionActive:{
        width:40,
        height:40,
        borderWidth:2,
        borderColor:'black',
        borderRadius:4,
        marginHorizontal:10,
        marginVertical:5
    },
    optionBox:{
        borderWidth:1,
        borderRadius:4,
        backgroundColor:'white',
        marginHorizontal:10,
        marginVertical:5,
        paddingHorizontal:8,
        paddingVertical:2
    },
    optionBoxActive:{
        borderWidth:1,
        borderRadius:4,
        borderColor:'#8ea604',
        backgroundColor:'#8ea604',
        marginHorizontal:10,
        marginVertical:5,
        paddingHorizontal:8,
        paddingVertical:2
    },
    optionText:{
        fontSize:16,
        color:'black',
        textAlign:'center'
    }
    
})

class ListSection extends Component{
    constructor(props){
        super(props)
        this.state={
            mounted:false
        }
        this.renderItem = this.renderItem.bind(this)
        this.navigateToSpecies = this.navigateToSpecies.bind(this)
    }

    componentDidMount(){
        this.setState({mounted:true})
    }

    renderItem({item}){
        if (this.state.mounted){
            return (
                <ListItem item={item} updateCount={this.props.updateCount} navigate={this.navigateToSpecies}/>
            )
        }
    }

    navigateToSpecies(data){
        this.props.navigate(data)
    }

    render(){
        let data = this.props.getDisplayData()
        return (
            <View style={{flex:1}}>
                <Text style={{textAlign:'center', color:'grey', fontSize:16}}>Showing {data.length}</Text>
                <FlatList 
                    data={data}
                    keyExtractor={item => item.index}
                    renderItem={this.renderItem}
                    style={styles.flatList}
                />
            </View>
        )
    }
}

class ListItem extends PureComponent {
    constructor(props){
        super(props)
        this.state = {
            imageURL:img[this.props.item.code + '_10'],
            itemCount:this.props.item.count.toString(),
            description:this.props.item.textDescription
        }
    }

    render(){
        return(
            <View style={listStyles.container}>
                <View style={listStyles.left}>
                    <TouchableOpacity onPress={()=>{
                        this.props.navigate(this.props.item)
                    }}>
                        <Text style={listStyles.title}>{this.props.item.name}</Text>
                    </TouchableOpacity>
                    <View style={listStyles.countSection}>
                        <Button 
                        text='- 1'
                        color='red'
                        action={()=>{
                            let cnt = Number(this.state.itemCount) - 1
                            if (cnt >= 0) {
                                this.setState({itemCount:cnt.toString()})
                                this.props.updateCount(this.props.item.index, -1)
                            }
                        }}
                        />
                        <TextInput 
                            style={listStyles.input}
                            value={this.state.itemCount}
                            keyboardType='number-pad'
                            onChangeText={text=>{
                                let cnt = Number(text)
                                if (isNaN(cnt)) {
                                    cnt = 0
                                }
                                if (text > 999) cnt = 999
                                if (text == '' || text < 0) cnt = 0
                                this.setState({itemCount:cnt.toString()})
                                this.props.updateCount(this.props.item.index, Number(cnt), true)
                            }}
                            placeholderTextColor='grey'
                            placeholder='0'
                        />
                        <Button 
                        text='+ 1'
                        big={true}
                        action={()=>{
                            let cnt = Number(this.state.itemCount) + 1
                            if (cnt < 1000) {
                                this.setState({itemCount:cnt.toString()})
                                this.props.updateCount(this.props.item.index, 1)
                            }
                        }}
                        />
                    </View>
                </View>
                <TouchableOpacity style={listStyles.right} onPress={()=>{
                    this.props.navigate(this.props.item)
                }}>
                    <Image 
                        style={listStyles.img}
                        source={this.state.imageURL}
                    />
                </TouchableOpacity>
                
            </View>
        )
    }
}

const listStyles = StyleSheet.create({
    container:{
        // borderTopWidth:1,
        // borderRightWidth:1,
        // borderBottomWidth:1,
        // borderColor:'rgb(200,200,200)',
        borderTopRightRadius:8,
        borderBottomRightRadius:8,
        overflow:'hidden',
        marginBottom:8,
        marginRight:8,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:4,
        backgroundColor:'white'
    },
    left:{
        flex:1
    },
    right:{},
    img:{
        resizeMode:'contain',
        height:100,
        aspectRatio:1
    },
    title:{
        fontSize:18,
        color:'black',
    },
    countSection:{
        flex:1,
        display:'flex',
        alignItems:'center',
        justifyContent:'space-evenly',
        flexDirection:'row'
    },
    input:{
        color:'black',
        fontSize:22,
        borderWidth:1,
        borderColor:'rgb(230,230,230)',
        borderRadius:8,
        textAlign:'center',
        textDecorationLine:'underline',
        paddingHorizontal:10,
        margin:2,
        backgroundColor:'white',
    }
})
