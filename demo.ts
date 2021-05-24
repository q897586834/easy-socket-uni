/** 2021/5/24
 * @author:Sakura96
 * @desc: socket demo
 */

import SocketCase from './index'

let socket = new SocketCase()
let headerParams = {} // 自定义请求头，没有可不加
let userInfo = {}

// 登录socket
export function socketLogin() {
    socket.sendChatMsg({
        content: {...userInfo},
        headerParams: headerParams
    })
}

// 发送消息
export function socketSendMsg(data: any) {
    let params = {...data}

    // socket 发送消息请求数据
    // content 内容 headerParams 自定义请求头
    socket.sendChatMsg({
        content: params,
        headerParams: headerParams
    })
}

// 接受消息,将信息分发出去
socket.registerOnMsg(data => {
    // event.$emit('newMessage', data);
})

// 退出登录
export function socketQuit() {
    clearSocketUserInfo()
    socket.quit()
}

// 重新登录
export function socketReLogin() {
    let timer = setTimeout(async () => {
        clearSocketUserInfo()
        //userInfo = {...await 获取socket登录信息接口()}
        clearTimeout(timer)
    }, 1000)
}

// 清空 userinfo
export function clearSocketUserInfo() {
    userInfo = {}
}
