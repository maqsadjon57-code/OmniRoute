/* Transport layer — local bus today, swap-in WebSocket later */

import { bus } from "./utils.js";
import { API } from "./api.js";
import { Notify } from "./notifications.js";
import { StatusBar } from "./statusbar.js";

let socket = null;
let url = null;

export const Socket = {
  connected: false,

  connect(wsUrl) {
    url = wsUrl;
    if (!wsUrl) {
      this.connected = false;
      return;
    }
    try {
      socket = new WebSocket(wsUrl);
      socket.addEventListener("open", () => {
        this.connected = true;
        StatusBar.setOnline(true);
        Notify.success("Connected", wsUrl);
        bus.emit("ws:open");
      });
      socket.addEventListener("close", () => {
        this.connected = false;
        bus.emit("ws:close");
      });
      socket.addEventListener("message", (ev) => {
        bus.emit("ws:message", ev.data);
      });
      socket.addEventListener("error", () => {
        Notify.error("WebSocket error", "Falling back to the local agent.");
      });
    } catch (e) {
      Notify.error("WebSocket failed", e.message);
    }
  },

  send(payload) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(typeof payload === "string" ? payload : JSON.stringify(payload));
      return true;
    }
    return false;
  },

  disconnect() {
    socket?.close();
    socket = null;
    this.connected = false;
  },

  async prompt(text) {
    if (this.send({ type: "prompt", text })) return;
    return API.submit(text);
  },
};

export default Socket;
