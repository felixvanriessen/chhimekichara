import React, {useState, useEffect, useRef} from 'react'
import { SafeAreaView, StyleSheet, Image, Text, View, TouchableOpacity, ScrollView, FlatList, TextInput } from 'react-native'

import { useNavigation } from '@react-navigation/core'


import birdData from '../../jsondata/birdData.json'
import img from '../../images/imageindex'

import Button from '../components/Button'




const Seeallbirds  = () => {
    const [speciesData, setSpeciesData] = useState(birdData.sort((a, b) => {
        return Number(a.order) - Number(b.order)
    }))

    const [searchInput, setSearchInput] = useState('')

    const txtIn = useRef(null)

    function searchFilter(input, array){
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

    function renderTopSection(){
        return (
            <View style={styles.topSection}>
                <TextInput 
                    ref={txtIn}
                    style={styles.textInput}
                    value={searchInput}
                    placeholder='Search'
                    placeholderTextColor='grey'
                    onChangeText={text=>{
                        setSearchInput(text)
                    }}
                />
                {
                    searchInput != '' &&
                    <Button 
                        text='Clear Search'
                        action={()=>{
                            setSearchInput('')
                            txtIn.current.blur()
                        }}
                        color='red'
                    />
                }
            </View>
        )
    }

    function renderList(){
        let dataArray = []
        if (searchInput == '') dataArray = speciesData
        else {
            dataArray = searchFilter(searchInput, speciesData)
        }

        if (dataArray.length == 0) {
            return (
                <View style={{width:'100%', marginVertical:20}}>
                    <Text style={{fontSize:20, color:'black', textAlign:'center'}}>No birds found</Text>
                </View>
            )
        }

        return (
            <FlatList 
                style={{flex:1, paddingHorizontal:10}}
                data={dataArray}
                keyExtractor={item => item.code}
                renderItem={renderItem}
            />
        )
    }

    function renderItem({item}){
        return (
            <ListItem 
                bird={item}
            />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderTopSection()}
            {renderList()}
        </SafeAreaView>
    )
}

export default Seeallbirds;

const styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        flex:1
    },    
    topSection:{
        display:'flex',
        alignItems:'center',
        paddingVertical:5,
    },
    textInput:{
        backgroundColor:'white',
        borderRadius:20,
        borderColor:'grey',
        borderWidth:2,
        marginHorizontal:10,
        paddingHorizontal:20,
        paddingVertical:5,
        fontSize:20,
        textAlign:'center',
        color:'black',
        width:'80%'
    },
})

const ListItem = (props) => {
    const imgUrl = img[props.bird.code + '_10']
    const navigation = useNavigation()
    return (
        <TouchableOpacity style={listStyles.containerView} onPress={()=>{
            navigation.navigate('SpeciesScreen', {data:props.bird})
        }}>
            <View style={listStyles.textContainer}>
                <Text style={listStyles.text}>{props.bird.name}</Text>
            </View>
            <Image source={imgUrl} style={listStyles.img}/>
        </TouchableOpacity>
    )
}

const listStyles = StyleSheet.create({
    containerView:{
        backgroundColor:'white',
        marginVertical:5,
        borderRadius:10,
        padding:5,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderColor:'#8ea604',
        borderWidth:2
    },
    img:{
        resizeMode:'contain',
        height:100,
        width:100
    },
    textContainer:{
        flex:1
    },
    text:{
        fontSize:20,
        color:'black',
        textAlign:'center'
    }
})