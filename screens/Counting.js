import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity, Image, TextInput, FlatList, Alert, ScrollView } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import Geolocation from '@react-native-community/geolocation'
import firestore from '@react-native-firebase/firestore'
import { getUniqueId } from 'react-native-device-info'
import { useNavigation } from '@react-navigation/native'
import Animated, { withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'


import Button from './components/Button'

import birdData from '../jsondata/birdData.json'
import allBirdsList from '../jsondata/nepalBirdList.json'

import ListItem from './components/CountingListItem'
 
const Counting = (props) => {
    const [userDistrict, setUserDistrict] = useState(null)
    const [userCoords, setUserCoords] = useState(null)

    const [rawData, setRawData] = useState(null)
    const [displayData, setDisplayData] = useState(null)


    const [mode, setMode] = useState('default')
    const [listType, setListType] = useState('All')

    const [searchValue, setSearchValue] = useState('')

    const [unsavedData, setUnsavedData] = useState(false)

    useEffect(()=>{
        init()
    }, [])

    async function init(){
        let district = await getDistrict()
        let birdsData = birdData.filter(el => {
            if (district == undefined) return true
            if (el.locations.indexOf(district) != -1) return true
            return false
        }).sort((a, b) => {
            return Number(a.order) - Number(b.order)
        }).map((el, i) => {
            let obj = {...el, count:0, index:i}
            return obj
        })
        setRawData(birdsData)
        setDisplayData(birdsData)
    }

    async function getDistrict() {
        let userData = await AsyncStorage.getItem('@chhimekichara_user')
        if (userData != null) {
            let userObject = JSON.parse(userData)
            setUserDistrict(userObject.location)
            return userObject.location
        } else {
            setUserDistrict(undefined)
            return undefined
        }
    }



    return (
        <SafeAreaView style={styles.container}>
            <View style={{backgroundColor:'#DD7230', padding:1}}>
                <Text style={{textAlign:'center', color:'white', fontSize:10}}>Getting Location</Text>
            </View>
            <TopBar mode={mode} 
            searchAction={()=>{
                setMode('search')
            }}
            searchFunction={(e)=>{
                setSearchValue(e)
            }}
            helpAction={()=>{
                setMode('identify')
            }}
            cancelAction={()=>{
                setMode('default')
                setSearchValue('')
            }}
            searchValue={searchValue}
            />
            <ListChoice choice={listType} 
            action={(choice)=>{
                setListType(choice)
            }}
            mode={mode}
            />
            <ListSection data={displayData}/>
            <BottomBar canSave={unsavedData} />
        </SafeAreaView>
    )
}

const TopBarOLD = (props) => {
    if (props.mode === 'default') {
        return (
            <View style={styles.topBar}>
                <Button text='Help Identify' marginV={10} action={props.helpAction} color='neutral'/>
                <SearchButton mode={props.mode} action={props.searchAction}/>
            </View>
        )
    }
    if (props.mode == 'search') {
        return (
            <View style={styles.topBar}>
                <TouchableOpacity style={{backgroundColor:'#DB5461', paddingVertical:5, paddingHorizontal:10, margin:5, marginLeft:10, borderRadius:4}} onPress={props.cancelAction}>
                    <Text style={{color:'white', fontSize:16}}>Cancel</Text>
                </TouchableOpacity>
                <SearchButton mode={props.mode} action={props.searchFunction} value={props.searchValue}/>
            </View>
        )
    }
    if (props.mode == 'identify') {
        return (
            <View style={styles.topBar}>
                <Button text='Cancel Help' color='red' marginV={10} action={props.cancelAction}/>
            </View>
        )
    }
}

const TopBar = (props) => {
    if (props.mode == 'search') {
        return (
            <View style={styles.topBarRight}>

            </View>
        )
    }

    return (
        <ScrollView 
        horizontal={true} 
        scrollEnabled={false}
        style={styles.topBar}>
            <TouchableOpacity style={styles.iconView} onPress={()=>{
            }}>
                <Image style={styles.iconImg} source={require('../images/icons/addicon.png')} />
                <Text style={styles.iconText}>Add Bird</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconView} onPress={()=>{

            }}>
                <Image style={styles.iconImg} source={require('../images/icons/noteicon.png')} />
                <Text style={styles.iconText}>Add Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconView} onPress={()=>{

            }}>
                <Image style={styles.iconImg} source={require('../images/icons/identifyicon.png')} />
                <Text style={styles.iconText}>Help Identify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconView} onPress={()=>{

            }}>
                <Image style={styles.iconImg} source={require('../images/icons/searchicon.png')} />
                <Text style={styles.iconText}>Search</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const SearchButton = (props) => {
    if (props.mode == 'default') {
        return (
            <TouchableOpacity style={styles.searchBtn} onPress={props.action}>
                <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
        )
    }
    if (props.mode == 'search') {
        return (
            <TextInput
                style={[styles.searchBtn, styles.searchBtnText, {flex:1}]}
                value={props.searchValue}
                onChangeText={(text)=>{
                    props.action(text)
                }}
                placeholderTextColor='grey'
                placeholder='Search...'
                autoFocus={true}
            />
        )
    }
}

const BottomBar = props => {
    return (
        <View style={styles.bottomBar}>
            <Button text='Options' marginV={10} color='neutral' />
            <Button text='Save' marginV={10} disabled={!props.unsavedData}/>
        </View>
    )
}

const ListChoice = (props) => {
    let style1 = {}
    let style2 = {}
    let textStyle1 = {}
    let textStyle2 = {}
    if (props.choice == 'Counted') {
        style1 = {backgroundColor:'#8AA29E', borderBottomRightRadius:20}
        textStyle1 = {color:'white'}
        textStyle2 = {fontSize:14}
    } else {
        style2 = {backgroundColor:'#8AA29E', borderBottomLeftRadius:20}
        textStyle2 = {color:'white'}
        textStyle1 = {fontSize:14}
    }

    let text = 'All'
    if (props.mode == 'search') {
        text = 'Search Results'
    } 
    if (props.mode == 'identify') {
        text = 'Filtered Results'
    }

    return (
        <View style={styles.listChoiceContainer}>
            <TouchableOpacity style={[styles.listChoice, style1]} onPress={()=>{
                props.action('All')
            }}>
                <Text style={[styles.listChoiceText, textStyle1]}>{text}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.listChoice, style2]} onPress={()=>{
                props.action('Counted')
            }}>
                <Text style={[styles.listChoiceText, textStyle2]}>Counted</Text>
            </TouchableOpacity>
        </View>
    )
}

const ListSection = (props) => {
    const [activeItem, setActiveItem] = useState(null)
    const listRef = useRef()

    function changeActiveItem(n){
        setActiveItem(n)
    }

    function scrollTo(n){
        if (activeItem === null) {
            if (n > 1) {
                listRef.current.scrollToIndex({index:n - 2})
            } else {
                listRef.current.scrollToIndex({index:n})
            }
        }
    }

    if (props.data == undefined) return null
    return (
        <FlatList 
            ref={listRef}
            data={props.data}
            keyExtractor={item => item.index}
            renderItem={({item}) => <ListItem bird={item} activeItem={activeItem} changeActiveItem={changeActiveItem} scrollIndex={scrollTo}/>}
            style={styles.flatList}
            contentContainerStyle={{
                paddingBottom:40,
                paddingTop:0
            }}
            onScrollBeginDrag={(e)=>{
                setActiveItem(null)
            }}
        />
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white'
    },
    text:{
        color:'black',
        fontSize:14
    },
    topBar:{
        width:'100%'
    },
    iconView:{
        flex:1,
        display:'flex',
        alignItems:'center'
    },
    iconImg:{
        resizeMode:'contain',
        height:50
    },
    iconText:{
        color:'black',
        fontSize:12,
        textAlign:'center'
    },
    bottomBar:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-evenly'
    },
    listChoiceContainer:{
        display:'flex',
        flexDirection:'row',
        borderTopWidth:2,
        borderColor:'#8AA29E',
    },
    listChoice:{
        flex:1,
        paddingVertical:5
    },
    listChoiceText:{
        textAlign:'center',
        color:'black',
        fontSize:12
    },
    searchBtn:{
        paddingVertical:5,
        paddingHorizontal:20,
        borderRadius:20,
        margin:10,
        borderWidth:3,
        borderColor:'#8AA29E'
    },
    searchBtnText:{
        color:'grey',
        fontSize:14,
        textAlign:'center'
    },
    flatList:{
        paddingBottom:20
    }
})

export default Counting;