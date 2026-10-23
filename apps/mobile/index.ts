import {registerGlobals} from "@livekit/react-native";
registerGlobals();
import "react-native-gesture-handler";
import "./src/services/location-task";
import { registerRootComponent } from "expo";
import App from "./src/App";
registerRootComponent(App);
