//index.js
//获取应用实例
const app = getApp()
var wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;
var AnimationFrame = require("../../utils/wxdraw.min.js").AnimationFrame;


Page({
  data: {
    wxCanvas: null,
  //圆圈的数组
   canvaswidth:0,
   canvasheight:0,
   btnrect:null

  },
 
  shape:[],
  //事件处理函数
  bindtouchstart: function (e) {


    this.wxCanvas.touchstartDetect(e);

  },
  bindtouchmove: function (e) {
    
    this.wxCanvas.touchmoveDetect(e);
  },
  bindtouchend: function () {

    this.wxCanvas.touchendDetect();
  },
  bindtap: function (e) {
    console.log(e);
    this.wxCanvas.tapDetect(e);
  },
  bindlongpress: function (e) {
    console.log(e);
    this.wxCanvas.longpressDetect(e);
  },
  onLoad: function (options) {
   var query=wx.createSelectorQuery();
   let  that=this;
    query.select(".btn").boundingClientRect();
    query.select(".mycanvas").boundingClientRect();
    query.exec(function (rect) {
      //拿到canvas的宽高 

      console.log(rect);
      that.setData({
        canvaswidth: rect[1].width,
        canvasheight: rect[1].height,
        btnrect:rect[0]
      });
      var context = wx.createCanvasContext('first');
      that.wxCanvas = new wxDraw(context, 0, 0, rect[1].width, rect[1].height);
      //初始化中间的button
      //初始化3个的位置。在中间位置靠下初始化
      that.addPicToScreen(rect[1].width / 2, rect[1].height / 2 + 40);
      //然后要进行位置的更新从初始化位置更新

    });



  
  },
 
  /**
   * 动态添加图标初始化始终保持三个小浮标
   * 初始化的位置统一放在同一个位置，然后更新位置。
   */

  addPicToScreen(x,y){
    let that = this;
    let wxcan = that.wxCanvas;

   
    that.shape = [];
    for (let i = 0; i < 3; i++) {
      let position=i;
      let img = new Shape('image', { x: x, y: y, w: 50, h: 50, file: "../../image/nl.png", opacity:0}, 'fill', false);
      let text = new Shape('text', {
        x: x - 15, y: y + 25, text: "碎片+" + i, fontSize: 10, opacity: 0,
        algin: "center",
        fillStyle: "#E6781E"
      }, 'fill', false);
      wxcan.add(img);
      wxcan.add(text);
      img.bind('touchstart', function () {
        //清楚全部然后再来
        that.updateSinger({img,text});
    
      });   
      that.shape[i]={img,text};  
    }
  
    that.updatePosition();
    
  },
   /**
    * 指定范围内更新位置
    */
  updatePosition:function(){
    let that = this;
    let width = this.data.canvaswidth;
    let height = this.data.canvasheight;
    for(let i=0;i<3;i++){
     let nowx=Math.random()*(width-80)+40;
     let nowy=Math.random()*(height-80)+20;
     //避免生成的位置在button的区域，遮挡button
      if (nowx >= that.data.btnrect.left && nowx <= that.data.btnrect.right){
        //在此区域重新赋值
        if (nowx - that.data.btnrect.left > that.data.btnrect.right-nowx){
         //偏右，那么往右边移除去
          nowx = nowx + that.data.btnrect.right - nowx + Math.random() *80;

       }else{
         //偏左
          nowx = nowx - (that.data.btnrect.left - nowx) -  Math.random() * 80;;
       }
     }

    //上下
      if (nowy >= that.data.btnrect.bottom && nowy <= that.data.btnrect.top) {
        //在此区域重新赋值
        if (nowy - that.data.btnrect.bottom > that.data.btnrect.top - nowy) {
          //偏下，那么往右边移除去
          nowy = nowy + that.data.btnrect.top - nowy + Math.random() * 80;

        } else {
          //偏左
          nowy = nowy - (that.data.btnrect.bottom - nowy) - Math.random() * 80;;
        }
      }

     //位置移动
     let px = "+=" + String((nowx - this.shape[i].img.Shape.Option.x));
     let py = "+=" + String(nowy - this.shape[i].img.Shape.Option.y);
      this.shape[i].img.animate({ "x": nowx, "y": nowy, opacity: 1}, { duration: 1000, onEnd:function(){
       //添加晃动
       that.shape[i].img.animate("y", "-=10", { duration: 1000 }).animate("y", "+=10", { duration: 1000, onLooping:function(){
       }}).start(true);
    
     } })
       .start();
      this.shape[i].text.animate({ "x": nowx - 15, "y": nowy + 25, opacity: 1} , { duration: 1000,onEnd:function(){
       that.shape[i].text.animate("y", "-=10", { duration: 1000 }).animate("y", "+=10", { duration: 1000 }).start(true);
     }})
       .start();
    
   }
  },
  /**
   * 更新某一个小球，先隐藏，成功了再展示
   */
  updateSinger:function(data){
    console.log(data);
    let d=data;
//首先要平移到button的位置，
    let that=this;
    //btn的上下左右
    let btnrect=this.data.btnrect;
    wx.showModal({
      title: data.text.Shape.text,
      content: '',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '',
      confirmText: '确定',
      confirmColor: '',
      success: function(res) {
        if(res.confirm==true){
         //先动画平移到位置再重置
        let centerx=  btnrect.left+(btnrect.right-btnrect.left)/2;
        let centery=  btnrect.top+(btnrect.bottom-btnrect.top)/2;
        let newimg=d.img.clone();
        let newtext=d.text.clone();
        d.text.destroy();
        d.img.destroy();
        //添加新到canvas进行平移操作
        that.wxCanvas.add(newimg);
        that.wxCanvas.add(newtext);
          newimg.animate({ "x": centerx, "y": centery, opacity: 0 }, {
            duration: 1000, onEnd: function () {
              //全部重置
              newimg.destroy();
              that.reset();
            }
          }).start();
          newtext.animate({ "x": centerx, "y": centery, opacity: 0 }, {
            duration: 1000, onEnd: function () {
              newtext.destroy();

            }
          }).start();
       

        }



      },
      fail: function(res) {},
      complete: function(res) {},
    });
    

    
  },

//重置画面
  reset:function(){
    let that=this;
    //reset
    that.wxCanvas.reset();
    var query = wx.createSelectorQuery();

    var nodes = query.select(".mycanvas").boundingClientRect(function (rect) {
      //拿到canvas的宽高 
      that.setData({
        canvaswidth: rect.width,
        canvasheight: rect.height
      });
      var context = wx.createCanvasContext('first');
      that.wxCanvas = new wxDraw(context, 0, 0, rect.width, rect.height);
      //初始化3个的位置。在中间位置靠下初始化
      that.addPicToScreen(rect.width / 2, rect.height / 2 + 40);
      //然后要进行位置的更新从初始化位置更新

    }).exec();
  }
   
  


});







