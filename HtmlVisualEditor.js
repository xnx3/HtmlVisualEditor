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
		resBasePath:'https://res.zvo.cn/',
		//上传图片最大可允许上传的大小，单位是KB。如果未设置，默认是 3MB 
		//uploadImageMaxSize:3000, 
		//上传图片保存的api接口。待补充接口规范约束。
		//设置入 http://xxxx.com/uploadImage.json
		uploadImageApi : '', 
	},
	util:{
		//同步方式加载js文件. url 传入相对路径，前面会自动拼接上 HtmlVisualEditor.config.resBasePath
		syncLoadJs(url){
			/*
			// 使用 XMLHttpRequest 对象发送同步请求
			var xhr = new XMLHttpRequest ();
			xhr.open ('GET', HtmlVisualEditor.config.resBasePath+url, false); // 第三个参数为 false 表示同步请求
			xhr.send ();
			//console.log(xhr.responseText);
			// 使用 eval 函数执行响应文本
			eval (xhr.responseText);
			*/
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
			xmlHttp.open("GET",HtmlVisualEditor.config.resBasePath+url,false);  
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
		//异步方式加载js文件. url 传入相对路径，前面会自动拼接上 HtmlVisualEditor.config.resBasePath
		loadJs(url){
			var script = document.createElement('script');
			script.src = url;
			document.body.appendChild(script);
		},
		//异步方式加载css文件. url 传入相对路径，前面会自动拼接上 HtmlVisualEditor.config.resBasePath
		loadCss(url){
			//var head = document.getElementsByTagName('head')[0];
			var link = document.createElement('link');
			link.href = HtmlVisualEditor.config.resBasePathurl;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			document.body.appendChild(link);
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
				HtmlVisualEditor.document.editElement(e);
				//alert(e.which) // 1 = 鼠标左键 left; 2 = 鼠标中键; 3 = 鼠标右键 
				//试着chrome反着，去掉
				if(e.which == 1){
					//console.log(e);
					HtmlVisualEditor.document.editElement(e);
				}
				//console.log(e);
				
				/*
				var html = ''+
								+'<div>修改</div>'		  
								+'<div>删除</div>'
								+'<div>查看</div>'
						   '';
				var rect = HtmlVisualEditor.document.getIframeRect();
				msg.popups({
				    text:html,
				    padding:'1px',
				    height:'100px',
					width:'100px',
					top:e.clientY+rect.x+'px',
					left:e.clientX+rect.y+'px',
					close:true
				});
				*/
				
			});
			
			
			
		}
	},
	//当前操作的document对象 . 此段来源于 https://gitee.com/mail_osc/kefu.js/blob/main/kefu.js
	document:{
		iframeId:'', //iframe的id,在iframe中显示，那这里是显示界面的iframe 的 id 
		//获取当前 HtmlVisualEditor 操作的document对象
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
		//设置可视化编辑的html源码
		setHtml:function(html){
			html = '<meta http-equiv="content-security-policy" content="script-src \'none\'">' + html;

			var o = document.getElementById(HtmlVisualEditor.document.iframeId);
			ed = document.all ? o.contentWindow.document : o.contentDocument;
			ed.open();
			ed.write(html);
			ed.close();
			
			//隔开点时间，避免找不到报错
			var htmlLoadInterval = setInterval(function(){
				if(HtmlVisualEditor.document.get() == null){
					return;
				}
				if(HtmlVisualEditor.document.get().body == null){
					return;
				}
				if(HtmlVisualEditor.document.get().body.contentEditable == null){
					return;
				}
				
				//进行一些初始化
				HtmlVisualEditor.life.loadFinish();
				clearInterval(htmlLoadInterval);
			}, 50);

			//判断是否已经加载了编辑面板
			var editPanel = document.getElementById('HtmlVisualEditor_EditPanel');
			if(editPanel == null || typeof(editPanel) == 'undefined'){
				//还没有编辑面板，需要加入
				var form = document.createElement('form');
				form.setAttribute('id', 'HtmlVisualEditor_EditPanel');
				form.innerHTML = '<!-- 这是 HtmlVisualEditor 的属性编辑面板 -->';
				document.body.appendChild(form);
			}
		},

		//获取可视化编辑的html源码
		getHtml(){
			//将body的contentEditable设为false
			try{
				HtmlVisualEditor.document.get().body.contentEditable=false;
			}catch(e){ console.log(e); }
			

			//取html内容
			var html = HtmlVisualEditor.document.get().documentElement.outerHTML;

			//再讲页面显示相关还原回去
			try{
				HtmlVisualEditor.document.get().body.contentEditable=true;			
			}catch(e){ console.log(e); }
			

			//对html进行处理
			//将 style="" 去掉
			html = html.replace (/\s*style=\"\"/g, "");
			//将js限制求掉
			html = html.replace (/<meta http-equiv="content-security-policy" content="script-src 'none'">/g, "");
			//将 body 的  contenteditable="false" 去掉
			html = html.replace (/\scontenteditable=\"false\"/g, "");

			return html;
		},
		//获取父页面的document
		parent:function(){
			return window.parent.document;
		},
		editPanel:function(){
			return HtmlVisualEditor.document.parent().getElementById('HtmlVisualEditor_EditPanel');
		},
		//是否有子元素，true 有
		hasChild:function(obj){
			for(var i = 0; i<obj.children.length; i++){
				//console.log(obj.children[i]);
			}
			return obj.children.length > 0;

		},
		//鼠标放上修改元素时
		editElement:function(obj){
			//if(obj.target.childNodes.length > 0){
				//还有子元素，那忽略他
			//	return;
			//}
			var tagname = obj.target.tagName;
			//console.log(tagname+', '+HtmlVisualEditor.document.hasChild(obj.target));
			HtmlVisualEditor.editPanel.current = obj.target;
			
			//判断当前是否设置了背景图
			var backgroundImage = HtmlVisualEditor.document.getStyleBackgroundImage(obj.target);
			//console.log(backgroundImage)


			var html = '';
			switch(tagname){
				case 'IMG':
					html = HtmlVisualEditor.editPanel.tag.img;
				break;
				case 'A':
					html = HtmlVisualEditor.editPanel.tag.a;
				break;
				default:
					if(backgroundImage != null){
						//设置了背景图
						html = HtmlVisualEditor.editPanel.css.backgroundImage;
						html = html.replace (/{src}/g, backgroundImage);
					}
			}

				
				
			//底部保存按钮
			if(html.length > 0){
				html = html + HtmlVisualEditor.editPanel.foot;
			}else{
				html = '请点击左侧要修改的区域进行编辑';
			}

			//头部标签属性
			html = HtmlVisualEditor.editPanel.head + html;


			//数据赋予
			if(html.indexOf('{id}') > -1){
				html = html.replace (/{id}/g, obj.target.id);
			}
			if(html.indexOf('{tag}') > -1){
				html = html.replace (/{tag}/g, obj.target.tagName);
			}
			if(html.indexOf('{text}') > -1){
				html = html.replace (/{text}/g, obj.target.innerHTML);
			}
			if(html.indexOf('{src}') > -1){
				html = html.replace (/{src}/g, obj.target.getAttribute('src'));
			}
			if(html.indexOf('{href}') > -1){
				html = html.replace (/{href}/g, obj.target.getAttribute('href'));
			}
			if(html.indexOf('{alt}') > -1){
				html = html.replace (/{alt}/g, obj.target.alt);
			}

			
			HtmlVisualEditor.document.editPanel().innerHTML = html;
			
			//将编辑面板显示出来
			document.getElementById('HtmlVisualEditor_EditPanel').style.display = '';
			//弹窗使用说明参考 https://gitee.com/leimingyun/dashboard/wikis/leimingyun/msgjs/preview?sort_id=4112035&doc_id=1473987
			/*
			msg.popups({
			    text:'<div>'+html+'</div>',
			    padding:'1px',
			    height:'600px',
			    //background:'#FFFFFF',
			    opacity:80,
			    padding:'1rem'
			});
			*/

		},
		//获取元素的css设置的背景图的url。如果没有设置，则返回null
		getStyleBackgroundImage:function(element){
			//使用window.getComputedStyle()方法的优点是可以获取元素的计算样式，即最终应用到元素上的样式，包括样式表、媒体查询、继承等因素的影响。缺点是这个方法返回的是一个只读的对象，无法修改元素的样式，而且在某些浏览器中，这个方法可能比较耗时。
			var style = window.getComputedStyle(element);
			var bg = style.backgroundImage;
			if(bg == null || typeof(bg) == 'undefined' || bg == 'none'){
				return null;
			}
			var url = bg.match(/url\(\"(.*)\"\)/)[1]; //使用正则表达式匹配url()中的内容
			return url;
		},
		//获取提供可视化编辑的iframe，在当前浏览器页面区域的位置坐标
		getIframeRect:function(){
			var iframe = document.getElementById(HtmlVisualEditor.document.iframeId);
			var rect = iframe.getBoundingClientRect();
			//console.log(rect.top, rect.right, rect.bottom, rect.left);
			return rect;
		}
	},
	//生命周期
	life:{
		//加载支持文件完成，func.js等，在JQuery之后调用
		loadSupportFileFinsh:function(){
			
			//HtmlVisualEditor.util.syncLoadJs('js/jquery-2.1.4.js');
			//HtmlVisualEditor.util.syncLoadJs('js/fun.js');

			//HtmlVisualEditor.util.loadCss('htmledit.css');


		},
		//加载完毕，要进入编辑模式了
		loadFinish:function(){
			//html直接编辑
			HtmlVisualEditor.document.get().body.contentEditable=true;

			//加入鼠标监听
			HtmlVisualEditor.listener.mouse();
			
			//禁用iframe中的右键菜单
			HtmlVisualEditor.document.get().oncontextmenu = function() { 
				return false;
			}
			
			console.log('life loadFilish');
		}
	},
	//编辑面板
	editPanel:{
		current:null,	//当前操作的元素
		head: `
			<div class="head">
				<div><label>标签：</label><span>{tag}</span></div>
				<div><label>操作：</label><a href="javascript:HtmlVisualEditor.editPanel.remove()" class="delete">删除</a> | <a href="javascript:HtmlVisualEditor.editPanel.editSource();" class="source">源码</a> </div>
			</div>
		`,
		foot: `
			<div class="line">
				<div onclick="HtmlVisualEditor.editPanel.save(); document.getElementById('HtmlVisualEditor_EditPanel').style.display = 'none';" id="editPanel_Save">保存</div>
			</div>
		`,
		tag:{
			img : `
				<h2>图片(img)</h2>
				<div class="line img">
					<span class="name">图片(src)</span>
					<input type="file" style="display:none;" id="HtmlVisualEditor_img_input_file" value="" />
					<input type="text" name="src" id="HtmlVisualEditor_img_src" value="{src}" onchange="document.getElementById('preview_img').src = this.value;" />
					<a id="preview_img_a" href="{src}" target="_black"><img id="preview_img" src="{src}"></a>
					<span onclick="HtmlVisualEditor.editPanel.uploadImage();" class="upload">上传</span>
				</div>
				<div class="line">
					<span class="name">说明(alt)</span>
					<input type="text" name="alt" value="{alt}" />
				</div>
			`,
			a : `
				<h2>超链接(a)</h2>
				<div class="line">
					<span class="name">文字</span>
					<input type="text" name="text" value="{text}" />
				</div>
				<div class="line">
					<span class="name">链接(href)</span>
					<input type="text" name="href" value="{href}" />
				</div>
			`,
		},
		css:{
			backgroundImage: `
				<h2>背景图(background-image)</h2>
				<div class="line img">
					<span class="name">图片(src)</span>
					<input type="file" style="display:none;" id="HtmlVisualEditor_img_input_file" value="" />
					<input type="text" name="style.backgroundImage" id="HtmlVisualEditor_img_src" value="{src}"  onchange="document.getElementById('preview_img').src = this.value;" />
					<a id="preview_img_a" href="{src}" target="_black"><img id="preview_img" src="{src}"></a>
					<span onclick="HtmlVisualEditor.editPanel.uploadImage();" class="upload">上传</span>
				</div>
			`
		},
		//触发后可后上传图片
		uploadImage:function(){
			if(HtmlVisualEditor.config.uploadImageApi.length == 0){
				msg.alert('未开启图片上传功能！您可配置 HtmlVisualEditor.config.uploadImageApi 上传接口来启用上传功能');
				return;
			}

			
			var input = document.getElementById('HtmlVisualEditor_img_input_file');
			// 给文件输入框添加改变事件，获取选择的文件并上传
			input.addEventListener("change", function() {
				

			  /*
			  // 获取选择的文件对象
			  var fileObj = input.files[0];
			  // 创建一个表单数据对象
			  var formData = new FormData();
			  // 将文件对象添加到表单数据对象中，键名为upload
			  formData.append("file", fileObj);
			  // 创建一个XMLHttpRequest对象
			  var xhr = new XMLHttpRequest();
			  // 设置请求方法和地址
			  xhr.open("POST", HtmlVisualEditor.config.uploadImageApi);
			  // 发送请求
			  xhr.send(formData);
			*/
			  msg.loading('上传中');
			  request.upload(
			  		HtmlVisualEditor.config.uploadImageApi,
			  		//{"source":"HtmlVisualEditor"},
			  		{},
			  		input.files[0],
			  		function(data){
						msg.close();
						if(data.result == 1){
							msg.success('上传成功');
							//input 输入框中的值
							document.getElementById('HtmlVisualEditor_img_src').value = data.url;
							//输入框边上的预览图片的小图
							document.getElementById('preview_img').src = data.url;
							//输入框边上的预览图片的小图-的超链接url
							document.getElementById('preview_img_a').href = data.url;

						}else{
							msg.alert(data.info);
						}
			  		},
			  		{},
			  		function(xhr){
			  			msg.close();
			  			msg.alert('响应异常');
			  			console.log(xhr);
			  		}
			  );

			});
			input.click();




			//var file = input.files[0]
			//request.upload('upload.json',{}, input.files[0]);
		},
		save:function(){
			var form = wm.getJsonObjectByForm($('#HtmlVisualEditor_EditPanel'));
			//console.log(form);
			if(HtmlVisualEditor.editPanel.current == null){
				msg.alert('error');
				return;
			}

			for (var key in form) {
				//console.log(key + ": " + form[key]); // 输出 name: Alice 和 age: 20
				if(typeof(HtmlVisualEditor.editPanel.current[key]) != 'undefined'){
					//是html本身的属性，那么直接赋予
					HtmlVisualEditor.editPanel.current[key] = form[key];
				}else if(key.indexOf('style.backgroundImage') > -1){
					//是css的属性 - 设置背景图
					HtmlVisualEditor.editPanel.current.style.backgroundImage = "url('"+form[key]+"')";
				}
			}
			if(typeof(form['text']) != 'undefined'){
				HtmlVisualEditor.editPanel.current.innerHTML = form['text'];
			}

		},
		//删除当前选定的元素
		remove:function(){
			if(HtmlVisualEditor.editPanel.current == null){
				return;
			}

			HtmlVisualEditor.editPanel.current.remove();
		},
		//编辑源码,针对当前选中的元素，也就是 HtmlVisualEditor.editPanel.current
		editSource:function(){
			var source = HtmlVisualEditor.editPanel.current.innerHTML;
			if(source == null || source.length < 1){
				msg.info('当前选中区域无可编辑的源码');
				return;
			}
			
			var text = '<div style=" height: 100%; overflow: hidden;">'
							+'<div id="HtmlVisualEditor-editPanel-editSource-editormd"><!-- 代码编辑 --></div>'
							+'<div style="margin-top: -110px; z-index: 2147483647; position: absolute; bottom: 20px; left: 356px;"><button style="height: 38px; line-height: 38px; padding: 0 28px; background-color: #4c88ff; color: #fff; white-space: nowrap; text-align: center; font-size: 16px; border: none; border-radius: 2px; cursor: pointer;" onclick="alert(testEditor.getValue())">保存</button></div>'
					   +'</div>';
			
			//弹窗使用说明参考 https://gitee.com/leimingyun/dashboard/wikis/leimingyun/msgjs/preview?sort_id=4112035&doc_id=1473987
			msg.popups({
			    text:text,
			    padding:'2px',
			    height:'700px',
				width: '800px',
			    //background:'#FFFFFF',
			    opacity:98,
			});
			
			//代码编辑器
			testEditor = editormd("HtmlVisualEditor-editPanel-editSource-editormd", {
				width			: "800px",
				height			: "700px",
				watch			: false,
				toolbar			: false,
				codeFold		: true,
				searchReplace	: true,
				placeholder		: "请输入模版变量的代码",
				value			: HtmlVisualEditor.editPanel.current.innerHTML,
				theme			: "default",
				mode			: "text/html",
				path			: '//res.zvo.cn/module/editor/lib/'
			});

		}

	},
	//初始化，比如加载js依赖
	init:function(){
		
		//加载JS
		if(typeof($) == 'undefined'){
			HtmlVisualEditor.util.syncLoadJs('js/jquery-2.1.4.js');
		}
		if(typeof(wm) == 'undefined'){
			HtmlVisualEditor.util.syncLoadJs('wm/wm.js');
		}
		if(typeof(request) == 'undefined'){
			HtmlVisualEditor.util.syncLoadJs('request/request.js');
		}
		if(typeof(msg) == 'undefined'){
			HtmlVisualEditor.util.syncLoadJs('msg/msg.js');
		}
		
		//加载CSS
		HtmlVisualEditor.util.loadCss('./HtmlVisualEditor.css');
		
		//加载editor
		HtmlVisualEditor.util.loadJs('https://res.zvo.cn/module/editor/editormd.js');
		HtmlVisualEditor.util.loadCss('https://res.zvo.cn/module/editor/css/editormd.css');
		
	}

};

HtmlVisualEditor.init();