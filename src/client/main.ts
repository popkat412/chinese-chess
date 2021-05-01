import "reflect-metadata";
import Vue from "vue";
import VueSocketIO from "vue-socket.io-extended";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import socket from "./socket";
import { store } from "./store";

Vue.use(VueSocketIO, socket, { store });

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
