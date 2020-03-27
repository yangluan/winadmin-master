
layui.config({
    base: './lib/winui/' //指定 winui 路径
    , version: '1.0.0-beta'
}).extend({  //指定js别名
    window: 'js/winui.window',
    desktop: 'js/winui.desktop',
    start: 'js/winui.start',
    // helper: 'js/winui.helper'  'helper'
}).define(['window', 'desktop', 'start','form'], function (exports) {
    //加载winui模块后,winui将会作为全局对象存在
    //使用desktop、window、start模块后，winui对象将会增加desktop、window、menu三个属性
    var $ = layui.jquery
        , form = layui.form
        , winLayer = winui.window
        , desktop = winui.desktop
        , menu = winui.menu
        , MOVE = '.layui-layer-title';

    //开始使用
    $(function () {
        //自定义验证规则
        form.verify({
            title: function(value){
                if(value.length == 0){
                    return '输入为空，请重新输入';
                }else if(value.length < 5){
                    return '你输入的设备码不存在，请重新输入';
                }else if(value.length == 7){
                    return '你输入的设备码已经被绑定，请重新输入';
                }
            }
            ,content: function(value){
                layedit.sync(editIndex);
            }
        });
       //监听提交
        form.on('submit(demo1)', function(data){
            layer.confirm('请确定该手机号码将成为该设备的超级管理员', {
                btn: ['取消', '确定'] //可以无限个按钮
            }, function(index, layero){
                //按钮【按钮一】的回调
            }, function(index){
                //按钮【按钮二】的回调
            });
            return false;
        });

    })});








