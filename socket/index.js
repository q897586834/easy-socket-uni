/** 2021/5/21
 * @author:Sakura96
 * @desc: socket类
 */
'use strict'
import config from '../config/socket_config'
import EventEmitter from '../utils/EventEmitter'

const event = new EventEmitter()
const env = process.env.NODE_ENV;

class Socket {
    /**
     * @constructs Socket
     * @param {Function} openCallback websocket建立连接成功的回调
     * @param {Function} messageCallback websocket监听消息返回的回调
     * @param {Function} closeCallback websocket关闭连接的回调
     * @param {Function} errorCallback websocket异常的回调
     * @param {Function} socketConnectDone 与长链接建立成功的回调
     */
    constructor({
                    openCallback,
                    messageCallback,
                    closeCallback,
                    errorCallback,
                    socketConnectDone
                }) {
        // webSocket实例
        this.webSocket = null
        // 心跳记时器
        this.heartBeatTimer = null
        // 是否手动关闭socket
        this.isInitiativeClose = false
        // 状态回调
        this.openCallback = openCallback
        this.closeCallback = closeCallback
        this.errorCallback = errorCallback
        this.socketConnectDone = socketConnectDone
        // 避免重复重连
        this.isReconnecting = false
        // socket连接成功
        this.isSocketReady = false
        this.createSocket()
    }

    // 获得socket地址
    getSocketUrl() {
        let urlList = []
        switch (env) {
            case 'development':
                // 开发环境
                urlList = config.BETA_URL_LIST
                break
            case 'beta':
                // 测试环境
                urlList = config.BETA_URL_LIST
                break
            default:
                // 生产环境
                urlList = config.PROD_URL_LIST
                break
        }
        // 获取随机地址
        let index = Math.floor(Math.random() * urlList.length)
        return urlList[index]
    }

    // 初始化socket
    createSocket() {
        try {
            this.webSocket = uni.connectSocket({ // 新建socket实例
                url: this.getSocketUrl(),
                complete: () => {
                }
            });
            this.init()
        } catch (e) {
            console.error('socket初始化失败')
        }
    }

    // 初始化socket业务流程
    init() {
        this.onOpen()
    }

    // socket Open
    onOpen() {
        let self = this
        uni.onSocketOpen(res => {
            console.log('socket已启动')
            // 暂停心跳
            self.stopHeartBeat()
            if (self.openCallback) {
                // 可以在启动函数内加回调
                self.openCallback(res)
            }
        });
    }

    // socket 接收数据
    onMessage() {
        let self = this
        uni.onSocketMessage(res => {
            if (self.messageCallback && res.data) {
                self.messageCallback(res.data)
            }
            // socket 业务状态处理
            // switch (res.msg) {
            //     case 'success':
            //         // 接受到socket连接成功
            //         self.startHeartBeat()
            //         event.trigger('socketReady')
            //         break
            //     case 'onMessage':
            //         console.log('tujiaSocket收到的消息',res.data)
            //         if (self.messageCallback && data) {
            //             self.messageCallback(data)
            //         }
            //         break
            //     default:
            //         break
            // }
        });
    }

    // socket 关闭
    onClose() {
        let self = this
        uni.onSocketClose(res => {
            console.error('socket连接关闭')
            if (self.closeCallback) {
                // 可以在关闭函数内加回调
                self.closeCallback(res)
            }
            self.isSocketReady = false
            self.stopHeartBeat()
        })
    }

    // socket 处理错误
    onError() {
        let self = this
        uni.onSocketError(res => {
            console.error('socket错误')
            if (self.errorCallback) {
                // 可以在错误处理函数内加回调
                self.errorCallback(res)
            }
            self.isSocketReady = false
            self.stopHeartBeat()
        })
    }

    // 主动关闭socket
    initiativeClose() {
        this.isInitiativeClose = true
        this.stopHeartBeat()
        this.webSocket.close()
    }

    // socket 发送消息
    sendMsg(msg) {
        this.readyToSendMessage(() => {
            try {
                console.log('socket发送的消息', msg)
                let json = JSON.stringify(msg)
                uni.sendSocketMessage({
                    data: json
                });
            } catch (error) {
                console.error(error)
            }
        })
    }

    // socket 重连
    reconnect() {
        if (this.isReconnecting) {
            return false
        }
        this.isReconnecting = true
        // 递增重试建立连接
        setTimeout(() => {
            this.createSocket()
            this.isReconnecting = false
        }, config.RECONNECT_INTERVAL)
    }

    // 发送消息之前先判断 socket 状态
    readyToSendMessage(success) {
        // 发送时先判断连接是否关闭
        if (this.isSocketClosing() || this.isSocketClose()) {
            this.reconnect()
        }

        // 如果已经成功的建立了链接，则直接发送，否则监听websocketReady成功再发送
        if (this.isSocketOpen() && this.isSocketReady) {
            if (success) {
                success()
            }
        } else {
            event.on('socketReady', () => {
                if (success) {
                    success()
                }
            })
        }
    }

    // 发送心跳
    startHeartBeat() {
        this.heartBeatTimer = setInterval(() => {
            let heart = ''
            uni.sendSocketMessage({
                data: heart
            });
        }, config.HEART_INTERVAL)
    }

    // 停止心跳机制
    stopHeartBeat() {
        clearInterval(this.heartBeatTimer)
    }

    // 检查socket是否正在连接
    async isSocketConnecting() {
        // WebSocket.CONNECTING 为0
        return this.webSocket && this.webSocket.readyState === 0
    }

    // 检查socket是否连接成功
    async isSocketOpen() {
        // WebSocket.OPEN 为1
        return this.webSocket && this.webSocket.readyState === 1
    }

    // 检查socket是否正在关闭
    isSocketClosing() {
        // WebSocket.CLOSING 为2
        return this.webSocket && this.webSocket.readyState === 2
    }

    // 检查socket是否已经关闭
    isSocketClose() {
        // WebSocket.CLOSED 为3
        return this.webSocket && this.webSocket.readyState === 3
    }
}

export default Socket
