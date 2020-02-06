// components/track/track.js
var zimuList = []; // 字幕集合
var currentZimuIndex = -1;  // 当前字幕位置，-1表示还未开始
var fileSystemManager = wx.getFileSystemManager();

Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        enableEn: true,
        enableZh: true
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 视频触发事件
        videoChangeEvent: function (time) {
            this.setZimu(time, currentZimuIndex)
        },
        
        // 设置字幕（展示字幕的重要环节）
        setZimu: function(time, index) {
            if (index >= zimuList.length) {
                return;
            }
            // 如果需要移动字幕指针（即当前指向-1 或 当前视频进度大于当前字幕结尾的时间）
            if (index == -1 || zimuList[index][2] < time) {
                this.hideZimu();
                this.setZimu(time, index + 1)
                return;
            }
            else if (index != 0 && index != -1 && zimuList[index][1] > time && zimuList[index - 1][2] > time) {
                this.hideZimu();
                this.setZimu(time, (index - 1 < -1) ? -1 : (index - 1))
                return;
            }
            // 如果未来指针大于当前指针并且当前视频进度 > 未来指针字幕的开始时间(-200ms)
            if (index != currentZimuIndex && time > zimuList[index][1] - 250) {
                currentZimuIndex = index;
                this.showZimu(currentZimuIndex);
            }
        },
        /**
         * 字幕相关
         */
        loadZimu: function (path, fileName) {
            zimuList = [];
            this.downloadZimu(path, fileName);
        },
        readZimu: function (fileName) {
            console.info(wx.env.USER_DATA_PATH + '/' + fileName)
            let fileStr = fileSystemManager.readFileSync(wx.env.USER_DATA_PATH + '/' + fileName, 'utf-8')
            // 换行符转换
            fileStr = fileStr.replace(new RegExp("\r\n", "gm"), '\n')
            let list = fileStr.split('WEBVTT\n\n')[1].split('\n\n');

            for (let i = 0; i < list.length; i++) {
                if (list[i]) {
                    // 去除首位换行符
                    list[i] = list[i].replace(/^(\s|\n)+|(\s|\n)+$/g, '');
                    let a = list[i].split('\n');
                    let timeFrom = a[1].split(' --> ')[0];
                    let timeTo = a[1].split(' --> ')[1];
                    zimuList.push([a[0], this.getCurrentTime(timeFrom), this.getCurrentTime(timeTo), a[2], a[3]]);
                }
            }
        },
        downloadZimu: function (path, fileName) {
            var that = this;
            wx.downloadFile({
                "url": path + fileName,
                "filePath": wx.env.USER_DATA_PATH + '/' + fileName,
                success: function (e) {
                    that.readZimu(fileName);
                }
            })
        },
        // 改变字幕
        changeZimu: function (zh, en) {
            this.setData({
                zh,
                en
            })
        },
        // 隐藏字幕
        hideZimu: function () {
            this.changeZimu('', '');
        },
        // 展示字幕
        showZimu: function (index) {
            this.changeZimu(zimuList[index][4], zimuList[index][3]);
        },
        // 获取当前时间戳
        getCurrentTime: function (time) {
            let timeSplit = time.split(".");
            let a = new Date('1970/01/01 ' + timeSplit[0]).getTime() + parseInt(timeSplit[1]) + 28800000; // 兼容iphone下的处理方法
            return a;
        },
    }
})
