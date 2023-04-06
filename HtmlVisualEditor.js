/**
 * 因网市场云建站系统而做，可视化编辑html
 * author: 管雷鸣
 * url: http://www.wang.market
 * QQ: 921153866
 * email: mail@xnx3.com
 * 微信: xnx3com
 * 最后修改 2019.4.1  同网市场v4.9版本而修改
 * 参数定义：
 * resBasePath 资源文件的路径，如 / ，又如 //res.weiunity.com/
 * htmledit_upload_url 图片上传接口的URL请求地址。post上传 ，input名字为 image
 * 
 * masterSiteUrl 已经废弃，只是为适应网市场老版本而预留
 * 
 */
//网市场服务器域名，需在其父页面定义变量masterSiteUrl，如 var masterSiteUrl = '//wang.market/' ， 然后此可可视化编辑的页面，是页面iframe引入的，可使用 parent.masterSiteUrl 调用;
HtmlVisualEditor = {
	//版本
	version : '3.0',
	//相关配置
	config:{
		//资源文件所在
		resBasePath:'//res.zvo.com/',
		//上传图片最大可允许上传的大小，单位是KB。如果未设置，默认是 3MB 
		uploadImageMaxSize:3000, 
		//上传图片保存的api接口。待补充接口规范约束。
		uploadImageApi : '......uploadImage.json',

	},
	util:{
		//同步方式加载js文件. url 传入相对路径，前面会自动拼接上 HtmlVisualEditor.config.resBasePath
		syncLoadJs(url){
			// 使用 XMLHttpRequest 对象发送同步请求
			var xhr = new XMLHttpRequest ();
			xhr.open ('GET', HtmlVisualEditor.config.resBasePath+url, false); // 第三个参数为 false 表示同步请求
			xhr.send ();
			// 使用 eval 函数执行响应文本
			eval (xhr.responseText);
		},
		//异步方式加载css文件. url 传入相对路径，前面会自动拼接上 HtmlVisualEditor.config.resBasePath
		loadCss(url){
			var head = document.getElementsByTagName('head')[0];
			var link = document.createElement('link');
			link.href = HtmlVisualEditor.config.resBasePathurl;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			head.appendChild(link);
		}
	},
	//监听
	listener:{
		//针对鼠标的监听
		mouse:function(){

			console.log('mouse listener add');

			// 给 div 元素添加一个 click 事件处理函数
			HtmlVisualEditor.document.get().body.addEventListener("click", function (e) {
			  //console.log (e);

			});

			$(HtmlVisualEditor.document.get()).mouseover(function(e){
				e.target.style.border='2px dashed';
				e.target.style.boxSizing='border-box';
			}).mouseout(function(e){
				e.target.style.border='';
				e.target.style.boxSizing='';
			}).mousedown(function(e){
				var je = $(e.target);
				//alert(e.which) // 1 = 鼠标左键 left; 2 = 鼠标中键; 3 = 鼠标右键 
				//试着chrome反着，去掉
				if(e.which == 1){
					//console.log(e);
					HtmlVisualEditor.document.editElement(e);
				}
				
			});
		}
	},
	//当前操作的document对象 . 此段来源于 https://gitee.com/mail_osc/kefu.js/blob/main/kefu.js
	document:{
		iframeId:'', //iframe的id,在iframe中显示，那这里是显示界面的iframe 的 id 
		//获取当前kefu.js操作的document对象
		get:function(){
			if(HtmlVisualEditor.document.iframeId.length < 1){
				//不在iframe显示，那在当前页面显示
				return document;
			}else{
				return document.getElementById(HtmlVisualEditor.document.iframeId).contentWindow.document;
			}
		},
		//设置当前kefu.js操作的document对象。如果不设置，默认操作的是当前页面，如果设置，传入iframe元素id，则kefu显示在iframe中，避免被当前页面的css影响
		set:function(iframe_id){
			HtmlVisualEditor.document.iframeId = iframe_id;
		},
		setHtml:function(html){
			var o = document.getElementById(HtmlVisualEditor.document.iframeId);
			ed = document.all ? o.contentWindow.document : o.contentDocument;
			ed.open();
			ed.write(html);
			ed.close();
		},
		//获取可视化编辑的html源码
		getHtml(){
			//将body的contentEditable设为false
			HtmlVisualEditor.document.get().body.contentEditable=false;

			//取html内容
			var html = HtmlVisualEditor.document.get().documentElement.outerHTML;

			//再讲页面显示相关还原回去
			HtmlVisualEditor.document.get().body.contentEditable=true;			

			//对html进行处理
			//将 style="" 去掉
			html = html.replace (/\s*style=\"\"/g, "");
			return html;
		},
		//获取父页面的document
		parent:function(){
			return window.parent.document;
		},
		editPanel:function(){
			return HtmlVisualEditor.document.parent().getElementById('HtmlVisualEditor_EditPanel');
		},
		//鼠标放上修改元素时
		editElement:function(obj){
			console.log(obj.target.tagName);
			HtmlVisualEditor.document.editPanel().innerHTML = obj.target.tagName;
		}
	},
	//生命周期
	life:{
		//加载支持文件完成，func.js等，在JQuery之后调用
		loadSupportFileFinsh:function(){
			
			//HtmlVisualEditor.util.syncLoadJs('js/jquery-2.1.4.js');
			//HtmlVisualEditor.util.syncLoadJs('js/fun.js');
			HtmlVisualEditor.util.loadCss('htmledit.css');


		},
		//加载完毕，要进入编辑模式了
		loadFinish:function(){
			HtmlVisualEditor.document.get().body.contentEditable=true;

			//加入鼠标监听
			HtmlVisualEditor.listener.mouse();
		}
	}

};
