import axios from "axios";
import "reflect-metadata";
import Vue from "vue";
import VueSocketIO from "vue-socket.io-extended";
import App from "./App.vue";
import Notifications from "vue-notification";
import "./registerServiceWorker";
import router from "./router";
import socket from "./socket";
import { store } from "./store";

Vue.use(VueSocketIO, socket, { store });
Vue.use(Notifications);

axios.defaults.baseURL = "/api";

if (process.env.NODE_ENV == "development") localStorage.debug = "*";

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
