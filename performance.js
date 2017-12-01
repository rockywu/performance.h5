"use strict";
/**
 * Created by rocky on 2017/11/30.
 */
function forEach(o, cb = () => {}) {
  if(o instanceof Array || typeof o == "string") {
    for(let k = 0; k< o.length; k++) {
      cb(o[k], k);
    }
  } else if(o !== null && typeof o == "object") {
    for(let k in o) {
      if(o.hasOwnProperty(k)) {
        cb(o[k], k);
      }
    }
  }
}


/**
 * 采集器用于数据收集
 */
class Collector {

  static get keys() {
    return [
      /*
       * 当前浏览器窗口的前一个网页关闭，发生unload事件时的Unix毫秒时间戳。
       * 如果没有前一个网页，则等于fetchStart属性。
       */
      "navigationStart",

      /*
       * 如果前一个网页与当前网页属于同一个域名，则返回前一个网页的unload事件发生时的Unix毫秒时间戳。
       * 如果没有前一个网页，或者之前的网页跳转不是在同一个域名内，则返回值为0。
       */
      "unloadEventStart",

      /*
       * 如果前一个网页与当前网页属于同一个域名，则返回前一个网页unload事件的回调函数结束时的Unix毫秒时间戳。
       * 如果没有前一个网页，或者之前的网页跳转不是在同一个域名内，则返回值为0。
       */
      "unloadEventEnd",

      /*
       * 返回第一个HTTP跳转开始时的Unix毫秒时间戳。如果没有跳转，或者不是同一个域名内部的跳转，则返回值为0。
       */
      "redirectStart",

      /*
       * 返回最后一个HTTP跳转结束时（即跳转回应的最后一个字节接受完成时）的Unix毫秒时间戳。
       * 如果没有跳转，或者不是同一个域名内部的跳转，则返回值为0。
       */
      "redirectEnd",

      /*
       * 返回浏览器准备使用HTTP请求读取文档时的Unix毫秒时间戳。该事件在网页查询本地缓存之前发生。
       */
      "fetchStart",

      /*
       * 返回域名查询开始时的Unix毫秒时间戳。如果使用持久连接，或者信息是从本地缓存获取的，则返回值等同于fetchStart属性的值。
       */
      "domainLookupStart",

      /*
       * 返回域名查询结束时的Unix毫秒时间戳。如果使用持久连接，或者信息是从本地缓存获取的，则返回值等同于fetchStart属性的值。
       */
      "domainLookupEnd",

      /*
       * 返回HTTP请求开始向服务器发送时的Unix毫秒时间戳。
       * 如果使用持久连接（persistent connection），则返回值等同于fetchStart属性的值。
       */
      "connectStart",

      /*
       * 返回浏览器与服务器之间的连接建立时的Unix毫秒时间戳。
       * 如果建立的是持久连接，则返回值等同于fetchStart属性的值。连接建立指的是所有握手和认证过程全部结束。
       */
      "connectEnd",

      /*
       * 返回浏览器与服务器开始安全链接的握手时的Unix毫秒时间戳。如果当前网页不要求安全连接，则返回0。
       */
      "secureConnectionStart",

      /*
       * 返回浏览器向服务器发出HTTP请求时（或开始读取本地缓存时）的Unix毫秒时间戳。
       */
      "requestStart",

      /*
       * 返回浏览器从服务器收到（或从本地缓存读取）第一个字节时的Unix毫秒时间戳。
       */
      "responseStart",

      /*
       * 返回浏览器从服务器收到（或从本地缓存读取）最后一个字节时（如果在此之前HTTP连接已经关闭，则返回关闭时）的Unix毫秒时间戳。
       */
      "responseEnd",

      /*
       * 返回当前网页DOM结构开始解析时
       *（即Document.readyState属性变为“loading”、相应的readystatechange事件触发时）的Unix毫秒时间戳。
       */
      "domLoading",

      /*
       * 返回当前网页DOM结构结束解析、开始加载内嵌资源时
       *（即Document.readyState属性变为“interactive”、相应的readystatechange事件触发时）的Unix毫秒时间戳。
       */
      "domInteractive",

      /*
       * 返回当前网页DOMContentLoaded事件发生时（即DOM结构解析完毕、所有脚本开始运行时）的Unix毫秒时间戳。
       */
      "domContentLoadedEventStart",

      /*
       * 返回当前网页所有需要执行的脚本执行完成时的Unix毫秒时间戳。
       */
      "domContentLoadedEventEnd",

      /*
       * 返回当前网页DOM结构生成时
       *（即Document.readyState属性变为“complete”，以及相应的readystatechange事件发生时）的Unix毫秒时间戳。
       */
      "domComplete",

      /*
       * 返回当前网页load事件的回调函数开始时的Unix毫秒时间戳。如果该事件还没有发生，返回0。
       */
      "loadEventStart",

      /*
       * 返回当前网页load事件的回调函数运行结束时的Unix毫秒时间戳。如果该事件还没有发生，返回0。
       */
      "loadEventEnd"
    ];
  }

  // 构造
  constructor(debug) {
    //是否开启debug
    this.debug = debug === true;
    // 初始状态
    forEach(this.timeConfig, function(v, k){
      this.defineProperty(k, function() {
        return this.getTime(...v);
      }.bind(this))
    }.bind(this));
  }

  log(...args) {
    if(this.debug) {
      console.log(...args);
    }
  }

  static get timing() {
    return window.performance && window.performance.timing;
  }

  static get entries() {
    return window.performance && window.performance.getEntries();
  }

  defineProperty(name, getter) {
    Object.defineProperty(this, name, {
      enumerable : true,
      value : getter()
    })
  }

  /**
   * 数据时间处理
   * @param end
   * @param start
   * @param name
   * @return {number}
   */
  getTime(end, start, name) {
    let timing = this.constructor.timing;
    let endTime = timing[end] || timing["fetchStart"];
    let startTime = timing[start] || timing["fetchStart"];
    let rs = endTime - startTime;
    this.log("公式：" + end +" - " + start + " = "+ name+"("+rs+"ms)\n计算：" +endTime+ " - " +startTime+ " = "+ rs +"\n");
    return rs;
  }

  /**
   * 时间维度配置
   * @return {{timeRedirect: string[]}}
   */
  get timeConfig() {
    return {
      /*
       * redirectEnd - redirectStart 重定向时长
       */
      timeRedirect : ["redirectEnd", "redirectStart", "重定向时长"],
      /*
       * domainLookupEnd - domainLookupStart Dns解析时长
       */
      timeDns : ["domainLookupEnd", "domainLookupStart", "Dns解析时长"],
      /*
       * connectEnd - connectStart 网络握手和认证时间
       */
      timeTcp : ["connectEnd", "connectStart", "网络握手和认证时间"],
      /*
       * responseStart - requestStart 后端响应时长
       */
      timeRequest : ["responseStart", "requestStart", "后端响应时长"],
      /**
       * responseEnd - responseStart 下载时长
       */
      timeResponse : ["responseEnd", "responseStart", "下载时长"],
      /*
       * domComplete - domLoading dom解析开始到解析和执行完成时长
       */
      timeDomCompleteAnalysis : ["domComplete", "domLoading", "dom解析开始到解析和执行完成时长"],
      /*
       * domInteractive - domLoading dom树结构解析时长
       */
      timeDomConstructAnalysis : ["domInteractive", "domLoading", "dom树结构解析时长"],
      /*
       * domContentLoadedEventEnd - domContentLoadedEventStart dom所需执行的脚本运行时长,保护阻塞执行的css/js时长
       */
      timeDomEventRunning : ["domContentLoadedEventEnd", "domContentLoadedEventStart", "dom所需执行的脚本运行时长,保护阻塞执行的css/js时长"],
      /*
       * loadEventEnd - loadEventStart dom所有回调运行时长
       */
      timeDomLoadRunning : ["loadEventEnd", "loadEventStart", "dom所有回调运行时长"],
      /*
       * loadEventEnd – redirectStart onload时长
       */
      timeOnload : ["loadEventEnd", "redirectStart", "onload时长"],
      /**
       * domContentLoadedEventEnd - redirectStart 网页dom解析全过程时长
       */
      timeDomRender : ["domContentLoadedEventEnd", "redirectStart", "网页dom解析全过程时长"]
    }
  }

}

/**
 * 数据处理器
 */
class Processor {

}

setTimeout(function () {
  console.log(new Collector(true));
}, 1);