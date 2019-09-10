//功能：用户修改信息先人脸识别得到许可
//作者：张皓翔、唐余鑫
//创建时间：2019.8.21
//最终更新时间：2019.9.9
Page({
  data: {
    base64: "",
    token: "24.2289840d3c758d6e288b2079ebd8593c.2592000.1568941024.282335-17051910", // access_token
    src: "",
    msg: null,
    timer_number: 0,
    over_timer_number: 0
  },

  onLoad: function() {
    var that = this;
    var temp_timer_number = setInterval(this.takePhoto, 1000);
    this.setData({
      timer_number: temp_timer_number
    })

    console.log('timer: ' + this.data.timer_number);

    var temp_over_timer_number = setTimeout(function () {
      console.log('clear timer' + that.data.timer_number);
      clearInterval(that.data.timer_number);

      wx.navigateTo({
        url: '../userCenter/userCenter',
      })
      wx.showToast({
        title: '识别超时！',
        icon: 'loading',
        duration: 500
      })
    }, 5000);
    that.setData({
      over_timer_number: temp_over_timer_number
    })
  },


  //拍照并编码
  takePhoto() {
    //拍照
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(typeof res.tempImagePath);
        console.log(res.tempImagePath);
        this.setData({
          src: res.tempImagePath
        })
      }
    })

    var that = this;
    //图片base64编码
    wx.getFileSystemManager().readFile({
      filePath: this.data.src, //选择图片返回的相对路径
      encoding: 'base64', //编码格式
      success: res => { //成功的回调
        that.setData({
          base64: res.data
        })
      }
    })

    //上传人脸进行 比对
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/search?access_token=' + that.data.token,
      method: 'POST',
      data: {
        image: this.data.base64,
        image_type: 'BASE64',
        group_id_list: 'item' //自己建的用户组id
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        console.log(res.data);
        that.setData({
          msg: res.data.result.user_list[0].score
        })
        if (that.data.msg > 80) {
          wx.showToast({
            title: '验证通过',
            icon: 'success',
            duration: 1000
          })
          clearInterval(that.data.timer_number);

          console.log('clear over timer' + that.data.over_timer_number);

          clearTimeout(that.data.over_timer_number);
          var temp_user_id = res.data.result.user_list[0].user_id;
          console.log('user id: ' + temp_user_id);
          //验证通过，跳转至设置新信息页面
          wx.reLaunch({
            url: '../change_info/change_info?temp=' + temp_user_id
          })
        }
      }
    });

    wx.showToast({
      title: '正在识别，请勿移动手机！',
      icon: 'loading',
      duration: 500
    })
  },
  error(e) {
    console.log(e.detail)
  },

  onHide: function () {
    console.log('clear timer' + this.data.timer_number);
    clearInterval(this.data.timer_number);
  }
})