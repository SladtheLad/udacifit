import React, { Component } from 'react'
import { Text, ActivityIndicator, Animated, StyleSheet } from 'react-native'
import styled from 'styled-components'
import { Foundation } from '@expo/vector-icons'
import { Location, Permissions } from 'expo'
import { calculateDirection } from '../utils/helpers'

const Container = styled.View`
  flex: 1;
  justify-content: space-between;
`
const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-left: 30px;
  margin-right: 30px;
`
const Button = styled.TouchableOpacity`
  padding: 10px;
  background-color: #292477;
  align-self: center;
  border-radius: 5px;
  margin: 20px;
`
const ButtonText = styled.Text`
  font-size: 20px;
  color: #fff;
`
const DirectionContainer = styled.View`
  flex: 1;
  justify-content: center;
`
const Header = styled.Text`
  font-size: 35px;
  text-align: center;
  color: #fff;
`
const SubHeader = styled.Text`
  font-size: 25px;
  text-align: center;
  margin-top: 5px;
  color: #fff
`
const Direction = styled.Text`
  color: #292477;
  font-size: 120px;
  text-align: center;
`
const MetricContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  background-color: #292477;
`
const Metric = styled.View`
  flex: 1;
  padding-top: 15px;
  padding-bottom: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 20px 10px;
`
const AnimatedDirection = Animated.createAnimatedComponent(Direction)

export default class Live extends Component {
  state = {
    coords: null,
    status: null,
    direction: '',
    bounceValue: new Animated.Value(1)
  }

  componentDidMount () {
    Permissions.getAsync(Permissions.LOCATION)
    .then(({ status }) => {
      if (status === 'granted') {
        return this.setLocation()
      }

      this.setState(() => ({ status }))
    })
    .catch((error) => {
      console.warn(`Error getting Location permission: ${error}` )

      this.setState(() => ({ status: 'undetermined'}))

    })
  }

  askPermission = () => {
    Permissions.askAsync(Permissions.LOCATION)
    .then(({ status }) => {
      if ( status === 'granted' ) {
        return this.setLocation()
      }

      this.setState(() => ({ status }))
    })
    .catch((error) => console.warn(`error asking Location permission: ${error}`))
  }

  setLocation = () => {
    Location.watchPositionAsync({
      enableHighAccuracy: true,
      timeInterval: 1,
      distanceInterval: 1
    }, ({ coords }) => {
      const newDirection = calculateDirection(coords.heading)
      const { direction, bounceValue } = this.state

      if (newDirection !== direction) {
        Animated.sequence([
          Animated.timing(bounceValue, { duration: 200, toValue: 1.04}),
          Animated.spring(bounceValue, { toValue: 1, friction: 4})
        ]).start()
      }

      this.setState(() => ({
        coords,
        status: 'granted',
        direction: newDirection
      }))
    })
  }
  render() {
    const { status, coords, direction, bounceValue } = this.state

    if (status === null) {
      return <ActivityIndicator style={{ marginTop: 30 }} />
    }

    if (status === 'denied') {
      return (
        <Center>
          <Foundation name='alert' sizez={50} />
          <Text style={{ textAlign: 'center' }}>
            You denied your location. You can fix this by visiting your settings and enabling location services for this app.
          </Text>
        </Center>
      )
    }

    if (status === 'undetermined') {
      return (
        <Center>
          <Foundation name='alert' sizez={50} />
          <Text style={{ textAlign: 'center' }}>
            You need to enable location services for this app.
          </Text>
          <Button onPress={this.askPermission} >
            <ButtonText>
              Enable
            </ButtonText>
          </Button>
        </Center>
      )
    }

    return (
      <Container>
        <DirectionContainer>
          <Header style={{color: 'black'}}>You're heading:</Header>
          <AnimatedDirection style={{transform: [{scale: bounceValue}]}}>{direction}</AnimatedDirection>
        </DirectionContainer>
        <MetricContainer>
          <Metric>
            <Header>Altitude</Header>
            <SubHeader>{Math.round(coords.altitude * 3.2808)} Feet</SubHeader>
          </Metric>
        </MetricContainer>
        <MetricContainer>
          <Metric>
            <Header>Speed</Header>
            <SubHeader>{Math.round(coords.speed * 2.2369.toFixed)} MPH</SubHeader>
          </Metric>
        </MetricContainer>
      </Container>
    )
  }
}