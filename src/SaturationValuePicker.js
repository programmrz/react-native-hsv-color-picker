import React, { Component } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  ViewPropTypes,
  PanResponder,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import { colord } from 'colord';
import normalizeValue from './utils';

export default class SaturationValuePicker extends Component {
  constructor(props) {
    super(props);
    this.firePressEvent = this.firePressEvent.bind(this);
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { saturation, value } = this.props;
        this.dragStartValue = {
          saturation,
          value,
        };
        this.fireDragEvent('onDragStart', gestureState);
      },
      onPanResponderMove: (evt, gestureState) => {
        this.fireDragEvent('onDragMove', gestureState);
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        this.fireDragEvent('onDragEnd', gestureState);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        this.fireDragEvent('onDragTerminate', gestureState);
      },
      onShouldBlockNativeResponder: () => true,
    });
  }

  getCurrentColor() {
    const { hue, saturation, value } = this.props;
    return colord({
      h: hue,
      s: saturation,
      v: value,
    }).toHex();
  }

  computeSatValDrag(gestureState) {
    const { dx, dy } = gestureState;
    const { width } = this.props;
    const { saturation, value } = this.dragStartValue;
    const diffx = dx / width;
    const diffy = dy / width;
    return {
      saturation: normalizeValue(saturation + diffx),
      value: normalizeValue(value - diffy),
    };
  }

  computeSatValPress(event) {
    const { nativeEvent } = event;
    const { locationX, locationY } = nativeEvent;
    const { width } = this.props;
    return {
      saturation: normalizeValue(locationX / width),
      value: 1 - normalizeValue(locationY / width),
    };
  }

  fireDragEvent(eventName, gestureState) {
    const { [eventName]: event } = this.props;
    if (event) {
      event({
        ...this.computeSatValDrag(gestureState),
        gestureState,
      });
    }
  }

  firePressEvent(event) {
    const { onPress } = this.props;
    if (onPress) {
      onPress({
        ...this.computeSatValPress(event),
        nativeEvent: event.nativeEvent,
      });
    }
  }

  render() {
    const {
      width,
      height,
      sliderSize,
      hue,
      value,
      saturation,
      containerStyle,
      borderRadius,
    } = this.props;
    return (
      <View
        style={[
          styles.container,
          containerStyle,
          {
            height: height + sliderSize,
            width: width + sliderSize,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={this.firePressEvent}>
          <LinearGradient
            style={[{ borderRadius }, styles.linearGradient]}
            colors={[
              '#fff',
              colord(`hsl(${hue}, 1, 0.5)`).toHex(),
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            <LinearGradient
              colors={[
                'rgba(0, 0, 0, 0)',
                '#000',
              ]}
            >
              <View
                style={{
                  height,
                  width,
                }}
              />
            </LinearGradient>
          </LinearGradient>
        </TouchableWithoutFeedback>
        <View
          {...this.panResponder.panHandlers}
          style={[
            styles.slider,
            {
              width: sliderSize,
              height: sliderSize,
              borderRadius: sliderSize / 2,
              borderWidth: sliderSize / 10,
              backgroundColor: this.getCurrentColor(),
              transform: [
                { translateX: width * saturation },
                { translateY: width * (1 - value) },
              ],
            },
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    top: 0,
    left: 0,
    position: 'absolute',
    borderColor: '#fff',
  },
  linearGradient: {
    overflow: 'hidden',
  },
});

SaturationValuePicker.propTypes = {
  containerStyle: ViewPropTypes.style,
  borderRadius: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  sliderSize: PropTypes.number,
  hue: PropTypes.number,
  saturation: PropTypes.number,
  value: PropTypes.number,
  onDragStart: PropTypes.func,
  onDragMove: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragTerminate: PropTypes.func,
  onPress: PropTypes.func,
};

SaturationValuePicker.defaultProps = {
  containerStyle: {},
  borderRadius: 0,
  width: 200,
  height: 256,
  sliderSize: 24,
  hue: 0,
  saturation: 1,
  value: 1,
  onDragStart: null,
  onDragMove: null,
  onDragEnd: null,
  onDragTerminate: null,
  onPress: null,
};
