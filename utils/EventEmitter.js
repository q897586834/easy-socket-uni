/** 2021/5/21
 * @author:Sakura96
 * @desc: 订阅者发布者模式
 */

export default class EventEmitter {
  constructor() {
    this.listeners = {}
  }
  /**
   * 事件订阅
   * @param {Sting} eventName 事件名
   * @param {Function} callback 回调函数
   */
  on(eventName, callback) {
    if (this.listeners[eventName] && this.listeners[eventName].length) {
      if (this.listeners[eventName].indexOf(callback) === -1) {
        this.listeners[eventName].push(callback)
      }
    } else {
      this.listeners[eventName] = [callback]
    }
  }
  /**
   * 发布事件
   * @param {Sting} eventName 事件名
   */
  trigger(eventName) {
    if (this.listeners[eventName]) {
      for (let i = 0; i < this.listeners[eventName].length; i++) {
        this.listeners[eventName][i].apply(this, [].slice.call(arguments, 1))
      }
    }
  }

  // 重置监听
  clearAll() {
    this.listeners = {}
  }
}
