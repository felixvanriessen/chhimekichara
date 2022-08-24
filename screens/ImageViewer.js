import React, {useState, useRef, useEffect} from 'react'
import { StyleSheet, SafeAreaView, View, Image, ScrollView, Dimensions } from 'react-native'

const windowWidth = Dimensions.get('window').width

const ImageViewer = ({route}) => {
   const [images, setImages] = useState(route.params.img)
   const [imageIndex, setImageIndex] = useState(route.params.index)

   const scroller = useRef(null)

   useEffect(()=>{
      scroller.current.scrollTo({x:windowWidth * (imageIndex - 1)})
   }, [])

   return (
      <SafeAreaView style={styles.container}>
         <ScrollView
            decelerationRate='fast' horizontal pagingEnabled={true} showsHorizontalScrollIndicator={true} ref={scroller}
         >
            {
               images.map((el, i) => {
                  return (
                     <Image key={i} style={styles.image} source={el[0]}/>
                  )
               })
            }
         </ScrollView>
      </SafeAreaView>
   )
}


export default ImageViewer

const styles = StyleSheet.create({
   container:{
      flex:1,
      backgroundColor:'black'
   },
   image:{
      resizeMode:'contain',
      height:'100%',
      width:windowWidth
   }
})