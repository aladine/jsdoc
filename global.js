
/**
 * This is a description of the MyClass constructor function.
 * @class
 * @classdesc This is a description of the MyClass class.
 */
var Global = (function () {
  "use strict";  
  var treeDataUrl = '/admin/tree/generate/',
      $tree;
  var twodigit = function(n){n = parseInt(n,10); return n<10 ? '0'+n : n;};
  var current_time = new Date(),
    current_date = current_time.getFullYear()+'-'+ twodigit(current_time.getMonth()+1)+'-'+twodigit(current_time.getDate());    
   if($("#currentTreeParent").val()){
          treeDataUrl =treeDataUrl + '/' + $("#currentTreeParent").val();
          node.id=$("#currentTreeParent").val();
    }
  var fn_getUserAgent = function(){
    return navigator.userAgent;
  };
  return {
    debugMode:false,
    publicMode:false, 
    ajaxTimeOut: 120000,  
    defaultLang: 'eng',
    /** default Tree Config. */
    defaultTreeConfig: {
      selectable: false,
      autoEscape: false,
      saveState: true
    }, 
    defaultDatePickerConfig: {
      showSecond: false,
      dateFormat: 'dd M yy'
    },
    defaultDateTimePickerConfig: {
      showSecond: false,
      dateFormat: 'dd M yy',
      timeFormat: "hh:mm tt"
    },
    defaultDatePickerDobConfig:{
      yearRange: "-70:+0",
      changeMonth: true,
      changeYear: true,
      // hideIfNoPrevNext: true,
      // duration:'',
      dateFormat: 'dd M yy',
      numberOfMonths: 1,
      showButtonPanel: true
    },
    defaultS3Bucket:'littlelives.production',
    defaultLittlelivesBucket: 'http://littlelives.production.s3.amazonaws.com/',
    defaultCloudFront: 'https://d26khrv8xd5oaa.cloudfront.net/',
    defaultPlUploadConfig:{
      runtimes : (fn_getUserAgent().match(/MSIE/i) != null) ? 'flash,silverlight,html4,html5,gears' : 'html5,gears,flash,silverlight',
      //max_file_count : 5,
      max_file_size : '100mb',
      chunk_size : '500kb',
      unique_names : true,
      urlstream_upload :true,
      filters : [
        {title : "Image files", extensions : "jpg,gif,png,jpeg"}
      ],
      flash_swf_url : '/js/plupload/plupload.flash.swf',
      silverlight_xap_url : '/js/plupload/plupload.silverlight.xap'
    },  
    // getUser: function(key){
    //   return _user[key];
    // },
    // setUser: function(key,value){
    //   if(!!_user) _user[key] = value;
    // }, 
    init: function (opts){
      if(typeof opts.publicMode !== 'undefined') this.publicMode = opts.publicMode;
    },
    isInvalidEmail: function(email){
      var filter = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9]+[a-zA-Z0-9.-]+.[a-z]{2,4}$/;
      return !filter.test($.trim(email));
    },
    isIE: function (){
      return (fn_getUserAgent().match(/MSIE/i) != null);
    }, 
    isiOS: function(){
      var ua = fn_getUserAgent();
      return (ua.match(/iPad/i) != null) || (ua.match(/iPhone/i) != null) || (ua.match(/iPod/i) != null);
    },
    isAndroid: function(){
      var ua = fn_getUserAgent();
      return (ua.match(/Android/i) != null);
    },
    isMobile: function(){
      return this.isiOS() || this.isAndroid() ;
    },
    isiOS6: function(){
      return isiOS() && !( /OS [1-5](.*) like Mac OS X/i.test(fn_getUserAgent())) ;
    },
    fn_disable_button: function(btn,msg){
      if(typeof msg !== 'undefined') btn.find('span,a').text(msg);
      if(btn instanceof jQuery) return btn.attr('disabled','disabled').addClass('btn_soft').removeClass('btn_affirm');
      else return btn;
    },
    fn_enable_button: function(btn,msg){
      if(typeof msg !== 'undefined') btn.find('span,a').text(msg);
      if(btn instanceof jQuery) return btn.removeAttr('disabled').removeClass('btn_soft').addClass('btn_affirm');
      else return btn;
    },
    fn_flashMessage: function(msg,opts){
      //opts: css settings for the the flash message.
      if(typeof msg === 'undefined') {
        msg = 'Session timeout or Internet connection lost. Please refresh the page.'; 
      } 
      if($('#flashMessage').length){
        $('#flashMessage').html('<p>'+msg+'</p>');
      }else{
        $('.page_wrapper').append('<div id="flashMessage" style="opacity:1"><p>' + msg +'</p></div>');
      }
      $('#flashMessage').show().css({position:'fixed',
        top:(typeof opts !== 'undefined' ? opts.top :'50%'),
        left:'50%','margin-top':'-30px','z-index':'99'});
      $('#flashMessage').fadeOut(3500);
    },
    js_debug: function(msg,args){
      if(Global.debugMode) {
        if(typeof args !== 'undefined') console.log(msg,args);
        else console.log(msg);
      }
    }, 
    d: function(){
      if(Global.debugMode) {
        console.log(arguments);
      }
    }, 
    js_timeStart: function(name){
      if(Global.debugMode) console.time(name);
    },
    js_timeEnd: function(name){
      if(Global.debugMode) console.timeEnd(name);
    },
    addValidateMethodForm : function(){
     if(typeof $.validator !== 'undefined') $.validator.addMethod('nric',function(val, ele){
         var rel = Global.isNRIC($.trim(val));
       return (typeof rel === 'boolean') ? rel : false;
       },'BC number is invalid');
    },
    getTruncatedString: function(string, limit) {
      if (typeof limit === 'undefined') limit = 25;
      if(limit < string.length) return string.substring(0,limit - 3) + '...';
      return string;
    }, 
    nl2br: function(str, is_xhtml) {
      var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    },
    loadCssJs:function (src){
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
          '://'+src;
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    },
    isValidUserName: function  (str) {
      var filter = /^[@a-zA-Z0-9_.-]+[@a-zA-Z0-9_.-][@a-zA-Z0-9_.-]$/;
      return filter.test($.trim(str));
    },
   isNRIC: function(nric)
   { 
      var weight = 0;
       if(nric.length != 9) {   //Check for Length(=9)
           return ('Length should be 9');
           // return false;
       } 
       nric =  nric.toUpperCase();
       var firstChar = nric.substring(0,1);
       var lastChar = nric.substring(8,9);
       if(firstChar == 'T'  || firstChar == 'G') {
           weight = 4;
       }
       else if(firstChar == 'S' || firstChar == 'F')
           { }
       else {
           // ctr.focus();
           return ('First character should be S/T/F/G in Capital Letter');
           // return false;
      }
    
       //Calculate the Summation on NRIC No. digits.
       var chkno = parseInt(nric.substring(1,2),10) * 2;
       chkno = chkno + parseInt(nric.substring(2,3),10) * 7;
       chkno = chkno + parseInt(nric.substring(3,4),10) * 6;
       chkno = chkno + parseInt(nric.substring(4,5),10) * 5;
       chkno = chkno + parseInt(nric.substring(5,6),10) * 4;
       chkno = chkno + parseInt(nric.substring(6,7),10) * 3;
       chkno = chkno + parseInt(nric.substring(7,8),10) * 2;
       chkno = chkno + weight;
    
       //Get the Remainder and minus it from 11.
       chkno = chkno%11;
       chkno = 11 - chkno;
       if(this.isLastCharInNRIC(chkno,firstChar,lastChar) == false) {
           // ctr.focus();
           return ('Invalid NRIC/FIN/CBC');
           // return false;
       }
       return true;
   },
  
    fn_confirmDialog: function  (title,dialogText, fn_callback) {
        $('body').append("<div id='confirm_dialog' title='" + title + "'><p style='margin-top:10px;font-size:16px;'>" + dialogText + "</p></div>");
        $('#confirm_dialog').dialog({
            minHeight:180,
            width: 500,
            modal:true,
            autoResize:true,
            resizable:true,
            draggable:false,
            close:function(event,ui) { $('body').find('#confirm_dialog').remove(); },
            buttons:
            {
                
                'Cancel':
                {  
                  text: 'Cancel',
                  'class': 'btn_action',
                  click: function(){
                    $(this).dialog('close');
                  }
                },
                'Confirm': { 
                  text: 'Confirm',
                  'class': 'btn_affirm',
                  click: function(){
                    if (typeof fn_callback === 'function') fn_callback.call();
                    $(this).dialog('close');
                  }
                }
               
                
            }
        });
    }, 
    fn_okDialog: function  (title,dialogText, fn_callback) {
        $('body').append("<div id='ok_dialog' title='" + title + "'><p style='margin-top:10px;font-size:16px;'>" + dialogText + "</p></div>");
        $('#ok_dialog').dialog({
            minHeight:180,
            width: 450,
            modal:true,
            autoResize:true,
            resizable:true,
            draggable:false,
            close:function(event,ui) { $('body').find('#ok_dialog').remove(); },
            buttons:
            {
                
                'Ok': {
                  text: 'Ok',
                  'class': 'btn_affirm',
                  click: function(){
                    if (typeof fn_callback === 'function') fn_callback.call();
                    $(this).dialog('close');
                  }
                }
               
                
            }
        });
    },
    isLastCharInNRIC: function(chkno,firstChar,lastChar)
    {
      var actualChar ="",
          list1 = ["A","B","C","D","E","F","G","H","I","Z","J"],
          list2 = ["K","L","M","N","P","Q","R","T","U","W","X"];
  
      if(firstChar == 'S' || firstChar == 'T') {  
        actualChar = list1[chkno-1];  
      }
      if(firstChar == 'G' || firstChar == 'F') {
        actualChar = list2[chkno-1];  
      }
      return (actualChar == lastChar);

    },
    getTreeDataUrl: function() {return treeDataUrl;},
    setTreeDataUrl: function(val) {treeDataUrl=val;},
    getTree: function(){ 
      if(!!!$tree) $tree= $('#orgTree') ; 
      return $tree; 
    },
    setTree: function(obj){if(!!obj) $tree = obj;},
    setTreeUrl: function(){
      if(!!$("#currentTreeParent").val()){
        Global.setTreeDataUrl(Global.getTreeDataUrl()+'/' + $("#currentTreeParent").val());
      }
    },
    moveUpTree:function(){
      var n = $tree.tree('getSelectedNode');
      if(!!n.parent.name) {
        $tree.tree('selectNode',n.parent);
        return n.parent;
      }else return n;
    },
    toggleQuestionMenu: function(e){
        e.preventDefault();
        Global.d('toggleQuestionMenu',$("#question_dropdown_items"));
        setTimeout(function(){
          $("#question_dropdown_items").toggle();
        },100);
    },
    toggleFeesMenu: function(e){
        e.preventDefault();
        Global.d('toggleFeesMenu',$("#fees_dropdown_options"));
        setTimeout(function(){
          $("#fees_dropdown_options").toggle();
        },100);
    },
    aws2CloudFront: function(str){
      return str.replace('http://'+Global.defaultS3Bucket+'/', Global.defaultCloudFront);
    },
    initTree: function(opts){
      var str = '';
      if(typeof opts.staff !== 'undefined') str += '&staff='+opts.staff;
      if(typeof opts.withdrawn !== 'undefined') str += '&withdrawn='+opts.withdrawn;
      if(!!str) treeDataUrl+= '?'+str;
      return Global.getTree();
    },
    initHandlebars: function(){
      if(typeof Handlebars !== 'undefined'){
        Handlebars.registerHelper('nl2br', function(text) {
            return Global.nl2br(text);
        });

        Handlebars.registerHelper('profilePhoto', function(id,photo_var,role,gender,updated) {
          if(!!photo_var && (photo_var==0 || photo_var==1)){
              role   = (typeof role !== 'undefined') ? role  : 'stdnt';
            gender = (typeof gender !== 'undefined' && ['boy','girl','male','female'].indexOf(gender)>-1 ) ? gender : 'male' ;
            return '/img/defaults/def_'+ role.toLowerCase() +'_'+gender.toLowerCase() + '_59x59.png';
          }else 
          {
            var domain = Global.defaultCloudFront;
            if(typeof updated === 'string'){
              if(current_date == updated.substring(0,10)) domain = Global.defaultLittlelivesBucket ;
            }
            return domain +'users/profile/'+id+'/profile_thb.jpg'+(!!updated ? '?ut='+encodeURI(updated) : '');
          }
        });
        Handlebars.registerHelper('equal', function(v1, v2, options) {
            if(v1 == v2) {
              return options.fn(this);
            }
            return options.inverse(this);
          });
        
        Handlebars.registerHelper('notequal', function(v1, v2, options) {
            if(v1 == v2) {
              return  options.inverse(this);
            }
            return options.fn(this);
          });
        Handlebars.registerHelper("debug", function(optionalValue) {
          Global.js_debug("Current Context");
          Global.js_debug("====================");
          Global.js_debug(this);
         
          if (optionalValue) {
            Global.js_debug("Value");
            Global.js_debug("====================");
            Global.js_debug(optionalValue);
          }
        });

        Handlebars.registerHelper('getTerm',function(str){
          switch(str){
            case 'term1': return 'Term 1'; 
            case 'term2': return 'Term 2'; 
            case 'term3': return 'Term 3'; 
            case 'term4': return 'Term 4'; 
            default: return 'Term';
          }
        });
        Handlebars.registerHelper('getColorRow',function(e){
          return e%2 ? 'light' : 'dark';
        });
      }
    },
    uuid:function(){
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    }
  };
})();  

(function ($,d) {
  // var d = document;
  $.fn.loadingUI  = function(opts) {
    var msg = 'Loading..';
    if($('.loader').length)  $('.loader').remove();
    if(!isNull(opts) && !!opts.message) msg = opts.message;
    this.prepend(newDiv(msg));
    if (navigator.userAgent.match(/iPad/i) != null)  setTimeout($.unloadingUI(),10000);
  }; 
  $.loadingUI  = function(opts){
    var msg = 'Loading..';
    if($('.loader').length)  $('.loader').remove();
    if(!isNull(opts) && !!opts.message) msg = opts.message;
    $('body').find('.page_wrapper, .container').prepend(newDiv(msg));
    if (navigator.userAgent.match(/iPad/i) != null)  setTimeout($.unloadingUI(),10000);
  };

  $.unloadingUI  = function(){
    $('.loader').fadeOut(1000, function() { $('.loader').remove(); });
  };

  function isNull (obj) {
    return (obj == null || obj == undefined);
  }

  function newDiv(msg){
    var n = d.createElement("div");
    n.className = 'loader';
    n.innerHTML = '<p>' + msg + '</p>';
    return n;
  }

  //document ready
  $(function() {
     $.ajaxSetup({cache:false ,timeout:Global.ajaxTimeOut});
      if(typeof $.datepicker === 'object'){
        var old_goToToday = $.datepicker._gotoToday;
        $.datepicker._gotoToday = function(id) {
         old_goToToday.call(this,id);
         this._selectDate(id);
       };
     }
    if (typeof JSON.stringify !== 'function') {
      JSON.stringify = function (value, replacer, space) {return '';};
    }
    if (typeof JSON.parse !== 'function') {
      JSON.parse = function (text, reviver) { return {}; };
    } 
  });
})(jQuery,document);