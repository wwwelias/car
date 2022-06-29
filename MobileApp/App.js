import { useEffect, useRef, useState } from "react";
import DriveButton from "./components/DriveButton";
import {
  AppState,
  StyleSheet,
  Dimensions,
  Text,
  View,
  Alert,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { DeviceMotion } from "expo-sensors";
import { StatusBar } from "expo-status-bar";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const ip = "ws://10.72.5.228:8080";
var ws = new WebSocket(ip);
var drivingForward = false;
var drivingBackward = false;

const onLoad = () => {
  ws.onopen = function (e) {
    onOpen(e);
  };
  ws.onclose = function (e) {
    onClose(e);
  };
  ws.onmessage = function (e) {
    onMessage(e);
  };
  ws.onerror = function (e) {
    onError(e);
  };
};

function onOpen(e) {
  // connection opened
}

function onError(e) {
  // an error occurred
  console.log(e.message + " error");
}

function onClose(e) {
  // connection closed
  console.log(e.code, e.reason, " closed");
  ws = new WebSocket(ip);
  onLoad();
}

function closeSocket() {
  ws.onclose = function () {};
  ws.close();
}

function onMessage(e) {
  console.log(e.data + " message");
}

onLoad();

const submitMessage = (mes) => {
  try {
    ws.send(mes);
  } catch (error) {
    console.log(error.message);
  }
};
const forward = () => {
  if (!drivingBackward) {
    drivingForward = true;
    submitMessage("fw");
  }
};

const backward = () => {
  if (!drivingForward) {
    drivingBackward = true;
    submitMessage("bw");
  }
};

const stop = (dir) => {
  if (dir == "fw" && !drivingBackward) {
    drivingForward = false;
    submitMessage("stop");
  }
  if (dir == "bw" && !drivingForward) {
    drivingBackward = false;
    submitMessage("stop");
  }
};

const steer = (val) => {
  submitMessage(val.toString());
};

function direction(data) {
  let steeringValue = data * 50;
  if (steeringValue > 50) steeringValue = 50;
  if (steeringValue < -50) steeringValue = -50;
  steer(steeringValue);
}

export default function App() {
  ScreenOrientation.lockAsync(
    ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
  );

  const [data, setData] = useState({});

  useEffect(() => {
    _subscribe();
    return () => {
      _unsubscribe();
    };
  }, []);

  const _subscribe = () => {
    DeviceMotion.addListener((devicemotionData) => {
      setData(devicemotionData.rotation);
      DeviceMotion.setUpdateInterval(400);
    });
  };

  const _unsubscribe = () => {
    DeviceMotion.removeAllListeners();
  };

  direction(Math.round(data.beta * 100) / 100);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        onLoad();
      } else if (
        appState.current.match(/inactive|active/) &&
        nextAppState === "background"
      ) {
        closeSocket();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log("AppState", appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.forward}>
        <DriveButton
          title="Forward"
          pressIn={() => forward()}
          pressOut={() => stop("fw")}
        />
      </View>
      <View style={styles.backward}>
        <DriveButton
          title="Backward"
          pressIn={() => backward()}
          pressOut={() => stop("bw")}
        />
      </View>
      <StatusBar style="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  forward: {
    width: windowWidth * 0.5,
    height: windowHeight,
  },
  backward: {
    width: windowWidth * 0.5,
    height: windowHeight,
  },
});
