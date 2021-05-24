/** 2021/5/21
 * @author:Sakura96
 * @desc: websocket长链接协议配置文件
 */
export default {
  // 重连间隔基值（2秒）
  RECONNECT_INTERVAL: 2000,
  // 心跳间隔
  HEART_INTERVAL: 5000,
  // 协议版本
  VERSION: '1.0',
  // 线上连接地址数组
  PROD_URL_LIST: [''],
  // 测试连接地址数组
  BETA_URL_LIST: [''],
}
