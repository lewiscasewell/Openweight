import React, {useState} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const CollapsableContainer = ({
  children,
  expanded,
  duration = 200,
}: {
  children: React.ReactNode;
  expanded: boolean;
  duration?: number;
}) => {
  const [height, setHeight] = useState(200);
  const animatedHeight = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const onLayoutHeight = event.nativeEvent.layout.height;

    if (onLayoutHeight > 0 && height !== onLayoutHeight) {
      setTimeout(() => {
        setHeight(onLayoutHeight);
      }, 250);
    }
  };

  const collapsableStyle = useAnimatedStyle(() => {
    animatedHeight.value = expanded
      ? withTiming(height, {duration})
      : withTiming(0);

    return {
      height: animatedHeight.value,
    };
  }, [expanded, height]);

  return (
    <Animated.View style={[collapsableStyle, styles.container]}>
      <View style={styles.innerContainer} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  innerContainer: {position: 'absolute', width: '100%', flexGrow: 1},
});

export default CollapsableContainer;
