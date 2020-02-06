//index.js
Page({
    data: {

    },
    onLoad: function () {
        this.init();
    },
    // 初始化
    init: function () {
        // 加载字幕
        this.selectComponent("#track").loadZimu('https://www.lpsql.top/static/en/s/', '1.vtt');
    },
    videoChange: function (e) {
        // 视频触发事件
        this.selectComponent("#track").videoChangeEvent(e.detail.currentTime * 1000);
    }
})