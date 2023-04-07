var wm = {
	token:{
		/**
		 * 获取token，也就是 session id。获取的字符串如 f26e7b71-90e2-4913-8eb4-b32a92e43c00
		 * 如果用户未登录，那么获取到的是  youke_uuid。 这个会设置成layim 的  mine.id
		 */
		get:function(){
			return localStorage.getItem('token');
		},
		/**
		 * 设置token，也就是session id
		 * 格式如 f26e7b71-90e2-4913-8eb4-b32a92e43c00
		 */
		set:function(t){
			localStorage.setItem('token',t);
		}
	},
	load:{
		/**
		 * 同步加载JS，加载过程中会阻塞，加载完毕后继续执行后面的。
		 * url: 要加载的js的url
		 */
		synchronizesLoadJs:function(url){
			var  xmlHttp = null;  
			if(window.ActiveXObject){//IE  
				try {  
					//IE6以及以后版本中可以使用  
					xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");  
				} catch (e) {  
					//IE5.5以及以后版本可以使用  
					xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");  
				}  
			}else if(window.XMLHttpRequest){  
				//Firefox，Opera 8.0+，Safari，Chrome  
				xmlHttp = new XMLHttpRequest();  
			}  
			//采用同步加载  
			xmlHttp.open("GET",url,false);  
			//发送同步请求，如果浏览器为Chrome或Opera，必须发布后才能运行，不然会报错  
			xmlHttp.send(null);  
			//4代表数据发送完毕  
			if( xmlHttp.readyState == 4 ){  
				//0为访问的本地，200到300代表访问服务器成功，304代表没做修改访问的是缓存  
				if((xmlHttp.status >= 200 && xmlHttp.status <300) || xmlHttp.status == 0 || xmlHttp.status == 304){  
					var myBody = document.getElementsByTagName("HTML")[0];  
					var myScript = document.createElement( "script" );  
					myScript.language = "javascript";  
					myScript.type = "text/javascript";  
					try{  
						//IE8以及以下不支持这种方式，需要通过text属性来设置  
						myScript.appendChild(document.createTextNode(xmlHttp.responseText));  
					}catch (ex){  
						myScript.text = xmlHttp.responseText;  
					}  
					myBody.appendChild(myScript);  
					return true;  
				}else{  
					return false;  
				}  
			}else{  
				return false;  
			}  
		},
		//加载css文件，通过css的url
		css: function(url){
			if(!url || url.length === 0){
				throw new Error('argument "url" is required !');
			}
			var head = document.getElementsByTagName('HTML')[0];
			var link = document.createElement('link');
			link.href = url;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			head.appendChild(link);
		},
	},
	/**
	 * 网络请求，都是用此
	 * api 请求的api接口，可以传入如 api.login_token
	 * data 请求的数据，如 {"goodsid":"1"} 
	 * func 请求完成的回调，传入如 function(data){}
	 */
	post:function(api, data, func){
		if(typeof(request) == 'undefined'){
			var protocol = '';
			if(window.location.protocol == 'file:'){
				//是在本地运行的，那么request.js 的请求 url 要加上 http:
				protocol = 'http:';
			}
			this.load.synchronizesLoadJs(protocol+'//res.weiunity.com/request/request.js')
		}
		if(this.token.get() != null && this.token.get().length > 0){
			data['token'] = this.token.get();
		}
		var headers = {'content-type':'application/x-www-form-urlencoded'};
		request.send(api, data, func, 'post', true, headers, function(xhr){
			console.log('request api,  status : '+xhr.status);
		});
	},
	/**
	 * 获取网址的get参数。
	 * @param name get参数名
	 * @returns value
	 */
	getUrlParams:function(name){
	     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = window.location.search.substr(1).match(reg);
	     if(r!=null)return  unescape(r[2]); return null;
	},
	

	/** 
	 * 时间戳转化为年 月 日 时 分 秒 
	 * number: 传入时间戳 如 1587653254
	 * format：返回格式，如 'Y-M-D h:m:s'
	*/
	formatTime:function(number,format) {
		var formateArr  = ['Y','M','D','h','m','s'];
		var returnArr   = [];
		var date = new Date(number * 1000);
		returnArr.push(date.getFullYear());
		returnArr.push(this.formatNumber(date.getMonth() + 1));
		returnArr.push(this.formatNumber(date.getDate()));
		returnArr.push(this.formatNumber(date.getHours()));
		returnArr.push(this.formatNumber(date.getMinutes()));
		returnArr.push(this.formatNumber(date.getSeconds()));
		for (var i in returnArr){
			format = format.replace(formateArr[i], returnArr[i]);
		}
		return format;
	},
	//时间戳转时间的数据转化，此方法只是服务于 formatTime
	formatNumber:function(n) {
		n = n.toString()
		return n[1] ? n : '0' + n
	},
	//将 a_b1_c2 转化为驼峰命名方式 aB1C2
	lineToHump:function(name){
		return name.replace(/\_(\w)/g, function(all, letter){
			return letter.toUpperCase();
		});
	},
	//获取form标签内的所有数据。获取到的是json对象的形态。 需要jquery支持。
	getJsonObjectByForm:function(obj){
		var o = {};
	    var a = obj.serializeArray();
	    $.each(a, function() {
	        if (o[this.name] !== undefined) {
	            if (!o[this.name].push) {
	                o[this.name] = [o[this.name]];
	            }
	            o[this.name].push(this.value || '');
	        } else {
	            o[this.name] = this.value || '';
	        }
	        
	        try{
	        	if(this.name != null && this.name.length > 0){
		        	if(this.name.indexOf('_') > -1){
		            	//出现了下划线，那可能是驼峰命名，增加驼峰传参
		        		 o[wm.lineToHump(this.name)] = o[this.name];
		            }
		        }
	        }catch(e){
	        	console.log(e);
	        }
	    });
	    return o;
	},
	/**
	 * 自动填充form标签内的数据。 需要jquery支持。
	 * @param obj 传入如 $('#form') ,要自动填充哪个form中的数据，就传入哪个form
	 * @param data json对象的数据值，比如form中有个input，name是age， 而 data.age 也有正常的值，那么 这个input就会正常填充上data.age的值
	 */
	fillFormValues:function(obj, data){
		var a = obj.serializeArray();
		for(var i = 0; i<a.length; i++){
			var wm_fv_name = a[i].name;
			var wm_fv_value = data[a[i].name];
			if(wm_fv_value != null && typeof(wm_fv_value) != 'undefined'){
				//有值，那么赋予输入框值
				
				/***** 赋予值 ******/
				//获取当前输入框的形式，是input、text、select 的哪种
				var tag = document.getElementsByName(wm_fv_name)[0].nodeName.toLowerCase();
				
				//if(tag == 'input' || tag == 'select' || tag == 'text'){
					document.getElementsByName(wm_fv_name)[0].value = wm_fv_value;
				//}
				
				//判断当前输入是否是图片输入
				var form_uploadImage_titlePicA = document.getElementById(wm_fv_name+'_titlePicA');
				if(form_uploadImage_titlePicA != null){
					//不是null，那这项就是图片上传项了
					try{
						document.getElementById(wm_fv_name+"_titlePicA").href = wm_fv_value;
						document.getElementById(wm_fv_name+"_titlePicImg").src = wm_fv_value;
						document.getElementById(wm_fv_name+"_titlePicImg").style.display='';
					}catch(e){
						console.log(e);
					}
				}
				/***** 赋予值结束 ******/
			}
		}
		
		//重新渲染 layui 的form
		if(typeof(layui) != 'undefined'){
			layui.use(['form'], function(){
				var form = layui.form;
				form.render(); //更新全部
			});
		}
	}
};