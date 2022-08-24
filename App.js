import 'react-native-gesture-handler'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Home from './screens/Home'
// import Counting from './screens/Counting'
import CountingScreen from './screens/CountingScreenNEW'
import More from './screens/More'

import CountingLists from './screens/CountingLists'

import SpeciesScreen from './screens/SpeciesScreen'
import ImageViewer from './screens/ImageViewer'

import Announcements from './screens/Announcements'
import Seeallbirds from './screens/secondary_screens/Seeallbirds'
import Howtouse from './screens/secondary_screens/Howtouse'
import Websitelinks from './screens/secondary_screens/Websitelinks'
import AboutCC from './screens/secondary_screens/AboutCC'
import Credits from './screens/secondary_screens/Credits'

const Stack = createStackNavigator()

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={Home} options={{headerShown:false}}/>
        <Stack.Screen name='CountingScreen' component={CountingScreen} options={{headerTitle:''}}/>
        <Stack.Screen name='CountingLists' component={CountingLists} options={{headerTitle:''}}/>

        <Stack.Screen name='More' component={More} options={{headerTitle:''}}/>
        <Stack.Screen name='SpeciesScreen' component={SpeciesScreen} options={({ route }) => ({ title: route.params.data.name })}/>
        <Stack.Screen name='ImageViewer' component={ImageViewer} options={({ route }) => ({ title: route.params.name })}/>



        <Stack.Screen name='Announcements' component={Announcements} options={{headerTitle:''}}/>
        <Stack.Screen name='Seeallbirds' component={Seeallbirds} options={{headerTitle:''}}/>
        <Stack.Screen name='Howtouse' component={Howtouse} options={{headerTitle:''}}/>
        <Stack.Screen name='Websitelinks' component={Websitelinks} options={{headerTitle:''}}/>
        <Stack.Screen name='AboutCC' component={AboutCC} options={{headerTitle:'About'}}/>
        <Stack.Screen name='Credits' component={Credits} options={{headerTitle:'Credits'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default App;





// import HomeScreen from './screens/HomeScreen'

// import CountingScreen from './screens/CountingScreen'
// import SpeciesScreen from './screens/SpeciesScreen'
// import ImageViewer from './screens/ImageViewer'

// import CountHistory2 from './screens/CountHistoryScreen2'

// import AboutScreen from './screens/AboutScreen'
// import AboutCC from './screens/AboutCC'
// import LinksPage from './screens/WebsiteLinks'
// import CreditsPage from './screens/CreditsScreen'

// import AllBirds from './screens/AllBirds'

// import Announcements from './screens/Announcements'

// import HowToScreen from './screens/HowToScreen'


// <Stack.Screen name='Home' component={HomeScreen} options={{headerShown:false}}/>
// <Stack.Screen name='CountingScreen' component={CountingScreen} options={{headerTitle:''}}/>
// <Stack.Screen name='SpeciesScreen' component={SpeciesScreen} options={({ route }) => ({ title: route.params.data.name })}/>
// <Stack.Screen name='ImageViewer' component={ImageViewer} options={({ route }) => ({ title: route.params.name })}/>
// <Stack.Screen name='CountHistory' component={CountHistory2} options={{headerTitle:'Count History'}}/>
// <Stack.Screen name='AboutScreen' component={AboutScreen} options={{headerTitle:'More Information'}}/>
// <Stack.Screen name='AboutCC' component={AboutCC} options={{headerTitle:'About'}}/>
// <Stack.Screen name='LinksPage' component={LinksPage} options={{headerTitle:'Links'}}/>
// <Stack.Screen name='CreditsPage' component={CreditsPage} options={{headerTitle:'Credits'}}/>
// <Stack.Screen name='AllBirds' component={AllBirds} options={{headerTitle:'All Birds'}}/>
// <Stack.Screen name='Announcements' component={Announcements} options={{headerTitle:'Announcements'}}/>
// <Stack.Screen name='HowTo' component={HowToScreen} options={{headerTitle:'How To'}}/>
