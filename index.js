var page = require('webpage').create();
var system = require('system');
var fs = require('fs');
var server = require('webserver').create();

var args = system.args;

function parseGET(url){
  // adapted from http://stackoverflow.com/a/8486188
  var query = url.substr(url.indexOf("?")+1);
  var result = {};
  query.split("&").forEach(function(part) {
    var e = part.indexOf("=")
    var key = part.substr(0, e);
    var value = part.substr(e+1);
    result[key] = decodeURIComponent(value);
  });
  return result;
}


page.onConsoleMessage = function(msg) {
  system.stderr.writeLine('console: ' + msg);
};

page.onUrlChanged = function() {
  console.log("URL Change!!");
}

page.onLoadFinished = function() {
  console.log("Finish Load" + page.title);
  if (page.title === '华中师范大学学生信息服务平台-个人门户') {
    page.evaluate(function() {
      var link = document.querySelectorAll("#userlable li a")[2];
      link.target = "";
      var ev = document.createEvent("MouseEvents");
      ev.initEvent("click", true, true);
      link.dispatchEvent(ev);
    })
  }
  if (page.title === '学生工作管理信息系统') {
    var service = server.listen('8388', function(request, response) {
      console.log('Request received at ' + new Date());
      var imgURL;
      var id = parseGET(request.url).id;

      //get image
      page.evaluate(function(id) {

        function getBase64Image(img) {
          var canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          var dataURL = canvas.toDataURL("image/png");

          return dataURL;
        }
				if (!document.getElementById("myImg")){
						var img = document.createElement("img");
						img.id = "myImg";
				}else{
						var img = document.getElementById("myImg");
				}
  
        img.onload = function() {
          img.src = getBase64Image(img);
          console.log("img src changed!!");
        }
        img.src = "/xgxt/xsxx_xsgl.do?method=showPhoto&xh=" + id;
        
        document.getElementsByTagName("body")[0].appendChild(img);
      }, id);

      setTimeout(function() {
        imgURL = page.evaluate(function() {
          return document.getElementById("myImg").src;
        })

        response.statusCode = 200;
        response.headers = {
          'Cache': 'no-cache',
          'Content-Type': 'text/html;charset=utf-8'
        };
        // TODO: do something on the page and generate `result`
        response.write("<html><body><img src='" + imgURL + "'/></body></html>");
        response.close();
      }, 2000);
    });

  };
};

page.open('http://xssw.ccnu.edu.cn/zfca/login', function(status) {
  page.evaluate(function(username, password) {
    document.getElementById("username").value = username;
    document.getElementById("password").value = password;
    var btn = document.querySelector(".btn_dl");
    var ev = document.createEvent("MouseEvents");
    ev.initEvent("click", true, true);
    btn.dispatchEvent(ev);
  }, args[1], args[2]);
})