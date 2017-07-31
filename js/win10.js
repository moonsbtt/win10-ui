/**
 * Created by Yuri2 on 2017/7/10.
 */
var Win10 = {
    _bgs:{
        main:'',
        mobile:'',
    },
    _countTask: 0,
    _newMsgCount:0,
    _animated_classes:[],
    _animated_liveness:0,
    _switchMenuTooHurry:false,
    _lang:'unknown',
    _iframeOnClick :{
        resolution: 200,
        iframes: [],
        interval: null,
        Iframe: function() {
            this.element = arguments[0];
            this.cb = arguments[1];
            this.hasTracked = false;
        },
        track: function(element, cb) {
            this.iframes.push(new this.Iframe(element, cb));
            if (!this.interval) {
                var _this = this;
                this.interval = setInterval(function() { _this.checkClick(); }, this.resolution);
            }
        },
        checkClick: function() {
            if (document.activeElement) {
                var activeElement = document.activeElement;
                for (var i in this.iframes) {
                    if (activeElement === this.iframes[i].element) { // user is in this Iframe
                        if (this.iframes[i].hasTracked == false) {
                            this.iframes[i].cb.apply(window, []);
                            this.iframes[i].hasTracked = true;
                        }
                    } else {
                        this.iframes[i].hasTracked = false;
                    }
                }
            }
        }
    },
    _renderBar:function () {
      //调整任务栏项目的宽度
        if(this._countTask<=0){return;} //防止除以0
        var btns=$("#win10_btn_group_middle>.btn");
        btns.css('width',('calc('+(1/this._countTask*100)+'% - 1px )'))
    },
    _handleReady:function () {},
    _hideShotcut:function () {
        var that=$("#win10 #win10-shortcuts .shortcut");
        that.removeClass('animated flipInX');
        that.addClass('animated flipOutX');
    },
    _showShotcut:function () {
        var that=$("#win10 #win10-shortcuts .shortcut");
        that.removeClass('animated flipOutX');
        that.addClass('animated flipInX');
    },
    _checkBgUrls:function () {
        var loaders=$('#win10>.img-loader');
        var flag=false;
        if(Win10.isSmallScreen()){
                if(Win10._bgs.mobile){
                    loaders.each(function () {
                        var loader=$(this);
                        if(loader.attr('src')===Win10._bgs.mobile && loader.hasClass('loaded')){
                            Win10._setBackgroundImg(Win10._bgs.mobile);
                            flag=true;
                        }
                    });
                    if(!flag){
                        //没找到加载完毕的图片
                        var img=$('<img class="img-loader" src="'+Win10._bgs.mobile+'" />');
                        $('#win10').append(img);
                        Win10._onImgComplete(img[0],function () {
                            img.addClass('loaded');
                            Win10._setBackgroundImg(Win10._bgs.mobile);
                        })
                    }
                }
            }else{
                if(Win10._bgs.main){
                    loaders.each(function () {
                        var loader=$(this);
                        if(loader.attr('src')===Win10._bgs.main && loader.hasClass('loaded')){
                            Win10._setBackgroundImg(Win10._bgs.main);
                            flag=true;
                        }
                    });
                    if(!flag){
                        //没找到加载完毕的图片
                        var img=$('<img class="img-loader" src="'+Win10._bgs.main+'" />');
                        $('#win10').append(img);
                        Win10._onImgComplete(img[0],function () {
                            img.addClass('loaded');
                            Win10._setBackgroundImg(Win10._bgs.main);
                        })
                    }
                }
        }

    },
    setBgUrl:function (bgs) {
        this._bgs=bgs;
        this._checkBgUrls();
    },
    menuClose: function () {
        $("#win10-menu").removeClass('opened');
        $("#win10-menu").addClass('hidden');
        this._showShotcut();
        $(".win10-open-iframe").removeClass('hide');
    },
    menuOpen: function () {
        $("#win10-menu").addClass('opened');
        $("#win10-menu").removeClass('hidden');
        this._hideShotcut();
        $(".win10-open-iframe").addClass('hide');
    },
    menuToggle: function () {
        if(!$("#win10-menu").hasClass('opened')){
            this.menuOpen();
        }else{
            this.menuClose();
        }
    },
    commandCenterClose: function () {
        $("#win10_command_center").addClass('hidden_right');
        this._showShotcut();
        $(".win10-open-iframe").removeClass('hide');
    },
    commandCenterOpen: function () {
        $("#win10_command_center").removeClass('hidden_right');
        this._hideShotcut();
        $(".win10-open-iframe").addClass('hide');
        $("#win10-msg-nof").removeClass('fa-commenting-o');
    },
    renderShortcuts:function () {
        var h=parseInt($("#win10 #win10-shortcuts")[0].offsetHeight/100);
        var x=0,y=0;
        $("#win10 #win10-shortcuts .shortcut").each(function () {
            $(this).css({
                left:x*82+10,
                top:y*100+10,
            });
            y++;
            if(y>=h){
                y=0;
                x++;
            }
        });
    },
    renderMenuBlocks:function () {
        var cell_width=44;
        var groups=$("#win10-menu .menu_group");
        groups.each(function () {
            var group=$(this);
            var blocks=group.children('.block');
            var max_height=0;
            blocks.each(function () {
                var that=$(this);
                var loc=that.attr('loc').split(',');
                var size=that.attr('size').split(',');
                var top=(loc[1]-1)*cell_width+40;
                var height=size[1]*cell_width;
                var full_height=top+height;
                if (full_height>max_height){max_height=full_height}
                that.css({
                    top:top,
                    left:(loc[0]-1)*cell_width,
                    width:size[0]*cell_width,
                    height:height,
                })

            });
            group.css('height',max_height);
        });
    },
    commandCenterToggle: function () {
        if($("#win10_command_center").hasClass('hidden_right')){
            this.commandCenterOpen();
        }else{
            this.commandCenterClose();
        }
    },
    newMsg: function (title, content,handle_click) {
        var e = $('<div class="msg">' +
            '<div class="title">' + title +'</div>'+
            '<div class="content">' + content + '</div>' +
            '<span class="btn_close_msg fa fa-close"></span>' +
            '</div>');
        $("#win10_command_center .msgs").prepend(e);
        e.find('.content:first,.title:first').click(function () {
            if(handle_click){
                handle_click(e);
            }
        });
        layer.tips(Win10.lang('新消息:','New message:')+title, '#win10_btn_command', {
            tips: [1, '#3c6a4a'],
            time: 3000
        });
        if($("#win10_command_center").hasClass('hidden_right')){
            $("#win10-msg-nof").addClass('fa-commenting-o');
        }
    },
    getLayeroByIndex: function (index) {
        return $('#' + 'layui-layer' + index)
    },
    isSmallScreen: function (size) {
        if (!size) {
            size = 768
        }
        var width = document.body.clientWidth;
        return width < size;
    },
    enableFullScreen: function () {
        var docElm = document.documentElement;
        //W3C
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        //FireFox
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        //Chrome等
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
        //IE11
        else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    },
    disableFullScreen: function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    },
    _setBackgroundImg:function (img) {
        $('#win10').css('background-image','url('+img+')')
    },
    settop:function (layero) {
        if(!isNaN(layero)){
            layero=this.getLayeroByIndex(layero);
        }
        //置顶窗口
        var max_zindex=0;
        $(".win10-open-iframe").each(function () {
            z=parseInt($(this).css('z-index'));
            $(this).css('z-index',z-1);
            if(z>max_zindex){max_zindex=z;}
        });
        layero.css('z-index',max_zindex+1);
    },
    checkTop:function () {
        var max_index=0,max_z=0,btn=null;
        $("#win10_btn_group_middle .btn.show").each(function () {
            var index=$(this).attr('index');
            var layero=Win10.getLayeroByIndex(index);
            var z=layero.css('z-index');
            if(z>max_z){
                max_index=index;
                max_z=z;
                btn=$(this);
            }
        });
        this.settop(max_index);
        $("#win10_btn_group_middle .btn").removeClass('active');
        if(btn){
            btn.addClass('active');
        }
    },
    buildList:function () {
        $("#win10-menu .list .sub-item").slideUp();
        $("#win10-menu .list .item").each(function () {
            if($(this).next().hasClass('sub-item')){
                $(this).addClass('has-sub-down');
                $(this).removeClass('has-sub-up');
            }
        })
    },
    openUrl: function (url, title,max) {
        if(this._countTask>12){
            layer.msg("您打开的太多了，歇会儿吧~");
            return false;
        }else{
            this._countTask++;
        }
        url=url.replace(/(^\s*)|(\s*$)/g, "");
        var preg=/^(https?:\/\/|\.\.?\/|\/\/)/;
        if(!preg.test(url)){
            url='http://'+url;
        }
        if (!url) {
            url = '//yuri2.cn';
        }
        if (!title) {
            title = url;
        }
        if (this.isSmallScreen() || max) {
            area = ['100%', (document.body.clientHeight - 40) + 'px'];
            offset = ['0', '0'];
        } else {
            area = ['80%', '80%'];
            var topset, leftset;
            topset = parseInt($(window).height());
            topset = (topset - (topset * 0.8)) / 2 - 41;
            leftset = parseInt($(window).width());
            leftset = (leftset - (leftset * 0.8)) / 2 - 120;
            offset = [Math.round((this._countTask % 10 * 20) + topset) + 'px', Math.round((this._countTask % 10 * 20 + 100) + leftset) + 'px'];
        }
        var index = layer.open({
            type: 2,
            shadeClose: true,
            shade: false,
            maxmin: true, //开启最大化最小化按钮
            title: title,
            content: url,
            area: area,
            offset: offset,
            isOutAnim: false,
            skin:'win10-open-iframe',
            cancel: function (index, layero) {
                $("#win10_" + index).remove();
                Win10.checkTop();
                Win10._countTask--;//回退countTask数
                Win10._renderBar();
            },
            min: function (layero) {
                layero.hide();
                $("#win10_" + index).removeClass('show');
                Win10.checkTop();
                return false;
            },
            full:function (layero) {
                layero.find('.layui-layer-min').css('display','inline-block');
            },
        });
        $('#win10_btn_group_middle .btn.active').removeClass('active');
        var btn = $('<div id="win10_' + index + '" index="' + index + '" class="btn show active"><div class="btn_title">' + title + '</div><div class="btn_close fa fa-close"></div></div>');
        var layero_opened=Win10.getLayeroByIndex(index);
        layero_opened.css('z-index',Win10._countTask+813);
        Win10.settop(layero_opened);
        layero_opened.find('.layui-layer-setwin').prepend('<a class="win10-btn-change-url" index="' + index + '" href="#"><span class="fa fa-chain"></span></a><a class="win10-btn-refresh" index="' + index + '" href="#"><span class="fa fa-refresh"></span></a>');
        layero_opened.find('.layui-layer-setwin .layui-layer-max').click(function () {
            setTimeout(function () {
                var height=layero_opened.css('height');
                height=parseInt(height.replace('px',''));
                if (height>=document.body.clientHeight){
                   layero_opened.css('height',height-40);
                   layero_opened.find('.layui-layer-content').css('height',height-83);
                   layero_opened.find('.layui-layer-content iframe').css('height',height-83);
                }
            },300);

        });
        $("#win10_btn_group_middle").append(btn);
        Win10._renderBar();
        btn.click(function () {
            var index = $(this).attr('index');
            var layero = Win10.getLayeroByIndex(index);
            var settop=function () {
                //置顶窗口
                var max_zindex=0;
                $(".win10-open-iframe").each(function () {
                    z=parseInt($(this).css('z-index'));
                    $(this).css('z-index',z-1);
                    if(z>max_zindex){max_zindex=z;}
                });
                layero.css('z-index',max_zindex+1);
            };
            if ($(this).hasClass('show')) {
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    $(this).removeClass('show');
                    Win10.checkTop();
                    layero.hide();
                }else{
                    $('#win10_btn_group_middle .btn.active').removeClass('active');
                    $(this).addClass('active');
                    Win10.settop(layero);
                }
            } else {
                $(this).addClass('show');
                $('#win10_btn_group_middle .btn.active').removeClass('active');
                $(this).addClass('active');
                Win10.settop(layero);
                layero.show();
                // layero.find('.layui-layer-resize').click();
            }
        });
        Win10._iframeOnClick.track(layero_opened.find('iframe:first')[0], function() {
            Win10.settop(layero_opened);
            Win10.checkTop(); });
        this.menuClose();
        this.commandCenterClose();
        return index;
    },
    closeAll: function() {
        $(".win10-open-iframe").remove();
        $("#win10_btn_group_middle").html("");
        Win10._countTask = 0;
        Win10._renderBar();
    },
    setAnimated:function (animated_classes,animated_liveness) {
        this._animated_classes=animated_classes;
        this._animated_liveness=animated_liveness;
    },
    exit:function () {
        document.body.onbeforeunload = function(){};
        window.close();
    },
    lang:function (cn,en) {
        return this._lang==='zh-cn'||this._lang==='zh-tw'?cn:en;
    },
    aboutUs: function() {
        //关于我们
        layer.open({
            type: 1,
            closeBtn: 1, //不显示关闭按钮
            anim: 2,
            skin: 'layui-layer-molv',
            title: 'win10-ui v1.1.170731',
            shadeClose: true, //开启遮罩关闭
            area: ['420px', '240px'], //宽高
            content: '<div style=\'padding: 10px\'>' +
            '<p>支持组件:layer、jquery、animated.css、font-awesome</p>' +
            '<p>尤里2号©版权所有</p>' +
            '<p>作者邮箱:yuri2peter@qq.com</p>' +
            '</div>'
        });
    },
    _startAnimate:function () {
        setInterval(function () {
            var classes_lenth=Win10._animated_classes.length;
            var animated_liveness=Win10._animated_liveness;
            if(animated_liveness===0 || classes_lenth===0 || !$("#win10-menu").hasClass('opened')){return;}
            $('#win10-menu>.blocks>.menu_group>.block').each(function () {
                if(!$(this).hasClass('onAnimate') && Math.random()<=animated_liveness){
                    var that=$(this);
                    var class_animate = Win10._animated_classes[Math.floor((Math.random()*classes_lenth))];
                    that.addClass('onAnimate');
                    setTimeout(function () {
                        that.addClass(class_animate);
                        setTimeout(function () {
                            that.removeClass('onAnimate');
                            that.removeClass(class_animate);
                        },3000);
                    },Math.random()*2*1000)
                }
            })
        },1000);
    },
    _onImgComplete:function (img, callback) {
        if(!img){return;}
        var timer = setInterval(function() {
            if (img.complete) {
                callback(img);
                clearInterval(timer);
            }
        }, 50)
    },
    _init:function () {

        //获取语言
        this._lang=(navigator.language || navigator.browserLanguage).toLowerCase();

        $("#win10_btn_win").click(function () {
            Win10.commandCenterClose();
            Win10.menuToggle();
        });
        $("#win10_btn_command").click(function () {
            Win10.menuClose();
            Win10.commandCenterToggle();
        });
        $("#win10 .desktop").click(function () {
            Win10.menuClose();
            Win10.commandCenterClose();
        });
        $('#win10').on('click',".msg .btn_close_msg", function () {
            var msg = $(this).parent();
            $(msg).addClass('animated slideOutRight');
            setTimeout(function () {
                msg.remove()
            }, 500)
        });
        $('#win10_btn_command_center_clean_all').click(function () {
            var msgs=$('#win10_command_center .msg');
            msgs.addClass('animated slideOutRight');
            setTimeout(function () {
                msgs.remove()
            }, 1500);
            setTimeout(function () {
                Win10.commandCenterClose();
            }, 1000);
        });
        $("#win10_btn_show_desktop").click(function () {
            $("#win10 .desktop").click();
            $('#win10_btn_group_middle>.btn.show').each(function () {
                var index = $(this).attr('index');
                var layero = Win10.getLayeroByIndex(index);
                $(this).removeClass('show');
                $(this).removeClass('active');
                layero.hide();
            })
        });
        $("#win10-menu-switcher").click(function () {
            if(Win10._switchMenuTooHurry){return;}
            Win10._switchMenuTooHurry=true;
            var class_name='win10-menu-hidden';
            var list=$("#win10-menu>.list");
            var blocks=$("#win10-menu>.blocks");
            var toggleSlide=function (obj) {
                if(obj.hasClass(class_name)){
                    obj.addClass('animated slideInLeft');
                    obj.removeClass('animated slideOutLeft');
                    obj.removeClass(class_name);
                }else{
                    setTimeout(function () {
                        obj.addClass(class_name);
                    },450);
                    obj.addClass('animated slideOutLeft');
                    obj.removeClass('animated slideInLeft');
                }
            };
            toggleSlide(list);
            toggleSlide(blocks);
            setTimeout(function () {
                Win10._switchMenuTooHurry=false;
            },520)
        });
        $("#win10_btn_group_middle").click(function () {
            $("#win10 .desktop").click();
        });
        $(document).on('click', '.win10-btn-refresh', function () {
            var index = $(this).attr('index');
            var iframe = Win10.getLayeroByIndex(index).find('iframe');
            iframe.attr('src', iframe.attr('src'));
        });
        $(document).on('click', '.win10-btn-change-url', function () {
            var index = $(this).attr('index');
            var iframe = Win10.getLayeroByIndex(index).find('iframe');
            layer.prompt({
                title: Win10.lang('编辑网址','Edit URL'),
                formType: 2,
                skin:'win10-layer-open-browser',
                value: iframe.attr('src'),
                area: ['500px', '200px'],
                zIndex:99999999999
            }, function (value, i) {
                layer.close(i);
                iframe.attr('src', value);
            });
        });
        $(document).on('mousedown','.win10-open-iframe',function () {
            var layero=$(this);
            Win10.settop(layero);
            Win10.checkTop();
        });
        $('#win10_btn_group_middle').on('click','.btn_close',function () {
            var index = $(this).parent().attr('index') ;
            Win10.getLayeroByIndex(index).remove();
            $(this).parent().remove();
            Win10._countTask--;
            Win10._renderBar();
        });
        $('#win10-menu .list').on('click','.item',function () {
            var e=$(this);
            while (e.next().hasClass('sub-item')){
                e.toggleClass('has-sub-down');
                e.toggleClass('has-sub-up');
                e.next().slideToggle();
                e=e.next();
            }
        });
        $("#win10-btn-browser").click(function () {
            layer.prompt({
                title: Win10.lang('访问网址','Visit URL'),
                formType: 2,
                value: '',
                skin:'win10-layer-open-browser',
                area: ['300px', '150px'],
                zIndex:99999999999
            }, function (value, i) {
                layer.close(i);
                Win10.openUrl(value)
            });
        });
        setInterval(function () {
            var myDate = new Date();
            var year=myDate.getFullYear();
            var month=myDate.getMonth()+1;
            var date=myDate.getDate();
            var hours=myDate.getHours();
            var mins=myDate.getMinutes();if (mins<10){mins='0'+mins}
            $("#win10_btn_time").html(hours+':'+mins+'<br/>'+year+'/'+month+'/'+date);
        },1000);
        //离开前警告
        document.body.onbeforeunload = function(){
            window.event.returnValue = Win10.lang( '系统可能不会保存您所做的更改','The system may not save the changes you have made.');
        };
        Win10.buildList();//预处理左侧菜单
        Win10._startAnimate();//动画处理
        Win10.renderShortcuts();//渲染图标
        $("#win10-shortcuts").removeClass('shortcuts-hidden');//显示图标
        Win10.renderMenuBlocks();//渲染磁贴
        Win10._showShotcut();//显示磁贴
        //窗口改大小，重新渲染
        $(window).resize(function() {
            Win10.renderShortcuts();
            Win10._checkBgUrls();
        });
        //细节
        $(document).on('focus',".win10-layer-open-browser textarea",function () {
            $(this).attr('spellcheck','false');
        });
        $(document).on('keyup',".win10-layer-open-browser textarea",function (e) {
            if(e.keyCode===13){
                $(this).parent().parent().find('.layui-layer-btn0').click();
            }
        });
        //打广告
        setTimeout(function () {
            console.log(Win10.lang('本页由Win10-UI强力驱动\n更多信息：http://win10ui.yuri2.cn \nWin10-UI,轻松打造别具一格的后台界面 ','The page is strongly driven by Win10-UI.\nFor more info: http://win10ui.yuri2.cn.\n Win10-UI, easy to create a unique background interface.'))
        },2000);
    },
    onReady:function (handle) {
        Win10._handleReady=handle;
    }
};


$(function () {
    Win10._init();
    Win10._handleReady();
});