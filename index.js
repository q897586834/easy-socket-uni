/** 2021/5/21
 * @author:Sakura96
 * @desc: socket业务
 */

"use strict";
import Socket from "./socket/index";

class SocketCase {
  /**
   * @constructs SocketCase
   */
  constructor() {
    // 回调管理器
    this.callbackManager = {
      socketConnectDoneCallbackList: [],
      onSocketOpenCallbackList: [],
      onSocketErrorCallbackList: [],
      onSocketCloseCallbackList: []
    };
    // 长链接实例
    this.socket = null;
    this.initSocket();
  }
  /**
   * 初始化socket
   */
  initSocket() {
    this.socket = new Socket({
      openCallback: this.bind(this.openCallback),
      messageCallback: this.bind(this.messageCallback),
      closeCallback: this.bind(this.closeCallback),
      errorCallback: this.bind(this.errorCallback),
      socketConnectDone: this.bind(this.socketConnectDone)
    });
  }

  // 监听socket长链接建立成功的回调
  socketConnectDone(event) {
    this.tigerCallBack("socketConnectDoneCallbackList", event);
  }

  // 监听socket连接成功的回调
  openCallback(event) {
    this.tigerCallBack("onSocketOpenCallbackList", event);
  }

  // 监听socket连接关闭的回调
  closeCallback(event) {
    this.tigerCallBack("onSocketCloseCallbackList", event);
  }

  // 监听socket连接错误的回调
  errorCallback(event) {
    this.tigerCallBack("onSocketErrorCallbackList", event);
  }

  // 监听socket消息的回调
  messageCallback(data) {
    this.tigerCallBack(data);
  }

  // 触发回调函数
  tigerCallBack(name, data) {
    if (!name) {
      return false;
    }
    let callbackList = this.callbackManager[name];
    if (callbackList.length > 0) {
      for (const callback of callbackList) {
        if (typeof callback === "function") {
          callback(data);
        }
      }
    }
  }

  // 构造回调函数，通过闭包绑定this
  bind(fun) {
    const that = this;
    return function(data) {
      fun.call(that, data);
    };
  }

  // 关闭socket
  closeSocket() {
    this.socket.initiativeClose();
  }

  // 发送聊天消息-对应不同需求更改 chatMsg 参数
  sendChatMsg({
    content, headerParams
  }) {
    let chatMsg = {
      header: this.getRequestHeader(headerParams),
      body: JSON.stringify({
        // 消息内容
        content,
      }),
    };
    this.socket.sendMsg(chatMsg);
  }

  // 退出登陆
  quit({ content,headerParams }) {
    let chatMsg = {
      header: this.getRequestHeader(headerParams),
      body: JSON.stringify({
        // 消息内容
        content,
      }),
    };
    this.socket.sendMsg(chatMsg);
  }

  // 自定义请求头
  getRequestHeader(headerParams) {
    return {
      ...headerParams
    };
  }
}

// 分享单例模式变量
let SocketInstance = null;
/**
 * 获取单例
 */
SocketCase.getInstance = () => {
  if (!SocketInstance) {
    SocketInstance = new SocketCase();
  }

  return SocketInstance;
};

export default SocketCase;
