function drag(elem) {
    var disX,
        disY;
    elem.addEventListener(mousedown, function(e){
        var event=e || window.event;
//说明 事件是外部 传进来的 ？？
//获取到 事件
        disX=event.clientX-parseInt(getStyle(elem, 'left'));
        dixY=event.clientY-parseInt(getStyle(elem, 'right'));
//求鼠标 和 左上角距离
        document.addEventListener('mousemove', mouseMove, false);
        document.addEventListener('mouseup', mouseUp, false);
//在 mousedown里 监听mousemove 和 mouseup两个事件
        stopBubble(event);
        cancelHandler(event);
//取消默认行为 和 冒泡事件
    },false )
}


function mouseMove(e){
    var event = e||window.event;
    elem.style.left=event.clientX - disX + 'px';
    elem.style.top=event.clientY - disY + 'px';
}
//mouseMove 函数 实时求出 元素的位置

function mouseUp(e){
    var event = e||window.event;
    document.removeEventListener("mousemove",mouseMove,false);
    document.removeEventListener("mouseup",mouseUP,false);
}
//mouseUP函数 取消 mousemove 和 mouseup

function getStyle(elem, prop){
    if(window.getComputedStyle){
        return window.getComputedStyle(elem, null)[prop];
    }else{
        return elem.getCurrentStyle[prop];
    }
}