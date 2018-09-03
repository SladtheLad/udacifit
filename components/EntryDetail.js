import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { white } from '../utils/colors'
import styled from 'styled-components/native'

import MetricCard from './MetricCard'
import { addEntry } from '../actions'
import { removeEntry } from '../utils/api'
import { timeToString, getDailyReminderValue } from '../utils/helpers'
import TextButton from './TextButton'

const Container = styled.View`
 flex: 1;
 background-color: white;
 padding: 15px;
`

class EntryDetail extends Component {
  static navigationOptions = ({ navigation }) => {
    const { entryId } = navigation.state.params
    const year = entryId.slice(0, 4)
    const month = entryId.slice(5, 7)
    const day = entryId.slice(8)
    return {
      title: `${month}/${day}/${year}`
    }
  }

  reset = () => {
    const { remove, goBack, entryId } = this.props

    remove()
    goBack()
    removeEntry(entryId)
  }

  shouldComponentUpdate (nextProps) { 
    return nextProps.metrics !== null && !nextProps.metrics.today
  }

  render() {

    const { metrics } = this.props

    return (
      <Container>
        <MetricCard metrics={metrics} />
        <TextButton onPress={this.reset} style={{margin: 20}}>
          Reset
        </TextButton> 
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch, { navigation }) => {
  const { entryId } = navigation.state.params

  return {
    remove: () => dispatch(addEntry({
      [entryId]: timeToString() === entryId
      ? getDailyReminderValue()
      : null
    })),
    goBack: () => navigation.goBack()
  }
}

const mapStateToProps = (state, { navigation }) => {
  const { entryId } = navigation.state.params

  return {
    entryId,
    metrics: state[entryId]
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EntryDetail)