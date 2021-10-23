import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { createSharedElementStackNavigator, SharedElement } from 'react-navigation-shared-element'
import { PanGestureHandler, PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

type ScreenProps = {
  main: undefined;
  second: undefined;
}
declare global {
  namespace ReactNavigation {
    interface RootParamList extends ScreenProps {}
  }
}


const { Navigator, Screen } = createSharedElementStackNavigator();

const ImageUrl = 'https://images.stockfreeimages.com/176/sfixl/1761191.jpg'

const { height, width } = Dimensions.get('window');

const Main = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <SharedElement id="teste.teste">
        <TouchableOpacity onPress={() => navigation.navigate('second')} style={[styles.square, { overflow: 'hidden'}]}>
          <Image resizeMode="cover" source={{ uri:  ImageUrl }} style={{  flex: 1 }}  />
        </TouchableOpacity>
      </SharedElement>
    </View>
  )
}

const Second = () => {
  const navigation = useNavigation();

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const border = useSharedValue(0);
  const focal = useSharedValue({ x: 0, y: 0 });

  const translatePanX = useSharedValue(0)
  const translatePanY = useSharedValue(0)
  const scalePan = useSharedValue(1);

  const panHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translatePanX.value = event.translationX;
      translatePanY.value = event.translationY;
      scalePan.value = interpolate(event.translationY, [0, height], [1, 0.5], Extrapolate.CLAMP)
      border.value = interpolate(event.translationY, [0, height], [1, 200], Extrapolate.CLAMP)
    },
    onEnd: (event) => {
      if (event.translationY > (height * 0.1)) {
        runOnJS(navigation.goBack)();
      } else {
        translatePanX.value = withTiming(0)
        translatePanY.value = withSpring(0)
        scalePan.value = withTiming(1)
        border.value = withTiming(0);
      }
    }
  })

  const onGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive(event) {
      scale.value = interpolate(event.scale, [1, 100], [1, 100], Extrapolate.CLAMP);
      translateX.value = event.focalX;
      translateY.value = event.focalY;
      focal.value = {x: event.focalX, y: focal.value.y};
      focal.value = {x: focal.value.x, y: event.focalY};
    },
    onEnd() {
      scale.value = withTiming(1);
    }
  })

  const rStyle = useAnimatedStyle(() => {
    return { 
    transform: [
      { translateX: focal.value.x },
      { translateY: focal.value.y },
      { translateX: -width/2 },
      { translateY: -height/2 },
      { scale: scale.value },
      { translateX: -focal.value.x },
      { translateY: -focal.value.y },
      { translateX: width/2 },
      { translateY: height/2 },
    ],
    borderRadius: border.value
  }})

  const panStyle = useAnimatedStyle(() => ({ 
    transform: [
      { translateX: translatePanX.value },
      { translateY: translatePanY.value },
      { scale: scalePan.value },
    ],
  }))

  return (
    <PanGestureHandler onGestureEvent={panHandler}>
      <Animated.View style={[panStyle, { flex: 1}]}>
        <SharedElement id="teste.teste" style={{ flex: 1 }} >
          <PinchGestureHandler onGestureEvent={onGestureEvent}>
            <Animated.Image source={{ uri:  ImageUrl }} style={[{ flex: 1 }, rStyle]} />
          </PinchGestureHandler>
        </SharedElement>
      </Animated.View>
    </PanGestureHandler>
  )
}
export default function App() {

  return (
    <NavigationContainer>
      <Navigator  screenOptions={{
        gestureEnabled: false,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        headerShown: false,
      }
      } >
        <Screen name="main" component={Main} />
        <Screen 
            name="second" 
            component={Second}
            sharedElements={() => {
            return [`teste.teste`];
          }}
        />
      </Navigator>
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: {
    width: 200,
    height: 200,
    backgroundColor: '#ff0066',
    borderRadius: 100,
  }
});
