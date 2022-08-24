import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, Platform, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/core'

import Asyncstorage from '@react-native-async-storage/async-storage'
import { getUniqueId } from 'react-native-device-info'
import Geolocation from '@react-native-community/geolocation'

import locationData from '../jsondata/locationData.json'

import Button from "./components/Button";

import { useIsFocused } from "@react-navigation/native";


const Home = () => {
    const [userExists, setUserExists] = useState(false)
    const [userLocation, setUserLocation] = useState(undefined)
    const [chooseNewLocation, setChooseNewLocation] = useState(false)

    const [autoSave, setAutoSave] = useState(false)

    const isFocused = useIsFocused()

    useEffect(()=>{
        checkUserExists()
        if (Platform.OS == 'ios') {
            getLocationPermission()
        }
    }, [])

    useEffect(()=>{
        if (isFocused) checkAutoSave()
    }, [isFocused])

    function getLocationPermission(){
        Geolocation.requestAuthorization()
     }

    const checkUserExists = async () => {
        let user = await Asyncstorage.getItem('@chhimekichara_user')
        if (user == null) {
            //user does not exist yet
            let userObject = {
                location:undefined
            }
            let userJSON = JSON.stringify(userObject)
            await Asyncstorage.setItem('@chhimekichara_user', userJSON).then(()=>{
                setUserExists(true)
                setChooseNewLocation(true)
            })
        } else {
            //user exists
            user = JSON.parse(user)
            setUserExists(true)
            if (user.location) {
                setUserLocation(user.location)
                setChooseNewLocation(false)
            }
        }
    }

    const saveLocation = async (district) => {
        let userObject = {
            location:district
        }
        let userJSON = JSON.stringify(userObject)
        await Asyncstorage.setItem('@chhimekichara_user', userJSON).then(()=>{
            checkUserExists()
        })
    }

    const checkAutoSave = async() => {
        let autoSaveJSON = await Asyncstorage.getItem('@autosave_data')
        if (autoSaveJSON != null) {
            setAutoSave(true)
        } else {
            setAutoSave(false)
        }
    }

    const deleteAutoSave = async () => {
        await Asyncstorage.removeItem('@autosave_data')
        checkAutoSave()
    }

    return (
        <SafeAreaView style={styles.container}>
            {!userExists && <LoadingScreen/>}
            {
                chooseNewLocation &&
                <DistrictSelector save={saveLocation} existingLocation={userLocation} cancel={()=>{
                    setChooseNewLocation(false)
                }}/>
            }
            {
                !chooseNewLocation &&
                <LogoSection />
            }
            {
                !chooseNewLocation &&
                <MainSection autoSave={autoSave} deleteAutosave={deleteAutoSave}/>
            }
            {
                !chooseNewLocation &&
                <SponsorSection />
            }
            {
                !chooseNewLocation && 
                <SafeAreaView style={styles.locationSection}>
                    <TouchableOpacity style={styles.locationBtn} onPress={()=>{
                        setChooseNewLocation(true)
                    }}>
                        <Text style={styles.locationBtnText}>{userLocation}</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            }
        </SafeAreaView>
    )
}

export default Home;

const LogoSection = () => {
    return (
        <View style={styles.logoContainer}>
            <Image style={styles.logoImage} source={require('../images/mainlogo.png')}/>
        </View>
    )
}

const SponsorSection = () => {
    return (
        <View style={styles.sponsorSection}>
            <Image style={styles.sponsorImage} source={require('../images/zeiss_logo.jpg')} />
            <Image style={styles.sponsorImage} source={require('../images/bcn_logo.png')} />
        </View>
    )
}

const MainSection = (props) => {
    const navigation = useNavigation()
    const [showOptions, setShowOptions] = useState(false)

    return (
        <View style={styles.mainSection}>
            {
                showOptions && props.autoSave &&
                <View style={styles.btnContainer}>
                    <Button 
                        text='New Count'
                        big={true}
                        color='neutral'
                        action={async ()=>{
                            setShowOptions(false)
                            props.deleteAutosave().then(()=>{
                                navigation.navigate('CountingScreen')
                            })
                        }}
                    />
                    <Button 
                        text='Continue Previous Count'
                        big={true}
                        color='neutral'
                        action={()=>{
                            setShowOptions(false)
                            navigation.navigate('CountingScreen')
                        }}
                    />
                </View>
            }
            {
                !showOptions && !props.autoSave &&
                <Button 
                    text='Start Counting'
                    big={true}
                    action={()=>{
                        setShowOptions(false)
                        navigation.navigate('CountingScreen')
                    }}
                />
            }
            {
                !showOptions && props.autoSave &&
                <Button 
                    text='Start Counting'
                    big={true}
                    action={()=>{
                        setShowOptions(true)
                    }}
                />
            }
            <Button 
                text='My Counting Lists'
                big={true}
                action={()=>{
                    setShowOptions(false)
                    navigation.navigate('CountingLists')
                }}
            />
            <Button 
                text='More'
                big={true}
                action={()=>{
                    setShowOptions(false)
                    navigation.navigate('More')
                }}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        flex:1
    },
    btnContainer:{
    },
    text:{
        color:'black',
        fontSize:16
    },
    logoContainer:{
        height:'30%',
        width:'100%',
        // backgroundColor:'#E0E2DB'
    },
    logoImage:{
        height:'100%',
        width:'100%',
        resizeMode:'contain'
    },
    sponsorSection:{
        height:'20%',
        width:'100%',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        // position:'absolute',
        // bottom:0
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    sponsorImage:{
        height:'90%',
        width:'40%',
        resizeMode:'contain',
    },
    mainSection:{
        // borderWidth:1,
        display:'flex',
        alignItems:'center',
        justifyContent:'space-evenly',
        flex:1
    },
    locationSection:{
        display:'flex',
        alignItems:'flex-end'
    },
    locationBtn:{
        backgroundColor:'#00A5CF',
        paddingHorizontal:14,
        paddingVertical:4,
        borderTopLeftRadius:6
    },
    locationBtnText:{
        fontSize:18,
        textAlign:'center',
        color:'white'
    }
})


const LoadingScreen = () => {
    return (
        <View style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
            <Text style={{color:'black', fontSize:20}}>Loading...</Text>
        </View>
    )
}

const DistrictSelector = (props) => {
    const [prov, setProv] = useState(undefined)
    const [dis, setDis] = useState(undefined)
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [selectedProv, setSelectedProv] = useState(undefined)
    const [selectedDistrict, setSelectedDistrict] = useState(undefined)

    const [btnLayout, setBtnLayout] = useState({justifyContent:'space-between'})
    const [btnDisable, setBtnDisable] = useState(true)

    useEffect(()=>{
        getProvinceList(locationData)
        if (props.existingLocation == undefined) {
            setBtnLayout({justifyContent:'flex-end'})
        }
    }, [])

    const getProvinceList = data => {
        let arr = []
        for (let p in data) {
            arr.push(p)
        }
        setProvinces(arr)
    }

    const getDistrictList = province => {
        let arr = locationData[province]
        setDistricts(arr)
    }

    return (
        <View style={styles2.container}>
            {
                prov == undefined &&
                <Text style={styles2.title}>Please select your current province.</Text>
            }
            {
                prov != undefined &&
                <Text style={styles2.title}>Please select your current district.</Text>
            }
            
            <View style={styles2.selectorContainer}>
                {
                    prov == undefined && 
                    <ScrollView style={styles2.scroll} 
                    contentContainerStyle={{
                        paddingTop: 20,
                        paddingBottom: 0,
                      }}
                    >
                        {
                            provinces.map(el => {
                                let text = el.split('_').join(' ')
                                let styling = styles2.option
                                let textStyling = styles2.optionText
                                if (selectedProv == el) {
                                    styling = [styles2.option, {backgroundColor:'#8ea604'}]
                                    textStyling = [styles2.optionText, {color:'white'}]
                                }

                                return (
                                    <TouchableOpacity style={styling} key={el} onPress={()=>{
                                        setSelectedProv(el)
                                        setBtnDisable(false)
                                    }}>
                                        <Text style={textStyling}>{text}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                }
                {
                    dis == undefined && prov != undefined &&
                    <ScrollView style={styles2.scroll}
                    contentContainerStyle={{
                        paddingTop: 20,
                        paddingBottom: 0,
                      }}
                    >
                        {
                            districts.map(el => {
                                let styling = styles2.option
                                let textStyling = styles2.optionText
                                if (selectedDistrict == el) {
                                    styling = [styles2.option, {backgroundColor:'#8ea604'}]
                                    textStyling = [styles2.optionText, {color:'white'}]
                                }
                                return (
                                    <TouchableOpacity key={el} style={styling} onPress={()=>{
                                        setSelectedDistrict(el)
                                        setBtnDisable(false)
                                    }}>
                                        <Text style={textStyling}Text>{el}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                }
            </View>
            
            <View style={[styles2.btnContainer, btnLayout]}>
                {
                    prov == undefined && props.existingLocation != undefined &&
                    <Button 
                    text="Cancel"
                    color='red'
                    action={()=>{
                        props.cancel()
                    }}
                    big={true}
                    />
                }
                {
                    prov !== undefined &&
                    <Button 
                        text="Back"
                        color='red'
                        big={true}
                        action={()=>{
                            setProv(undefined)
                            setBtnDisable(false)
                            if (props.existingLocation != undefined) {
                                setBtnLayout({justifyContent:'space-between'})
                            } else setBtnLayout({justifyContent:'flex-end'})
                        }}
                    />
                }
                <Button 
                text='Confirm'
                disabled={btnDisable}
                big={true}
                action={()=>{
                    if (prov == undefined) {
                        getDistrictList(selectedProv)
                        setProv(selectedProv)
                        setBtnLayout({justifyContent:'space-between'})
                        setBtnDisable(true)
                        setSelectedDistrict(undefined)
                    } else {
                        props.save(selectedDistrict)
                    }
                }}
                />
            </View>
        </View>
    )
}

const styles2 = StyleSheet.create({
    container: {
        flex:1,
        display:'flex',

    },
    title:{
        color:'black',
        fontSize:20,
        textAlign:'center',
        paddingVertical:20
    },
    text:{
        color:'black',
        fontSize:16
    },

    selectorContainer:{
        flex:1,
        backgroundColor:'#E0E2DB'
    },
    option:{
        backgroundColor:'white',
        marginBottom:20, 
        marginHorizontal:20,
        paddingVertical:10,
        paddingHorizontal:10,
        borderRadius:4
    },
    optionText:{
        color:'black',
        fontSize:18,
        textAlign:'center'
    },

    btnContainer:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
    },

    btn:{
        backgroundColor:'#8ea604',
        paddingVertical:5,
        paddingHorizontal:20,
        borderRadius:4,
        margin:20
    },
    btnText:{
        color:'white',
        fontSize:20
    }
})
