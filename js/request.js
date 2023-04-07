/**
 * ajax请求 不依赖任何框架及其他文件
 * 作者：管雷鸣
 * 个人网站：www.guanleiming.com
 * 个人微信: xnx3com
 * 公司：潍坊雷鸣云网络科技有限公司
 * 公司官网：www.leimingyun.com
 */
var request = {
	/**
	 * get请求
	 * @param url 请求的接口URL，传入如 http://www.xxx.com/a.php
	 * @param data 请求的参数数据，传入如 {"goodsid":"1", "author":"管雷鸣"}
	 * @param func 请求完成的回调，传入如 function(data){ console.log(data); }
	 */
	get:function(url, data, func){
		var headers = {
			'content-type':'application/x-www-form-urlencoded'
		};
		this.send(url, data, func, 'get', true, headers, null);
	},
	/**
	 * post请求
	 * @param url 请求的接口URL，传入如 http://www.xxx.com/a.php
	 * @param data 请求的参数数据，传入如 {"goodsid":"1", "author":"管雷鸣"}
	 * @param func 请求完成的回调，传入如 function(data){ console.log(data); }
	 */
	post:function(url, data, func){
		var headers = {
			'content-type':'application/x-www-form-urlencoded'
		};
		this.send(url, data, func, 'post', true, headers, null);
	},
	/**
	 * 发送请求
	 * url 请求的url
	 * data 请求的数据，如 {"author":"管雷鸣",'site':'www.guanleiming.com'} 
	 * func 请求完成的回调，传入如 function(data){}
	 * method 请求方式，可传入 post、get
	 * isAsynchronize 是否是异步请求， 传入 true 是异步请求，传入false 是同步请求
	 * headers 设置请求的header，传入如 {'content-type':'application/x-www-form-urlencoded'};
	 * abnormalFunc 响应异常所执行的方法，响应码不是200就会执行这个方法 ,传入如 function(xhr){}
	 */
	send:function(url, data, func, method, isAsynchronize, headers, abnormalFunc){
		//post提交的参数
		var params = '';
		if(data != null){
			for(var index in data){
				if(params.length > 0){
					params = params + '&';
				}
				params = params + index + '=' + data[index];
			}
		}
		
		var xhr=null;
		try{
			xhr=new XMLHttpRequest();
		}catch(e){
			xhr=new ActiveXObject("Microsoft.XMLHTTP");
		}
		//2.调用open方法（true----异步）
		xhr.open(method,url,isAsynchronize);
		//设置headers
		if(headers != null){
			for(var index in headers){
				xhr.setRequestHeader(index,headers[index]);
			}
		}
		xhr.send(params);
		//4.请求状态改变事件
		xhr.onreadystatechange=function(){
		    if(xhr.readyState==4){
		        if(xhr.status==200){
		        	//请求正常，响应码 200
		        	var json = null;
		        	try{
		        		json = JSON.parse(xhr.responseText);
		        	}catch(e){
		        		console.log(e);
		        	}
		        	if(json == null){
		        		func(xhr.responseText);
		        	}else{
		        		func(json);
		        	}
		        }else{
		        	if(abnormalFunc != null){
		        		abnormalFunc(xhr);
		        	}
		        }
		    }
		}
	},

	/**
	 * 文件上传
	 * url 请求的url
	 * data 请求的数据，如 {"author":"管雷鸣",'site':'www.guanleiming.com'} 
	 * file 要上传的文件。可以通过input的 e.srcElement.files[0] 获取
	 * successFunc 请求成功的回调，响应码是200就会执行这个。传入如 function(data){}
	 * headers 设置请求的header，传入如 {'content-type':'application/x-www-form-urlencoded'};
	 * abnormalFunc 响应异常所执行的方法，响应码不是200就会执行这个方法 ,传入如 function(xhr){}
	 */
	upload:function(url,data, file, successFunc, headers, abnormalFunc){
		//post提交的参数
		var fd = new FormData();
		fd.append('file', file);
		if(data != null){
			for(var index in data){
				fd.append(index, data[index]);
			}
		}
		
		var xhr=null;
		try{
			xhr=new XMLHttpRequest();
		}catch(e){
			xhr=new ActiveXObject("Microsoft.XMLHTTP");
		}
		//2.调用open方法（true----异步）
		xhr.open('POST',url,true);
		//设置headers
		if(headers != null){
			for(var index in headers){
				xhr.setRequestHeader(index,headers[index]);
			}
		}
		xhr.send(fd);
		//4.请求状态改变事件
		xhr.onreadystatechange=function(){
		    if(xhr.readyState==4){
		        if(xhr.status==200){
		        	//请求正常，响应码 200
		        	var json = null;
		        	try{
		        		json = JSON.parse(xhr.responseText);
		        	}catch(e){
		        		console.log(e);
		        	}
		        	if(json == null){
		        		successFunc(xhr.responseText);
		        	}else{
		        		successFunc(json);
		        	}
		        }else{
		        	if(abnormalFunc != null){
		        		abnormalFunc(xhr);
		        	}
		        }
		    }
		}
	}
}