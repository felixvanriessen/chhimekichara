import React, {PureComponent, Component, useEffect} from 'react'
import {View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Platform} from 'react-native'
import Animated, { withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

import img from '../../images/imageindex'
import Button from './Button'

class ListItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            imageURL:img[this.props.bird.code + '_10'],
            itemCount:this.props.bird.count.toString(),
            active:false
         }
    }
    
    componentDidUpdate(){
        if (this.state.active && this.props.activeItem !== this.props.bird.code) {
            this.setState({active:false})
        }
    }

    shouldComponentUpdate(nextProps){
        if (this.state.active || nextProps.activeItem == this.props.bird.code) {
            return true
        }
        return false
    }

    render(){
        return (
            <TouchableOpacity style={styles.item} onPress={()=>{
                this.setState({active:true})
                this.props.changeActiveItem(this.props.bird.code)
                this.props.scrollIndex(this.props.bird.index)
            }}>

                <View style={styles.left}>
                    <Text style={styles.title}>{this.props.bird.name}</Text>
                    <CounterSection count={this.state.itemCount} show={this.state.active} />
                </View>
                <View style={{flex:0.1}}></View>
                {
                    this.state.active ? 
                    <TouchableOpacity style={styles.right}>
                        <Image style={styles.img} source={this.state.imageURL} />
                    </TouchableOpacity>
                    :
                    <View style={styles.right}>
                        <Image style={styles.img} source={this.state.imageURL}/>
                    </View>
                }
            </TouchableOpacity>
        )

    }
}

const CounterSection = (props) => {
    const y = useSharedValue(0)

    useEffect(()=>{
        if (props.show) {
            y.value = withSpring(150, {damping:20, stiffness:200})
        } else {
            y.value = withSpring(0, {overshootClamping:true})
        }
    }, [props.show])

    const animatedStyle = useAnimatedStyle(()=>{
        return {
            height:y.value
        }
    })


    return (
        <Animated.View style={[styles.counterSection, animatedStyle, {overflow:'hidden'}]}>
            <View style={styles.counterSectionInner}>
                <TouchableOpacity style={[styles.counterBtn, {backgroundColor:'#DB5461'}]}>
                    <Text style={styles.counterBtnText}>-1</Text>
                </TouchableOpacity>
                <TextInput 
                    style={styles.countInput}
                    value={props.count}
                />
                <TouchableOpacity style={[styles.counterBtn, {backgroundColor:'#8ea604'}]}>
                    <Text style={styles.counterBtnText}>+1</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.counterSectionInner, {flex:0, paddingVertical:4}]}>
                <Button text='Description' marginV={0} color='neutral'/>
            </View>
        </Animated.View>
    )
}


const styles = StyleSheet.create({
    item:{
        borderWidth:3,
        borderRightWidth:0,
        borderColor:'rgb(220,220,220)',
        marginTop:10,
        marginLeft:10,
        borderBottomLeftRadius:10,
        borderTopLeftRadius:10,
        overflow:'hidden',
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between'
    },
    left:{
        flex:1
    },
    right:{
        flex:0.6
    },
    title:{
        color:'black',
        fontSize:16,
        padding:6
    },
    img:{
        resizeMode:'contain',
        width: null,
        height: null,
        flex:1
    },
    counterSection:{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        flex:1
    },
    counterSectionInner:{
        flex:1,
        width:'100%',
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-evenly',
        alignItems:'center',
    },
    counterBtn:{
        paddingVertical:6,
        paddingHorizontal:16,
        borderRadius:4
    },
    counterBtnText:{
        fontSize:18,
        color:'white',
        textAlign:'center'
    },
    countInput:{
        color:'black',
        textAlign:'center',
        fontSize:24,
        padding:0,
    }
})

export default ListItem;