import React, {useState, useEffect, useRef} from 'react'
import { StyleSheet, SafeAreaView, View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import Sound from 'react-native-sound';

import img from '../images/imageindex.js'

import Button from './components/Button.js';

const windowWidth = Dimensions.get('window').width

Sound.setCategory('Playback')

const SpeciesScreen = ({route}) => {
   const nav = useNavigation()

   const [data, setData] = useState({...route.params.data})
   
   const [imageIndex, setImageIndex] = useState(1)

   const [starsAmount, setStarsAmount] = useState(0)
   const [likelihoodTxt, setLikelihoodTxt] = useState('')

   const [soundLoaded, setSoundLoaded] = useState(false)

   const [imageBundle, setImageBundle] = useState([])

   useEffect(() => {
      checkLikelihood()
      checkSound()
      if (imageBundle.length == 0) {
         bundleImages()
      }

   }, [imageIndex])

   function bundleImages() {
      let images = []
      let imagecount = 9

      for (let n = 0; n < imagecount; n++) {
         let imgnumber = n + 1
         let imgtext = ''
         data.imagetext.forEach(el=>{
            let imgno = el.img.split('_')[1]
            if (imgno == imgnumber) imgtext = el.text
         })
         let image = img[data.code + `_${imgnumber}`]
         if (image !== undefined) {
            let imageItem = [image, imgtext]
            images.push(imageItem)
         }
      }
      setImageBundle(images)
   }

   function checkSound(){
      let soundExists = new Sound(`${data.code}.mp3`, Sound.MAIN_BUNDLE, err => {
         if (err) {
            console.log(err)
            setSoundLoaded(false)
         }
         setSoundLoaded(true)
         soundExists.release()
      })
   }

   function playSound(){
      const birdCall = new Sound(`${data.code}.mp3`, Sound.MAIN_BUNDLE, err=>{
         if (err) {
            console.log(err)
         }
         birdCall.setVolume(1)
         birdCall.play(success=>{
            if (!success) console.log('error')
            birdCall.release()
         })
      })
   }

   function checkLikelihood(){
      let str = data.description.likelihood
      str = str.split(' ')
      let stars = str[0].trim()
      let text = str.slice(1).join(' ')
      setLikelihoodTxt(text)
      if (stars.length == 1) setStarsAmount([stars])
      else if (stars.length > 1) {
         setStarsAmount(stars.split(''))
      }
   }

   function renderDescription(){
      if (data){
         return (
            <View style={styles.descriptions}>
            <ScrollView>
               <View style={styles.descriptionBlockMain}>
                  <Text style={styles.textA}>Summer: {data.description.summer}</Text>
                  <Text style={styles.textA}>Winter: {data.description.winter}</Text>
                  <View style={styles.iconContainer}>
                  <Text style={styles.textA}>Likelihood:</Text>
                  {
                     starsAmount.length > 0 && 
                     starsAmount.map((el, i)=>{
                        return (
                           <Image key={i} source={require('../images/star_icon.png')} style={styles.icon}/>
                        )
                     })
                  }
                  </View>
                  <Text style={styles.textA}>{likelihoodTxt}</Text>
                  <Text style={styles.textA}>Size: {data.description.size}</Text>
               </View>

               <View style={[styles.descriptionBlock]}>
                  <Text style={styles.textHeader}>Looks: </Text>
                  <Text style={styles.textBlock}>{data.description.looks}</Text>
               </View>
                  
               <View style={styles.descriptionBlock}>
                  <Text style={styles.textHeader}>Habitat: </Text>
                  <Text style={styles.textBlock}>{data.description.habitat}</Text>   
               </View>

               <View style={[styles.descriptionBlock]}>
                  <Text style={styles.textHeader}>Habits: </Text>
                  <Text style={styles.textBlock}>{data.description.behaviour}</Text>   
               </View>

               <View style={styles.descriptionBlock}>
                  <Text style={styles.textHeader}>Voice: </Text>
                  <Text style={styles.textBlock}>{data.description.voice}</Text>   
               </View>

               <View style={styles.descriptionBlock}>
                  <Text style={styles.textHeader}>Advice: </Text>
                  <Text style={styles.textBlock}>{data.description.advice}</Text>   
               </View>
               {
                  data.description.similar != '' &&
                  (<View style={[styles.descriptionBlock]}>
                     <Text style={styles.textHeader}>Similar Species:</Text>
                     <Text style={styles.textBlock}>{data.description.similar}</Text>   
                  </View>)
               }

            </ScrollView>
            </View>
         )
      }
   }

   const scroller = useRef(null);

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.imgViewer}>
            <ScrollView  decelerationRate='fast' horizontal pagingEnabled={true} showsHorizontalScrollIndicator={true} ref={scroller} onMomentumScrollEnd={(e)=>{
               let pos = Math.round(e.nativeEvent.contentOffset.x / windowWidth)
               setImageIndex(pos + 1)
            }}>
               {
                  imageBundle.length > 0 && imageBundle.map((el, i) => {
                     return (
                        <View key={i}>
                           <TouchableOpacity style={[styles.img, {width:windowWidth}]} onPress={()=>{
                              nav.navigate('ImageViewer', {img:imageBundle, name:data.name, index:imageIndex})
                           }}>
                              <Image source={el[0]} style={styles.image}/>
                           </TouchableOpacity>
                           <Text style={styles.imgDetails}>{el[1]}</Text>
                        </View>
                     )
                  })
               }
            </ScrollView>

            <View style={styles.imgCtrl}>
               <Button 
                  text='Prev Image'
                  color='neutral'
                  action={()=>{
                     let i = imageIndex - 1
                     scroller.current.scrollTo({x:windowWidth * (i - 1)})
                     if (i <= 0) {
                        i = 1
                     }
                     setImageIndex(i)
                  }}
               />
               {
                  soundLoaded && 
                  <TouchableOpacity style={[styles.imgCtrlBtn, {borderRadius:15}]} onPress={()=>{
                     playSound()
                  }}>
                     <Image style={styles.soundIcon} source={require('../images/sound_icon.png')} />
                  </TouchableOpacity>
               }
               <Button 
                  text='Next Image'
                  color='neutral'
                  action={()=>{
                     let i = imageIndex
                     scroller.current.scrollTo({x:windowWidth * i})
                     if (i > imageBundle.length - 1) {
                        i = imageBundle.length - 1
                     }
                     setImageIndex(i + 1)
                  }}
               />
            </View>
         </View>
         {renderDescription()}
      </SafeAreaView>
   )
}

export default SpeciesScreen

const styles = StyleSheet.create({
   container:{
      flex:1,
      backgroundColor:'white'
   },
   title:{
      fontSize:24,
      color:'black',
      textAlign:'center',
      margin:10
   },
   imgViewer:{
      flex:0.5,
      paddingBottom:4
   },
   descriptions:{
      flex:0.5,
      paddingVertical:10,
      width:'100%',
      backgroundColor:'rgb(220,220,220)'
   },
   text:{
      fontSize:18,
      color:'black',
      backgroundColor:'#aed1a7',
      paddingHorizontal:10
   },
   textA:{
      fontSize:18,
      color:'black',
      paddingHorizontal:10
   },
   descriptionBlockMain:{
      backgroundColor:'white',
      padding:5,
      borderRadius:5,
      width:'100%',
   },
   descriptionBlock:{
      display:'flex',
      alignItems:'flex-start',
      // paddingHorizontal:10,
      // paddingVertical:5,
      width:'100%',
      marginTop:6,
      backgroundColor:'white'
   },
   textHeader:{
      fontSize:20,
      color:'black',
      paddingHorizontal:10,
      backgroundColor:'white',
      paddingTop:5
   },
   textBlock:{
      fontSize:18, 
      color:"rgb(100,100,100)",
      flex:1,
      paddingHorizontal:10,
      width:'100%',
      backgroundColor:'white',
      paddingVertical:5
   },
   img:{
      flex:1
   },
   imgCtrl:{
      display:'flex',
      flexDirection:'row',
      justifyContent:'space-evenly',
      alignItems:'center'
   },
   image:{
      resizeMode:'contain',
      width:'100%',
      height:'100%'
   },
   imgCtrlBtn:{
      backgroundColor:'#00A5CF',
      paddingHorizontal:10,
      paddingVertical:5,
      borderRadius:5
   },
   imgBtnText:{
      color:'white',
      fontSize:20,
      textAlign:'center'
   },
   imgDetails:{
      color:'black',
      fontSize:16,
      textAlign:'center',
      marginVertical:5
   },
   icon:{
      resizeMode:'contain',
      height:'100%',
      width:20
   },
   iconContainer:{
      display:'flex',
      flexDirection:'row'
   },
   soundIcon:{
      resizeMode:'contain',
      height:40,
      width:40
   }
})