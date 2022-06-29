import { Pressable, StyleSheet, View, Text } from "react-native";
import React from "react";
import { getOrientationAsync } from "expo-screen-orientation";

const DriveButton = (props) => {
  return (
    <View style={styles.main}>
      <Pressable
        onPress={props.function}
        onPressIn={props.pressIn}
        onPressOut={props.pressOut}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 0.9,
          },
          styles.button,
        ]}
      >
        <Text style={styles.text}>{props.title}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bcbbbba7",
    borderRadius: 5,
    height: "95%",
    width: "95%",
  },
});

export default DriveButton;
