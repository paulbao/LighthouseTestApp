/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  DeviceEventEmitter,
  TextInput,
  Alert,
} from 'react-native'
import moment from 'moment'
import Lighthouse from '@lighthouse/sdk-mobile'
import forEach from 'lodash/fp/forEach'
import sortBy from 'lodash/fp/sortBy'
import head from 'lodash/fp/head'
import values from 'lodash/values'
import RNFS from 'react-native-fs'

const directory = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalStorageDirectoryPath
const title = Platform.OS === 'ios' ? 'minor\trssi\tmajor\tproximity\taccuracy\tuuid\ttimestamp\tkey\tnearest\n' : 
  'rssi\tdistance\ttxPower\taccuracy\tminor\tmajor\tuuid\tkey\ttimestamp\tnearest\n'
const fileType = '.txt'

// const uuids = ['74278BDA-B644-4520-8F0C-720EAF059935']
const uuids = [
   '74278BDA-B644-4520-8F0C-720EAF059935'
   // "4D1D3446-FFF6-4874-AE62-5CF1D775599A",
   // "EDE11286-F076-4D0A-AB9A-285F61C24037",
   // "84903EC2-C8F1-434F-9F7D-FA6CFCE14632",
   // "5A4BCFCE-174E-4BAC-A814-092E77F6B7E5",
   // "1223CBE7-20A0-475E-B44C-5455F221D6B1",
   // "5969209F-E850-4011-A6C6-C653C6BA79BB",
   // "69A86972-2D13-4AAB-807A-D15B60258AA9",
   // "48861D7B-BD90-4445-BA7D-FAB8520AA9F5",
   // "12763660-9EB0-4E25-A029-F5B5C98730B8",
   // "30F546E0-7CFF-4E05-BE8F-C323EC2A41DC",
   // "AD3886AF-3B13-4F29-9748-D0C0CB91E593",
   // "2288CD75-B582-47A5-BA3C-86A5AB0A8AC4",
   // "44F7DD45-09EE-4E89-A6E7-E8E9FB79F4B8",
   // "3971FABE-33BD-4322-A7CD-99277C52498F",
   // "19ED60DF-F2A9-42DF-A1CD-037BFB96E172"
   ]
// const path = `${directory}/logs.txt`
        // params.putString("key", key);
        // params.putString("uuid", beacon.getId1().toString().toUpperCase());
        // params.putString("major", beacon.getId2().toString());
        // params.putString("minor", beacon.getId3().toString());
        // params.putDouble("accuracy", beacon.getDistance());
        // params.putString("distance", formatDistance(beacon.getDistance()));
        // params.putInteger("rssi", beacon.getRssi());
        // params.putInteger("txPower", beacon.getTxPower());

export default class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileName: '1 Meter',
      isRanging: false,
    }

    DeviceEventEmitter.addListener('didRangeBeacons', data => {
      const beacons = sortBy('accuracy')(data.beacons)
      const nearestBeacon = head(beacons)
      const nearestBeaconKey = this.genarateKey(nearestBeacon)
      // const beacons = data.beacons
      const path = `${directory}/${this.state.fileName}${fileType}`
      const timestamp = moment().format('h:mm:ss a')

      forEach(beacon => {
        //add timestamp
        beacon.timestamp = timestamp
        const beaconKey = this.genarateKey(beacon)
        beacon.key = beaconKey
        if (beaconKey === nearestBeaconKey) {
          beacon.nearest = true
        }
        RNFS.appendFile(path, this.convert(beacon)+'\n', 'utf8')
        .then((success) => {
          console.log('FILE WRITTEN!')
        })
        .catch((err) => {
          console.log(err.message)
        })
        // console.log('ranging', beacon)


        // RNFS.appendFile(path, '\n', 'utf8')
        // .then((success) => {
        //   console.log('FILE WRITTEN!')
        // })
        // .catch((err) => {
        //   console.log(err.message)
        // })
      })(beacons)
      // console.log('ranging', data.beacons[0])
      // RNFS.appendFile(path, JSON.stringify(data.beacons[0])+'\n', 'utf8')
      // .then((success) => {
      //   console.log('FILE WRITTEN!');
      // })
      // .catch((err) => {
      //   console.log(err.message);
      // })
    })
    this.buttonOnClicked = this.buttonOnClicked.bind(this)
    this.startRanging = this.startRanging.bind(this)
    this.goRanging = this.goRanging.bind(this)
  }

  genarateKey(beacon) {
    return `${beacon.uuid}-${beacon.major}-${beacon.minor}`
  }

  convert(beacon) {
    // return JSON.stringify(beacon)
    // console.log(JSON.stringify(values(beacon)))
    let result
    forEach(value =>{
      

      if (!result) {
        result = value.toString()
      } else {
        result = result.concat('\t', value)
      }
    })(values(beacon))
    return result
  }
  startRanging(){
    const {
      fileName,
    } = this.state

    const path = `${directory}/${this.state.fileName}${fileType}`
    if (this.isFileExist(path)) {
      //file already exist
        Alert.alert(
        'FileName',
        `${fileName} is already exist, do you want to remove it first?`,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => {
            this.createFile(path)
            this.goRanging()
          }},
        ]
      )
      return
    } else {
      this.goRanging()
    }
  }

  goRanging() {
    Lighthouse.requestPermission()

    forEach(uuid => {
      // console.log(uuid)
      // const uuid = '74278BDA-B644-4520-8F0C-720EAF059935'
      // const major = 17
      // const minor = 17
      const identifier = `lighthouse-${uuid}`
      const regionOpts = {
        identifier,
        uuid,
        // major,
        // minor,
      }

      Lighthouse.startRangingBeaconsInRegion(regionOpts)

      Platform.OS === 'ios' && Lighthouse.requestStateForRegion(regionOpts)
    })(uuids)

    Lighthouse.startUpdatingLocation && Lighthouse.startUpdatingLocation()

    this.setState({isRanging: true})
  }

  createFile(fileName) {
    RNFS.writeFile(fileName, title, 'utf8')
    .then((success) => {
      console.log('FILE CREATED!')
    })
    .catch((err) => {
      console.log(err.message)
    })
  }

  isFileExist(fileName) {
    
    if (!RNFS.exists(fileName)) {
      this.createFile(fileName)
      return false
    } else {
      return true
    }
  }
  // appendDistance(distance) {
  //   const content = `Distance: ${distance}\n`

  //   if (RNFS.exists(path)) {
  //     RNFS.writeFile(path, content, 'utf8')
  //     .then((success) => {
  //       console.log('FILE WRITTEN!')
  //     })
  //     .catch((err) => {
  //       console.log(err.message)
  //     })
  //   } else {
  //     RNFS.appendFile(path, content, 'utf8')
  //     .then((success) => {
  //       console.log('FILE WRITTEN!')
  //     })
  //     .catch((err) => {
  //       console.log(err.message)
  //     })
  //   }
  // }

  buttonOnClicked() {
    const {
      isRanging,
      fileName,
    } = this.state
    if (isRanging) {
      Alert.alert(
        'Ranging',
        `Are you sure to stop ranging?`,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => {
            Lighthouse.stopCurrentRangingRegions()
            this.setState({isRanging: false})
          }},
        ]
      )
    } else {

      Alert.alert(
        'Ranging',
        `Start Ranging with ${fileName}?`,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: this.startRanging},
        ]
      )

    }

  }

  render() {
    return (
      <View style={styles.container}>
        <Text>File Name</Text>
        <TextInput
          style={{height: 50, width: 150, alignSelf: 'center'}}
          onChangeText={(fileName) => {
            this.setState({fileName})
          }}
          value={this.state.fileName}
        />
        <Text 
          style={styles.welcome}
          onPress={this.buttonOnClicked}
        >
          {this.state.isRanging ? 'Stop Ranging' : 'Start Ranging'}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'grey',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

