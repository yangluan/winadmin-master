layui.config({
    base: './lib/winui/' //指定 winui 路径
    , version: '1.0.0-beta'
}).extend({  //指定js别名
    window: 'js/winui.window',
    desktop: 'js/winui.desktop',
    start: 'js/winui.start',
    // helper: 'js/winui.helper'  'helper'
}).define(['window', 'desktop', 'start'], function (exports) {
    //加载winui模块后,winui将会作为全局对象存在
    //使用desktop、window、start模块后，winui对象将会增加desktop、window、menu三个属性
    var $ = layui.jquery
        , winLayer = winui.window
        , desktop = winui.desktop
        , menu = winui.menu;


    //开始使用
    $(function () {
        //WinAdmin配置
        winui.config({
            //基础设置
            settings: layui.data('winui').settings || {
                color: 32,  //主题色
                taskbarMode: 'bottom',  //任务栏模式
                startSize: 'sm',    //开始菜单尺寸
                bgSrc: '',  //背景图路径
            }  //如果缓存的配置为空则给默认值
            //桌面配置
            , desktop: {
                config: {
                    url: '' //桌面数据接口地址
                },
                done: function (desktopApp) {
                    //桌面加载完毕回调
                    desktopApp.ondblclick(function (id, elem) {
                        OpenWindow(elem);
                    });

                    desktopApp.contextmenu({
                        item: ["打开", "删除"],
                        item1: function (id, elem) {
                            OpenWindow(elem);
                        },
                        item2: function (id, elem, events) {
                            winui.window.msg('删除回调');
                            $(elem).remove();
                            //从新排列桌面app
                            events.reLocaApp();
                        },
                        // item3: function (id, elem, events) {
                        //     winui.window.msg('自定义回调');
                        // }
                    });
                    // desktop.openAppAlert();


                    //页面发生刷新重载或者关闭重新打开时 检查缓存是否之前有新建文件夹操作
                    //检查有过多少次新建文件夹操作
                    var createTxtIndex = localStorage.getItem('createIndex');
                    if (createTxtIndex != '' || createTxtIndex != undefined || createTxtIndex != null) {
                        //从缓存读取桌面应用数据格式
                        var reloadTxtBox = JSON.parse(localStorage.getItem('deskTxtBox'));
                        var queryString = '';
                        for (var i = 0; i < createTxtIndex; i++) {
                            var id = (reloadTxtBox.id == '' || reloadTxtBox.id == undefined) ? '' : 'win-id="' + reloadTxtBox.id + '"',
                                url = (reloadTxtBox.pageURL == '' || reloadTxtBox.pageURL == undefined) ? '' : 'win-url="' + reloadTxtBox.pageURL + '"',
                                title = (reloadTxtBox.title == '' || reloadTxtBox.title == undefined) ? '' : 'win-title="' + reloadTxtBox.title + '"',
                                opentype = (reloadTxtBox.openType == '' || reloadTxtBox.openType == undefined) ? '' : 'win-opentype="' + reloadTxtBox.openType + '"',
                                maxOpen = (reloadTxtBox.maxOpen == '' || reloadTxtBox.maxOpen == undefined) ? '' : 'win-maxOpen="' + reloadTxtBox.maxOpen + '"',
                                icon = '<i class="fa fa-user-circle"></i>';
                            queryString += '<li class="winui-desktop-item" ' + id + ' ' + url + ' ' + title + ' ' + opentype + ' ' + maxOpen + '>';
                            queryString += '<div class="winui-icon winui-icon-font">';
                            queryString += icon;
                            queryString += '</div>';
                            queryString += '<p>' + reloadTxtBox.name + '</p>';
                            queryString += '</div>';
                        }
                        $('.winui-desktop').append(queryString);
                        desktopApp.ondblclick(function (id, elem) {
                            OpenWindow(elem);
                        });
                        locaApp()
                    }


                    var arr = [];
                    var oRan = [];
                    var flog = true;
                    for (let i = 0; i < $('#wiNuiDeskTop .winui-desktop-item').length; i++) {
                        arr.push({
                            l: $('#wiNuiDeskTop .winui-desktop-item').eq(i).position().left,
                            t: $('#wiNuiDeskTop .winui-desktop-item').eq(i).position().top
                        })
                    }
                    for (let j = 0; j < $('#wiNuiDeskTop .winui-desktop-item').length; j++) {
                        $('#wiNuiDeskTop .winui-desktop-item').eq(j).css({
                            position: 'absolute',
                            left: arr[j].l + 'px',
                            top: arr[j].t + 'px'
                        })
                    }
                    var posi = {x: 0, y: 0},
                        initPosi = {x: 0, y: 0};
                    $('#wiNuiDeskTop .winui-desktop-item').mousedown(function (ev) {
                        // if(!flog) return;
                        // flog = false;
                        this.x = ev.clientX - $(this).position().left;

                        // console.log($(this).position().left);
                        // console.log(ev.clientX);
                        this.y = ev.clientY - $(this).position().top;

                        posi.x = $(this).position().left;
                        posi.y = $(this).position().top;
                        initPosi.x = $(this).position().left;
                        initPosi.y = $(this).position().top;

                        $(document).mousemove((event) => {
                            $(this).css({
                                left: event.clientX - this.x + 'px',
                                top: event.clientY - this.y + 'px',
                                'z-index': 99
                            })
                            let _index = near($(this));
                            if (_index != -1) {
                                $('#wiNuiDeskTop .winui-desktop-item').css('border', 'none')
                                $('#wiNuiDeskTop .winui-desktop-item').eq(_index).css('border', '1px solid #fff')
                            } else {
                                $('#wiNuiDeskTop .winui-desktop-item').css('border', 'none')
                            }
                            event.preventDefault && event.preventDefault();
                        })
                        $(document).mouseup((event) => {
                            $(document).off('mousemove');
                            $(document).off('mouseup');
                            var atherAreaX = $(this).position().left;
                            var atherAreaY = $(this).position().top;
                            let _index = near($(this));
                            $('#wiNuiDeskTop .winui-desktop-item').css('border', 'none');
                            var taskBarTop = $("#taskbarBox").offset().top,//任务栏距离顶部的距离
                                deskAppTop = $(this).offset().top + 86,//当前拖拽物距离顶部的距离 加拖拽物的高度
                                fixedBar = $('#fixedBar li'),
                                deskAppItem = $('.winui-taskbar-fixedTask-item'),
                                fixedBarTitle = [],
                                fixItemGroup = [];
                            if (_index != -1) {
                                Commutator($(this), $('#wiNuiDeskTop .winui-desktop-item').eq(_index), posi)
                                // return;
                            } else {//-1的情况
                                // $(this).animate({left:posi.x+'px',top:posi.y+'px'});
                                if (deskAppTop > taskBarTop) {//应用已进入任务栏区域
                                    if (fixedBar.length > 0) {
                                        for (var i = 0; i < fixedBar.length; i++) {
                                            fixedBarTitle.push(fixedBar.eq(i).attr('win-title'));
                                        }
                                        var result = $.inArray($(this).attr('win-title'), fixedBarTitle);
                                        if (result === 0) {
                                            locaApp();//已有
                                        } else if (result === -1) {//没有
                                            // $('#fixedBar').append('<li win-id="' + $(ele).attr('win-id') + '" win-url="' + $(ele).attr('win-url') + '" win-title="' + $(ele).attr('win-title') + '" class="winui-taskbar-fixedTask-item"><i class="' + $(ele).find('i')[0].className + '"></i></li>');
                                            $('#fixedBar').append('<li win-maxopen="' + $(this).attr('win-maxopen') + '" win-opentype="' + $(this).attr('win-opentype') + '" win-id="' + $(this).attr('win-id') + '" win-url="' + $(this).attr('win-url') + '" win-title="' + $(this).attr('win-title') + '" class="winui-taskbar-fixedTask-item"><i class="' + $(this).find('i')[0].className + '"></i></li>');
                                            locaApp();
                                        }
                                    } else {
                                        $('#fixedBar').append('<li win-maxopen="' + $(this).attr('win-maxopen') + '" win-opentype="' + $(this).attr('win-opentype') + '" win-id="' + $(this).attr('win-id') + '" win-url="' + $(this).attr('win-url') + '" win-title="' + $(this).attr('win-title') + '" class="winui-taskbar-fixedTask-item"><i class="' + $(this).find('i')[0].className + '"></i></li>');
                                        locaApp();
                                    }
                                } else {
                                    var nowY = hgn(atherAreaY) * 86;//现在应在的格子的Y轴
                                    var nowX = hgn(atherAreaX) * 86;//现在应在的格子的X轴
                                    $(this).animate({left: nowX + 'px', top: nowY+ 'px'});
                                    function hgn(num) { //第几个格子
                                        return Math.round(num / 86);
                                    }
                                    // $(this).animate({left: atherAreaX + 'px', top: atherAreaY + 'px'});
                                }
                            }
                            flog = true;
                            // $(this).animate({left:posi.x+'px',top:posi.y+'px'},function(){
                            //     flog = true;
                            // })
                        })
                    })

                    //  互换位置
                    function Commutator(obj1, obj2, arr) {
                        console.log(arr);
                        obj1.animate({left: obj2.position().left + 'px', top: obj2.position().top + 'px'});
                        obj2.animate({left: arr.x + 'px', top: arr.y + 'px'}, function () {
                            flog = true;
                        })
                    }

                    //  循环检测碰撞
                    function near(obj) {
                        let _index = -1
                        for (let i = 0; i < $('#wiNuiDeskTop .winui-desktop-item').length; i++) {
                            if (obj.index() != i) {
                                if (collision(obj, $('#wiNuiDeskTop .winui-desktop-item').eq(i))) {
                                    _index = i
                                }
                            }
                        }
                        return _index;
                    }

                    // 碰撞检测
                    function collision(obj1, obj2) {
                        var L1 = obj1.position().left;
                        var R1 = L1 + obj1.width();
                        var T1 = obj1.position().top;
                        var B1 = T1 + obj1.height();

                        var L2 = obj2.position().left;
                        var R2 = L2 + obj2.width();
                        var T2 = obj2.position().top;
                        var B2 = T2 + obj2.height();

                        if (R2 < L1 || B2 < T1 || T2 > B1 || L2 > R1) {  // 未碰撞成功的几种情况
                            return false;
                        } else {
                            return true;
                        }
                    }


                    //桌面应用拖拽功能
                    // new Drag('.winui-desktop-item').init({
                    //     isLimit: true,//不限制拖拽范围
                    //     isChangeIndex: true//改变z-index层级 拖拽时移动层在最上边
                    // });

                    var mouseX, mouseY;
                    $(document.body).mousemove(function (e) {
                        mouseX = e.pageX;
                        mouseY = e.pageY;
                        // console.log('当前鼠标的位置在X轴:'+mouseX +' 在Y轴:'+mouseY);
                    });
                    $(document.body).mousedown(function (e) {
                        // alert(e.which);
                        if (e.which == '3') {//当值为3时 当前鼠标事件为鼠标右击事件
                            $('#appDivBox').hide();
                            $('#div').css({
                                'top': mouseY,
                                'left': mouseX,
                                'display': 'block'
                            })
                        }
                    });

                    //任务栏禁止桌面事件继承
                    $('.winui-taskbar').mousedown(
                        function (e) {
                            e.stopPropagation();
                        }
                    );
                    $('.winui-desktop-item').mousedown(
                        function (e) {
                            e.stopPropagation();
                        }
                    );
                    $('.winui-start').mousedown(
                        function (e) {
                            e.stopPropagation();
                        }
                    );


                    //桌面应用点击事件 左键 右键 滑轮
                    // $('.winui-desktop-item').mousedown(function (e) {
                    //     e.stopPropagation();
                    //     if (e.which == '1') {
                    //         //当前鼠标事件为鼠标左击事件
                    //     } else if (e.which == '2') {
                    //         //当前鼠标事件为中间滑轮点击事件
                    //     } else if (e.which == '3') {//当值为3时 当前鼠标事件为鼠标右击事件
                    //         $('#div').hide();
                    //         $('#appDivBox').show();
                    //         $('#appDivBox').css({
                    //             'top': mouseY,
                    //             'left': mouseX
                    //         })
                    //     }
                    // });


                    $(document.body).click(function () {
                        $('#div').hide();
                        $('#appDivBox').hide();
                    });
                    // drag(desktopApp);

                    //桌面刷新功能
                    $('#reloadWin').click(function () {
                        window.location.reload();
                        // desktop.init()  有重载实际  无效果
                    });

                    var createArr = [];//创建新的文件数据
                    var createIndex = 1;//创建新的文件夹的次数
                    function createArrData(ti, ur, id) {
                        var deskAppLen = $('.winui-desktop-item').length;//桌面现有App的长度
                        id = deskAppLen + 1 || '';
                        var oldDateObj = {
                            "title": ti,
                            "pageURL": "lib/winui/html/setting/tsdemo.html",
                            "name": ti,
                            "icon": "fa-user-circle",
                            "openType": 1,
                            "maxOpen": -1,
                            "extend": false,
                            "childs": null,
                            "id": id
                        };
                        window.localStorage.setItem('deskTxtBox', JSON.stringify(oldDateObj));//对数据格式进行存储
                        createArr.push(oldDateObj);
                    }

                    //新建文件夹
                    $('#createNewTxtBox').click(function () {
                        var count = createIndex++;
                        createArrData('文件夹', '', '');
                        localStorage.setItem('createIndex', count);
                        var html = '';
                        for (var i in createArr) {
                            var id = (createArr[i].id == '' || createArr[i].id == undefined) ? '' : 'win-id="' + createArr[i].id + '"',
                                url = (createArr[i].pageURL == '' || createArr[i].pageURL == undefined) ? '' : 'win-url="' + createArr[i].pageURL + '"',
                                title = (createArr[i].title == '' || createArr[i].title == undefined) ? '' : 'win-title="' + createArr[i].title + '"',
                                opentype = (createArr[i].openType == '' || createArr[i].openType == undefined) ? '' : 'win-opentype="' + createArr[i].openType + '"',
                                maxOpen = (createArr[i].maxOpen == '' || createArr[i].maxOpen == undefined) ? '' : 'win-maxOpen="' + createArr[i].maxOpen + '"',
                                icon = '<i class="fa fa-user-circle"></i>';
                            html += '<li class="winui-desktop-item" ' + id + ' ' + url + ' ' + title + ' ' + opentype + ' ' + maxOpen + '>';
                            html += '<div class="winui-icon winui-icon-font">';
                            html += icon;
                            html += '</div>';
                            html += '<p>' + createArr[i].name + '</p>';
                            html += '</div>';
                        }
                        createArr.pop();
                        $('.winui-desktop').append(html);
                        locaApp();
                        // new Drag('.winui-desktop-item').init({
                        //     isLimit: true,
                        //     isChangeIndex: true
                        // });
                        desktopApp.ondblclick(function (id, elem) {
                            OpenWindow(elem);
                        });
                        // $('.winui-taskbar-fixedTask-item').click(function (elem) {
                        //     console.log('1111');
                        //     OpenWindow(elem)
                        // });

                    });


                    //桌面应用排序 按照(名称-字典排序)
                    // sortApps();
                    function sortApps() {
                        var arr = Array();
                        $('.winui-desktop-item p').each(function () {
                            arr.push($(this).text())
                        });
                        arr = sortDeskApp(arr); // 排序后的数组
                        for (var i = 0; i < arr.length; i++) { //把元素重新插一遍
                            $(".winui-desktop").append($('.winui-desktop-item p').eq(i).text(arr[i]).parent().parent());
                        }
                        locaApp();

                        function sortDeskApp(array) { //冒泡排序函数
                            var i = 0, len = array.length,
                                j, d;
                            for (; i < len; i++) {
                                for (j = 0; j < len; j++) {
                                    if (array[i] < array[j]) {
                                        d = array[j];
                                        array[j] = array[i];
                                        array[i] = d;
                                    }
                                }
                            }
                            return array;
                        }
                    }
                }
            }
            //菜单配置
            , menu: {
                config: {
                    url: '/json/allmenu.json' //菜单数据接口地址
                    , method: 'get'
                    , data: {nihaoa: ''}
                }
                , done: function (menuItem) {
                    //监听开始菜单点击
                    menuItem.onclick(function (elem) {
                        OpenWindow(elem);
                    });


                    menuItem.contextmenu({
                        item: [{
                            icon: 'fa-cog'
                            , text: '设置'
                        }, {
                            icon: 'fa-close'
                            , text: '关闭'
                        }, {
                            icon: 'fa-qq'
                            , text: '右键菜单可自定义'
                        }],
                        item1: function (id, elem) {
                            //设置回调
                            console.log(id);
                            console.log(elem);
                        },
                        item2: function (id, elem) {
                            //关闭回调
                        },
                        item3: function (id, elem) {
                            winui.window.msg('自定义回调');
                        }
                    });
                    // console.log(menuItem)
                    //菜单加载完毕回调
                    // menuItem.onclick(function (elem) {
                    //     console.log('发生点击');
                    //     // OpenWindow(elem)
                    // })
                }
            }
        });


        //WinAdmin初始化
        winui.init({
            audioPlay: false, //是否播放音乐
            renderBg: true //是否渲染背景图
        }, function () {
            //WinAdmin初始化完毕回调
        });

    });


    //开始菜单磁贴点击
    $('.winui-tile').on('click', function (e) {
        e.stopPropagation();
        OpenWindow(this);
    });
    //开始菜单左侧主题按钮点击
    $('.winui-start-item.winui-start-individuation').on('click', function (e) {
        e.stopPropagation();
        winui.window.openTheme();
    });

    //注销登录
    $('.logout').on('click', function (e) {
        e.stopPropagation();
        winui.hideStartMenu();
        winui.window.confirm('确认注销吗?', {icon: 3, title: '提示'}, function (index) {
            winui.window.msg('执行注销操作，返回登录界面');
            layer.close(index);
        });
    });

    // 判断是否显示锁屏（这个要放在最后执行）
    if (window.localStorage.getItem("lockscreen") == "true") {
        winui.lockScreen(function (password) {
            //模拟解锁验证
            if (password === 'winadmin') {
                return true;
            } else {
                winui.window.msg('密码错误', {shift: 6});
                return false;
            }
        });
    }

    window.Drag = function Drag(cls) {
        this.obj = Array.prototype.slice.call(document.querySelectorAll(cls));
        this.win_w = document.documentElement.clientWidth || document.body.clientWidth;
        this.win_h = document.documentElement.clientHeight || document.body.clientHeight;
    };
    Drag.prototype.init = function (user_config) {
        //默认参数
        var defaults = {
            isLimit: false,
            isChangeIndex: false
        };
        this.config = this.extend(defaults, user_config);
        var _this = this;
        for (var i = 0; i < this.obj.length; i++) {
            (function (i) {
                _this.obj[i].onmousedown = function () {
                    this.disX;
                    this.disY;
                    var pos = document.defaultView.getComputedStyle(_this.obj[i], false).Position;
                    if (!pos || pos.toLowerCase() == 'static') {
                        _this.obj[i].style.position = 'absolute'
                    }
                    ;
                    var e = e || window.event;
                    _this.mousedown(_this.obj[i], e);
                    return false
                }
            })(i);
        }
    };
    Drag.prototype.extend = function (a, b) {
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    };
    Drag.prototype.mousedown = function (ele, e) {
        var _this = this;
        var e = e || window.event;
        this.disX = e.offsetX;
        this.disY = e.offsetY;
        if (this.config.isChangeIndex) {
            for (var i = 0; i < this.obj.length; i++) {
                this.obj[i].style.zIndex = 'auto'
            }
            ele.style.zIndex = 100;
        }
        document.onmousemove = function (e) {
            // $('.winui-taskbar').css('zIndex', '0');  //拖拽的时候将底部任务栏zIndex降到最低
            var e = e || window.event;
            _this.mousemove(ele, e);
        };
        document.onmouseup = function (e) {
            var e = e || window.event;
            _this.mouseup(ele, e)
        }
    }
    Drag.prototype.mousemove = function (ele, e) {
        var l = e.clientX - this.disX;
        var t = e.clientY - this.disY;
        if (this.config.isLimit) {
            var w = this.win_w - ele.offsetWidth;
            var h = this.win_h - ele.offsetHeight;
            ele.style.left = l <= 0 ? 0 : (l > w ? (w + 'px') : (l + 'px'));
            ele.style.top = t <= 0 ? 0 : (t >= h ? (h + 'px') : (t + 'px'));
        } else {
            ele.style.left = l + 'px';
            ele.style.top = t + 'px';
        }
    }
    Drag.prototype.mouseup = function (ele, e) {
        var taskBarTop = $("#taskbarBox").offset().top,//任务栏距离顶部的距离
            deskAppTop = $(ele).offset().top + 76,//当前拖拽物距离顶部的距离 加拖拽物的高度
            fixedBar = $('#fixedBar li'),
            deskAppItem = $('.winui-taskbar-fixedTask-item'),
            fixedBarTitle = [],
            fixItemGroup = [];
        if (deskAppTop > taskBarTop) {//应用已进入任务栏区域
            if (fixedBar.length > 0) {
                for (var i = 0; i < fixedBar.length; i++) {
                    fixedBarTitle.push(fixedBar.eq(i).attr('win-title'));
                }
                var result = $.inArray($(ele).attr('win-title'), fixedBarTitle);
                if (result === 0) {
                    locaApp();//已有
                } else if (result === -1) {//没有
                    // $('#fixedBar').append('<li win-id="' + $(ele).attr('win-id') + '" win-url="' + $(ele).attr('win-url') + '" win-title="' + $(ele).attr('win-title') + '" class="winui-taskbar-fixedTask-item"><i class="' + $(ele).find('i')[0].className + '"></i></li>');
                    $('#fixedBar').append('<li win-maxopen="' + $(ele).attr('win-maxopen') + '" win-opentype="' + $(ele).attr('win-opentype') + '" win-id="' + $(ele).attr('win-id') + '" win-url="' + $(ele).attr('win-url') + '" win-title="' + $(ele).attr('win-title') + '" class="winui-taskbar-fixedTask-item"><i class="' + $(ele).find('i')[0].className + '"></i></li>');
                    locaApp();
                }
            } else {
                $('#fixedBar').append('<li win-maxopen="' + $(ele).attr('win-maxopen') + '" win-opentype="' + $(ele).attr('win-opentype') + '" win-id="' + $(ele).attr('win-id') + '" win-url="' + $(ele).attr('win-url') + '" win-title="' + $(ele).attr('win-title') + '" class="winui-taskbar-fixedTask-item"><i class="' + $(ele).find('i')[0].className + '"></i></li>');
                locaApp();
            }
        }
        $('.winui-taskbar-fixedTask-item').click(function (ele) {
            for (var i = 0; i < deskAppItem.length; i++) {
                fixItemGroup.push(deskAppItem.eq(i).innerText);
            }
            var _selfArr = $.inArray($(this).attr('win-title'), deskAppItem);
            // $('.winui-desktop-item')[$('.winui-desktop-item').find($(this).attr('win-title'))].trigger('dblclick');
            $('.winui-desktop-item').find($(this).attr('win-title')).trigger('dblclick');
            // console.log($('.winui-desktop-item').find($(this).attr('win-title')));
            // if(_selfArr === 0){
            //
            // }else if(_selfArr === -1){
            //
            // }
            // console.log($(this).attr('win-title'));
            // // $('.winui-taskbar-fixedTask-item').find($(this).attr('win-title')).trigger('dblclick');
            // for (var i = 0; i < fixedBar.length; i++) {
            //     fixedBarTitle.push(fixedBar.eq(i).attr('win-title'));
            // }
            //
            // // OpenWindow(elem)
        });

        document.onmousedown = null;
        document.onmousemove = null;
        document.onmouseup = null;
        if (this.config.isChangeIndex) {
            ele.style.zIndex = 100;
        }
        return false
    };
    //继承出LimitDrag
    // 限制范围拖拽
    window.LimitDrag = function LimitDrag(cls) {
        Drag.call(this, cls)
    }
    LimitDrag.prototype = new Drag();
    LimitDrag.prototype.constructor = LimitDrag;
    //限制范围
    LimitDrag.prototype.mousemove = function (ele, e) {

        var l = e.clientX - this.disX;
        var t = e.clientY - this.disY;
        var w = this.win_w - ele.offsetWidth;
        var h = this.win_h - ele.offsetHeight;

        ele.style.left = l <= 0 ? 0 : (l > w ? (w + 'px') : (l + 'px'));

        ele.style.top = t <= 0 ? 0 : (t >= h ? (h + 'px') : (t + 'px'));

        ele.style.zIndex = 100;
    }


    //打开窗口的方法
    function OpenWindow(menuItem) {
        var $this = $(menuItem);
        console.log($this);
        var url = $this.attr('win-url');
        var title = $this.attr('win-title');
        var id = $this.attr('win-id');
        var type = parseInt($this.attr('win-opentype'));
        var maxOpen = parseInt($this.attr('win-maxopen')) || -1;
        if (url == 'theme') {
            winui.window.openTheme();
            return;
        }
        if (!url || !title || !id) {
            winui.window.msg('菜单配置错误（菜单链接、标题、id缺一不可）');
            return;
        }

        var content;
        if (type === 1) {
            $.ajax({
                type: 'get',
                url: url,
                async: false,
                success: function (data) {
                    content = data;
                },
                error: function (e) {
                    var page = '';
                    switch (e.status) {
                        case 404:
                            page = '404.html';
                            break;
                        case 500:
                            page = '500.html';
                            break;
                        default:
                            content = "打开窗口失败";
                    }
                    $.ajax({
                        type: 'get',
                        url: 'views/error/' + page,
                        async: false,
                        success: function (data) {
                            content = data;
                        },
                        error: function () {
                            layer.close(load);
                        }
                    });
                }
            });
        } else {
            content = url;
        }
        //核心方法（参数请看文档，config是全局配置 open是本次窗口配置 open优先级大于config）
        winui.window.config({
            anim: 0,
            miniAnim: 0,
            maxOpen: -1
        }).open({
            id: id,
            type: type,
            title: title,
            content: content
            , maxOpen: maxOpen
        });
    }


    //定位桌面应用
    function locaApp() {
        //计算一竖排能容纳几个应用
        var appHeight = 96;
        var appWidth = 90;
        var maxCount = parseInt($('.winui-desktop').height() / 93);
        var oldTemp = 0;
        var rowspan = 0;
        var colspan = 0;
        //定位桌面应用
        $('.winui-desktop>.winui-desktop-item').each(function (index, elem) {
            var newTemp = parseInt(index / maxCount);

            colspan = parseInt(index / maxCount);
            rowspan = oldTemp == newTemp ? rowspan : 0;

            if (rowspan == 0 && oldTemp != newTemp) oldTemp++;

            $(this).css('top', appHeight * rowspan + 'px').css('left', appWidth * colspan + 'px');
            rowspan++;
        });
    }

    exports('index', {});
});