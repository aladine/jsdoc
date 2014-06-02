/**
 * @namespace
 */
var Attendance = Attendance || {};

/**
 * Attendance
 * @class Attendance
 * @classdesc Attendance Main Page
 * @return {function}
 */
(function () {
	"use strict";
	/**
     * This value will be replaced automatically, so you don't need to edit it.
     * @name collie.version
     */
    Attendance.version = "{{version}}";
	
	var base_url='',
		is_bottom_loading = false,
		offset = 0,
		curr_date= '20130101';
	
	/**
	 * [getUrlFromNode Get URL from a Node]
	 * @lends Attendance# 
	 * @param  {object} node
	 * @return {string} 
	 */
	var getUrlFromNode = function(node){
		var url;
		if(node){
			url = node.url + '/' + node.id;
			if(node.id=='staff') url += '?parent='+ node.parentid;											
		}else{
			url = '/attendances/get_class_summary/'+curr_date+'/null';
		}
		return url;
	};	
	var template = function(){
		
	};
	
	/** [reset_scrolling description] */
	var reset_scrolling = function(){
		is_bottom_loading = false;
		offset = 0;
	};
	return {
	
	/**
	 * [init description]
	 * @param  {object} opts {role,date}
	 * @example <caption>As a teacher, date 5 Jun 2014</caption>
 	 * Attendance.init({
	 *	role: 'tchr',
	 *	date: '20140605'
	 * });
	 * @returns void
	 */
		init: function(opts){
			var _this = this, container = $('#attendance_list_wrapper');
			var $tree = Global.initTree({staff:true,withdrawn: false});	
			
			Handlebars.registerPartial("dayoff_links_template", $("#dayoff_links_template").html());
			Handlebars.registerPartial("no_att_template", $("#no_att_template").html());
			Handlebars.registerPartial("with_att_template", $("#with_att_template").html());
			Handlebars.registerPartial("holiday_template", $("#holiday_template").html());
			template = Handlebars.compile($("#template").html());

			Global.initHandlebars();

			//attach the tree plugin
			if (typeof $tree !== 'undefined') {
				curr_date = opts.date || '20130101';

				$tree.tree($.extend({},{
			 		dataUrl:Global.getTreeDataUrl(),
					onCreateLi: function(node, $li) {			
						node.url='/attendances/get_class_summary/'+curr_date;		
					}
				},Global.defaultTreeConfig));
				/** tree init */
				$tree.bind('tree.init', function() {							
					var node = $tree.tree('getSelectedNode');
					$.loadingUI({message: 'Loading..'});
					// console.log(node);
					$.ajax({
						type: "GET", 
						url: getUrlFromNode(node) ,
						data: {},
						dataType:'json'
						// timeout: Global.ajaxTimeOut
					}).done(function( res ){
						var org_name = node.name || '';
						$(".page_title").html(' Attendance');
						container.html(template(res));

						//using handlebars

					}).fail(function  () {
						// Global.fn_flashMessage();
					}).always(function(){
						$.unloadingUI();
					});

					$(window).scroll(function(){
						var closeToBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 100);
						if(closeToBottom) {
							if(!is_bottom_loading){
								
								offset++;
								var node  =$tree.tree('getSelectedNode');
								var url = getUrlFromNode(node) + '/'+offset;
								// disable loading for staff
								if(url.match(/staff/) != null) return false;

								is_bottom_loading = true;

								$.loadingUI();
								$.ajax({
									type: "GET", url: url ,data: {},dataType:'json'
									// timeout: Global.ajaxTimeOut
								}).done(function( res ){
									// var org_name = (typeof node.name === 'undefined')? '' : node.name;
									container.append(template(res));

									//if res is empty, then the page stop loading more contents, otherwise unblock the ajax call and finish
									is_bottom_loading = (res.classes.length == 0);
									// console.log(is_bottom_loading);
								}).fail(function  () {
									// Global.fn_flashMessage();
									is_bottom_loading = false;
								}).always(function(){
									$.unloadingUI();
								});
								
							}
						}
					});		
			});

			
			/**
			 * Tree Click
			 * @param  {event} e
			 * @return {bool}
			 */
			$tree.bind('tree.click', function(e) {
				var node = e.node;
				$.loadingUI({message: 'Loading..'});

				$.ajax({
					type: "GET", 
					url: getUrlFromNode(node) ,
					data: {},
					dataType:'json'
					// timeout: Global.ajaxTimeOut
				}).done(function( res ){
					container.html(template(res));
					$(".page_title").html(' Attendance');
					reset_scrolling(); // allow infinite scrolling
				}).fail(function  () {
					Global.fn_flashMessage();
				}).always(function(){
					$.unloadingUI();
				});

				if (node.hasChildren()) {
					$tree.tree('toggle', node);
				}
			});				
		}
	},
	/**
	* Declare holiday
	* @access public
	* @returns void
	*/
	fn_declare_holiday: function(){
		var container = $('#attendance_list_wrapper');
	$('.declare_day_off').live('click',function(e){
		e.preventDefault();
		// var t=$(this);
		var url = $(this).attr('href');
		$( "#dialog_dayoff" ).dialog({
			resizable: false,
			'width':450,
			'height':220,
			modal: true,
			buttons: {
				"Cancel": {
					text: 'Cancel',
					'id':'btn_cancel_declare_day_off',
					'class': 'btn_action',
					click: function() {
						$(this).dialog( "close" );
					}
				},
				"OK": {
					text: 'OK',
					'id':'btn_affirm_declare_day_off',
					'class': 'btn_affirm',					
					'click': function() {
						
						$.loadingUI();
						$.ajax({
							type: "POST",
							url: url ,
							data: {'reason':$('#DayOffReason').val()},
							dataType: 'json'
						}).done(function( data ) {
							$.unloadingUI();
							// is_saved = true;
			       	// var data = JSON.parse(res);
					if(data.status=='ok'){

				       	reset_scrolling();
				       	$.get('/attendances/get_class_summary/'+data['date']+'/'+data['org_id']+'/'+offset, 
				       		function(res){
				       			// if($('.org_chart_wrapper').length){
										//if this is attendance main page
										container.html(template(res));
									// }else{
									// 	Global.fn_flashMessage('Declare day off successful');
									// 	setTimeout(function(){window.location = '/attendances/index/'+data['date'];},1000);
									// }
									return false;
								},'json');
			       	}
			       	// return false;
			       }).fail(function  () {
			       	$.unloadingUI();
			       	Global.fn_flashMessage('Something is not working... You may want to refresh the page.');
			       });
			       
			       $( this ).dialog( "close" );
			   }
			}
		}
	});
});
/** Cancel Day off */
$('.cancel_day_off').live('click',function(e){
	e.preventDefault();
	/** @type {string} */
	var url = $(this).attr('href');
	$.ajax({
		type: "POST",
		url: url ,
		data: {},
		dataType: 'json'
	}).done(function( data) {
		// var data = JSON.parse(res);
		if(data.status=='ok'){
			reset_scrolling();
			$.get('/attendances/get_class_summary/'+data['date']+'/'+data['org_id']+'/'+offset, function(result){
				Global.fn_flashMessage('Cancel day off successful');
				container.html(template(result));
				return false;
			},'json');
		}
		// return false;
	}).fail(function  () {
		Global.fn_flashMessage('Something is not working... You may want to refresh the page.');
	});
	
});
}
};
})();  
/**
 * Attendance Roster
 * @class AttendanceRoster
 * @classdesc Attendance Taking Page
 */
var AttendanceRoster = (function () {
	"use strict";

	/** @const temperature_leading_number */ 
	var tlead=35; 
	/** @const temperature_trailing_number */ 
	var ttrail=0;
	/** @const temperature_panel */ 
	var tpanel=1;
	/** @const temperature_minimum */ 
	var temperature='35.0';
	// var object = {};

	var remarks='';

	var base_url='';
	var is_saved = true;
	var offset = 0;
	

	var defaultAttdStatus = '';
	var defaultTempStatus = '';
	var hasAttendance = false;
	/**
	 * Sets the component's root element to the given element.
	 * Considered protected and final.
	 * @param {Element} element Root element for the component.
	 * @protected
	 */
	var fn_validate_temp = function(num){
		var t = (parseFloat(num)).toFixed(1);
		return t < 34.9 || t > 41.9 ? '35.0' : t+'';
	};
	/** @type {Foo.<X>} */ 
	var fn_disable_temp_btn = function(btn){
		btn.removeClass().addClass('has_temp').text('-');
	},

	fn_enable_temp_btn = function(btn){
		btn.removeClass().addClass('temp').text('');
	},

	/** @const temperature_minimum */ 
	isAbsent = function(btn){
		return btn.hasClass('absent') || btn.hasClass('is_absent');
	};


	var loadDefaultSettings = function(){		
		if(!hasAttendance){
			var c = defaultAttdStatus !== 'none' ? 'is_'+ defaultAttdStatus : 'present';			
			$.each($('.is_present, .present, .absent, .is_absent'), function() {
				$(this).attr('status',defaultAttdStatus).removeClass().addClass(c);
				
				if(defaultTempStatus=='ok'){
					var temperatureButton=$(this).closest('td').siblings().find('.temp, .has_temp');
					temperatureButton.removeClass().addClass('temp_ok').text(0);
							// TODO: add the time here in payload
							temperatureButton.attr('payload','{"1":{"t":"0","time":"00:00"}}');
						}
			});
		}else{
				//if attendance record exist
				$.each($("td.present_col a"),function(){
					var ele = $(this);//console.log(ele);
					var button = ele.parent().siblings('.temp_col').find('a');
					if(isAbsent(ele)){
						$.each(button,function(i,el){
							fn_disable_temp_btn($(el));
						});	
					}
					
				// }	
			});		
			}
		},

		getRowData = function(row) {
			var attendanceButton = row.find('td.present_col').find('a'); 
			var remarkButton = row.find('td.remarks_col').find('a'); 

			//temperatureButton is the first record of temperature, other values stored in payload
			var temperatureButton = row.find('td.temp_col').find('li:eq(0)').find('.temp, .has_temp,.temp_ok'); 

			var record = {};
			record['id']=attendanceButton.attr('rel');
			record['status']=attendanceButton.attr('status');
			record['user_id']=attendanceButton.attr('id');
			if (typeof temperatureButton.attr('payload') != 'undefined') {
				record['tp'] = $.parseJSON(temperatureButton.attr('payload'));
				record['temperature'] = $.trim(temperatureButton.html());
			}
			
			// if($.trim(remarkButton.html())!=''){
			record['remarks'] = $.trim(remarkButton.html());
			// }
			return record;	
		},	

		getTempTime = function(temperature,time){
			// console.log(temperature,time);
			var t = {'t':temperature};
			if(temperature=="0") t['time'] = "00:00";
			else{
				var h = new Date().getHours();
				var m = new Date().getMinutes();

				t['time'] =  !!time ? time : (h  + ':' + m) ;
			}
			
			return t;
		},

	// Mark Attendance
	markAttendance = function(button){
		Global.js_debug('markAttendance');
		//get all the information about the student from the attributes of the link button
		// var record = {};
		//var checkInField=button.closest('td').siblings('.time_col').find('.time_in');
		var temperatureButton=button.closest('td').siblings().find('.temp, .has_temp,.temp_ok');
		
		toggleAttendanceButtons(button);
		// record = getRowData(button.parent().parent());
		// Global.js_debug(record);

		// if(Global.debugMode) console.log(button);
		// if(Global.debugMode) console.log(temperatureButton);
		//record attendance
		if(button.hasClass('is_present')){
			//	alert('test');
			
			// record['check_in']= getCheckInTime();
			//alert(record['check_in']);
			temperatureButton.removeClass('has_temp').addClass(defaultTempStatus==='ok' ? 'temp_ok': 'temp');
			if(defaultTempStatus==='ok' ) {
				temperatureButton.text(0);
				var tpayload = {};
				tpayload[1]=  getTempTime('0');
				// record['temperature_payload'] = tpayload;
			}
		}else if(button.hasClass('is_absent') || button.hasClass('absent')){										
			// record['check_in']='-';
			fn_disable_temp_btn(temperatureButton);	
			temperatureButton.removeAttr('payload');	
			// delete record['temperature_payload'];		
		}	
		$("#btnEnhancedSave").removeClass('btn_soft').addClass('btn_affirm').text('Save Attendance');
		$("#btnSave").removeClass('btn_soft').addClass('btn_affirm').text('Save');
		is_saved = false;
		return true;
	},
	update_temperature = function(container,value,time_value){
			var h,m;
			container.find('a').removeClass('temp').removeClass('temp_ok').addClass('has_temp').text(value + ' ºC');

			if(!!time_value){
				h = time_value.substring(0,2);
				var l = time_value.substring(2);
				container.find('span.temp_time').text((h>12 ? h-12 :h)  + l + (h>11 ? 'pm' : 'am'));
				return getTempTime(value,time_value );	
			}else{
				var t = new Date();
				h = t.getHours();
				m = t.getMinutes();
				if (m<10) m = '0'+m;
				var str = (h>12 ? h-12 :h)  + ':' + m + (h>11 ? 'pm' : 'am');
				container.find('span.temp_time').text(str);
				return getTempTime(value, h+":"+t.getMinutes());	
			}
		},
		twodigits = function(n){
			Global.js_debug('twodigits'+n);
			n = '' + n;
			var t = (n.substring(0,1)=='0') ? parseInt(n.substring(1,2)) : parseInt(n);
			if(isNaN(t)) return '00';
			return (t<10) ? '0'+t : t;
		},

	/*
	 *  function to record the temperature
	 */
	 recordTemperature = function(button){
	 	Global.js_timeStart('recordTemperature');
	 	var record = getRowData(button.closest('td.temp_col').parent());
	 	var col_index = button.parent('li').data('id'); 
	 	var tpanel = parseInt(col_index);
	 	var dl = $( ".temperature_pad");
	 	// var tpayload = [];
	 	
	 	var tpayload = !_.isEmpty(record['tp']) ? record['tp'] : {}; //temperature payload
	 	
	 	var attendanceButton=button.closest('td').siblings().find('.present, .is_present');
	 	var temperatureButtons=button.parent().parent().find('.temp, .has_temp, .temp_ok');
		//load default temperature value	
		if(button.text()!='-' && button.text()!=0) temperature=button.text();

		//Remove degree Celsius
		temperature=temperature.substring(0, 4);

		var digits=temperature.split(".");

		if(digits){
			tlead=digits[0];
			ttrail=digits[1];
		}
		//Remove degree Celsius
		if(ttrail){
			var ttrail_num=ttrail.split("º");
			ttrail=ttrail_num[0];
		}
		

		//select the temperature based on the current temperature
		$(".lead a",dl).removeClass('selected');
		$(".trail a",dl).removeClass('selected');
		$(".lead",dl).find('#' + tlead).addClass('selected');
		$(".trail",dl).find('#' + ttrail).addClass('selected');


		
		//launch the temperature pad
		dl.dialog({
			modal:true,
			position: ['top', 50],
			width: 367,
			open: function(){
				var n;
				Global.js_debug(tpayload[tpanel]);
				// console.log();
				if(typeof tpayload[tpanel] === 'undefined' || typeof tpayload[tpanel]['time'] === 'undefined' || tpayload[tpanel]['time']=='00:00'){
					n = new Date();
					$(this).find('input[name="temp_time_hour"]').val(twodigits(n.getHours()));
					$(this).find('input[name="temp_time_minute"]').val(twodigits(n.getMinutes()));	
				}else{
					n = tpayload[tpanel]['time'];
					$(this).find('input[name="temp_time_hour"]').val(n.substring(0,2));
					$(this).find('input[name="temp_time_minute"]').val(n.substring(3,5));
				}
				
			},
			buttons: {
				"Remove": {
					text: 'Remove',
					'class': 'btn_action',
					'click': function() {
						is_saved =  false;
						// remove_temperature(button.parent());
						if(defaultTempStatus == 'ok'){
							button.addClass('temp_ok').removeClass('has_temp').text(0);
							tpayload[tpanel] =  getTempTime('0');
						}else {
							delete tpayload[tpanel];
							button.addClass('temp').removeClass('has_temp').text('');
						}
						button.parent().find('span.temp_time').text('-');
						temperatureButtons.attr('payload',JSON.stringify(tpayload)); 
						$("#btnEnhancedSave").removeClass('btn_soft').addClass('btn_affirm').text('Save Attendance');
						$(this).dialog( "close" );
					}
				},				
				"Done": {
					text: 'Done',
					'class': 'btn_affirm',					
					'id': 'btn_done_temperature',					
					'click': function() {						
						is_saved =  false;
						temperature = fn_validate_temp(temperature);
						var temp_value = twodigits($(this).find('input[name="temp_time_hour"]').val())+':' + twodigits($(this).find('input[name="temp_time_minute"]').val());
						Global.js_debug('temp_value'+temp_value);
						tpayload[tpanel] = 	update_temperature(button.parent(),temperature,temp_value);
						attendanceButton.removeClass('present').addClass('is_present').attr('status','present');

						temperatureButtons.attr('payload',JSON.stringify(tpayload)); 	

						$("#btnEnhancedSave").removeClass('btn_soft').addClass('btn_affirm').text('Save Attendance');
						$(this).dialog( "close" );
					}
				}
			}
		});

	 	Global.js_timeEnd('recordTemperature');
		


},

	/*
	 *  Function to add Remarks
	 */

	 addRemarks = function(button){
	 	Global.js_debug('addRemarks');
	 	$('.other',"#remarks_pad").val('');		
	 	checkRemarks(button.text());
	 	
	 	
	 	var attendanceButton=button.parent().closest('td').siblings().find('.present, .is_present, .absent, .is_absent');

	 	$( "#remarks_pad" ).dialog({
	 		width: 740,
	 		position: ['middle', 50],
	 		modal: true,
	 		buttons: {
	 			"Cancel": {
	 				text: 'Cancel',
	 				'class': 'btn_action',
	 				'click': function() {
	 					$(this).dialog( "close" );
	 				}
	 			},			
	 			"Done": {
	 				text: 'Done',
	 				'class': 'btn_affirm',
	 				'id': 'btn_done_remark',
	 				'click': function() {																
	 					is_saved = false;
						//loop through all the elements that are selected						
						remarks = $('.remarks_sel_wrapper > div').find('a.selected').map(function () {
							return $(this).attr('rel');
						}).get();
						
						
						var record_remarks = remarks.toString();
						var v = $('.other',"#remarks_pad").val();
						if(v.length >1){
							if(remarks.toString().length >0) {
								record_remarks = record_remarks + ' , ' + v;
							}else{
								record_remarks = v;
							}
						}

						if(record_remarks.length >0) {
							button.parent().removeClass('add_remark').addClass('edit_remark');
							button.text(record_remarks);			


						}else{
							button.parent().removeClass('edit_remark').addClass('add_remark');
							button.text('');		
						}

						var isLate = record_remarks.toLowerCase().indexOf('late') > -1;
						if(isLate){
							attendanceButton.addClass('is_late');
						}else{
							attendanceButton.removeClass('is_late');
						}
	 					Global.fn_enable_button($("#btnEnhancedSave")).text('Save Attendance');
	 					$(this).dialog( "close" );
						}
					}
				}				
			});


},


	//function to set the value of checkboxes to true based on an existing remarks
	checkRemarks = function(currentRemarks){
		Global.js_debug('checkRemarks');
		var arr = [];
		if(currentRemarks.length > 0) arr = currentRemarks.split(',');
		//uncheck all
		
		$('#remarks_pad .remarks_sel_wrapper > div').find('a.selected').removeClass('selected');

		if(arr.length) for (var i in arr) {
			if(arr.hasOwnProperty(i)){
			//	console.log(trim(arr[i]));
			if($("a[rel^='" + trim(arr[i]) + "']").length >0) {
				$("a[rel^='" + trim(arr[i]) + "']").addClass("selected");
						// console.log(trim(arr[i]));
					}else{
						// console.log('hhh' + trim(arr[i]));
						// $(".other",'#remarks_pad').val($(".other").val() + ' ' + trim(arr[i]));
						$(".other",'#remarks_pad').val(trim(arr[i]));
					}
					
				}
			}
			return true;
		},

  	//display the temperature panel
  	showCurrentTemperaturePanel = function(){
  		$("td.temp_col > ul").find('li').hide();
  		$("td.temp_col > ul").find('li[data-id="' + tpanel +'"]').show();
  		$("#temperaturePanel").text('Temp ' + tpanel);
  	},

  	calendar_customizations_pad = function(number) {
  		return (number < 10 ? '0' : '') + number;
  	},

	//toggle attendance buttons and update summary
	toggleAttendanceButtons = function(button){
		if(button.hasClass('present')){
			button.removeClass('present').addClass('is_present');
			button.attr('status','present');
		}else if(button.hasClass('is_present')){
			button.removeClass('is_present').addClass('is_absent');
			button.attr('status','absent');
		}else if(button.hasClass('is_absent')){
			button.removeClass('is_absent').addClass('is_present');
			button.attr('status','present');
		}
		updatetotals();
	},

	updatetotals = function(){
		$('#totalPresentStudents').html($('.is_present').length);
		$('#totalAbsentStudents').html($('.is_absent').length);
	},
	trim = function(str) {
		return $.trim(str);
		//return str.replace('/^\s\s*/', '').replace('/\s\s*$/', '');
	};

	return {
		// getObject: function(){
		// 	return object;
		// },

		

		init: function (opts){
			if(Global.debugMode) console.log(opts);
			defaultTempStatus = opts.defaultTempStatus || '';
			defaultAttdStatus = opts.defaultAttdStatus || '';
			hasAttendance = opts.hasAttendance || false;
			loadDefaultSettings();			
			
			window.onbeforeunload = function(){
				if (!is_saved)  return  'You have unsaved attendance!';
			};
			
		 showCurrentTemperaturePanel();//temperature related functions

		/*
		 *  Attendance Marking functions  
		 */

		 $(".present_col a,.absent_col a").live('click',function(e){
			//when the attendance button is clicked
			e.preventDefault();
			var button=$(this);			
			markAttendance(button);			
		});

		 $("td.temp_col a").live('click',function(e){
			// when the temperature button is clicked
			e.preventDefault();
			var button=$(this);
				//only allow temperature recording if the student is in the class
				var absentButton = button.closest('td').siblings().find('.is_absent,.absent');
				if(!absentButton.hasClass('is_absent'))	{
					recordTemperature(button);
				}				
			});

		 $("td.remarks_col a").live('click',function(e){
				// when the remarks button is clicked
				e.preventDefault();
				var button=$(this);
				addRemarks(button);		
			});
		 
		 
			//remarks panel
			
			$('.remarks_sel_wrapper > div').find('a').live('click',function(e){
				 //toggle remarks
				 if($(this).hasClass('selected')) {
				 	$(this).removeClass('selected');
				 }else{
				 	$(this).addClass('selected');
				 }
				 
			});	

		//The temperature panel  next button
		$("th.temp_col > .next").live('click',function(e){
			e.preventDefault();
			//prevent the 11th temperature record. Only max 10 records is allowed
			if(tpanel >9) return false;
			tpanel++;
			if(tpanel > 1){
				$("th.temp_col > .prev").removeClass('disabled');
			}
			showCurrentTemperaturePanel();
		});
		
		//The temperature header previous button
		$("th.temp_col > .prev").live('click',function(e){
			e.preventDefault();
			tpanel--;
			if(tpanel ==0){
				tpanel=1;
				$(this).addClass('disabled');
			}
			showCurrentTemperaturePanel();
			
		});
		
		//Temperature Pad leading numbers
		$(".temperature_pad > .lead a").live('click',function(e){		 
			e.preventDefault();
			tlead=$(this).attr('id');
			temperature=tlead + '.' + ttrail;
				//reset all
				$(".temperature_pad > .lead a").removeClass('selected');
				$(this).addClass('selected');
			});

		//Temperature Pad trailing numbers
		$(".temperature_pad > .trail a").live('click',function(e){		 
			e.preventDefault();
			ttrail=$(this).attr('id');
			temperature=tlead + '.' + ttrail;
			$(".temperature_pad > .trail a").removeClass('selected');
			$(this).addClass('selected');
		});
		
		//remarks pad
		//toggle the different remarks box
		$(".remarks_menu  a").live('click',function(e){		 
			e.preventDefault();
			var target=$(this).attr('href');
			$(".remarks_menu  a").removeClass('selected');
			$(this).addClass('selected');
			$('.remarks_box').hide();
			$('.other_wrapper').hide();
			// console.log(target);
			$(target).show();
		}); 
		
		this.fn_declare_holiday();
		this.fn_date_picker();
		

		/* Check in , check out function*/
		if($('span.check_in').length !== 0)
			$('span.check_in').next('img').tipsy({
				html:true,
				gravity: 'w',
				opacity: 1
		 		// ,offset:100
		 	});

		 //display all the check in times
		 $(".time_in > a, .time_out > a").live('click',function(e){
		 	e.preventDefault();
			//$(".time_track_wrapper").hide();
			var checkInWrapper = $(this).parents('.time_col').find('.time_track_wrapper');

			$('.time_track_wrapper').not(checkInWrapper).hide();
			checkInWrapper.toggle();
		});
		 //delete attendance checkin
		$(document).on('click','.remove_checkin',function(e){
			Global.js_debug('remove_checkin');
			e.preventDefault();
			if(!confirm('Are you sure to remove this checkin record?')){
				return false;
			}
			var _this = $(this);
			var attd_checkin_id = _this.data('id');
			$.loadingUI();
			$.ajax({
				type: "POST",
				url: '/attendances/remove_checkin/'+ attd_checkin_id + '/'+ _this.data('attendance_id') + '/'+ _this.data('class_id') + '/'+ _this.data('date'),
				data: {},
				dataType: 'json'
			}).done(function( res ) {
				if(res.status==='ok'){
					Global.fn_flashMessage('Checkin record is deleted successfully! If you have temperature record with this checkin, please remove it seperately!');
					$('#checkinout_'+attd_checkin_id).text('-');
					var p = _this.parent().parent();
					_this.parent().remove();
					if(!p.find('span.item').length){
						p.find('span.arrow-right').hide();
						p.removeClass('time_track_wrapper');
					}
				}
			}).fail(function  () {
				Global.fn_flashMessage();
			}).always(function(){
				$.unloadingUI();
			});
		});


		 


		//save button
		// POST payload to the controller
		$("#btnEnhancedSave , #btnSave").on('click',function(e){
			e.preventDefault(); 
			var submit_data = [];
			$('table.attendance_roster tbody').find('tr').each(function(i,e){
				var $e = $(e);
				// console.log($e);
				var user_id = $e.find('td.present_col a').attr('id');
				submit_data.push(getRowData($e));
			});
			Global.js_debug(submit_data);
			

			
			if($(this).hasClass('btn_affirm')){
				var old_last_saved = $("#btnEnhancedSave").find('span.last_saved').html() || '';
				// if (typeof old_last_saved === 'undefined')  old_last_saved = '';
				Global.fn_disable_button($("#btnEnhancedSave")).html('Saving...<span class="last_saved">'+old_last_saved+'</span>');
				Global.fn_disable_button($("#btnSave")).text('Saving...');

					//hide declare dayoff link
					$('a.link_day_off').hide();

					var url=$(this).attr('href');
					$.loadingUI();
					$.ajax({
						type: "POST",
						url: url,// + Global.timeSuffixUrl2(),
						data: {payload:JSON.stringify(submit_data)},
						dataType: 'json'
					}).done(function( response ) {
						is_saved = true;

						// var response=jQuery.parseJSON(res);
						// console.log(response);
						if(!!response.time){
							hasAttendance = true;
							Global.fn_enable_button($("#btnEnhancedSave")).html('Saved! <span class="last_saved">Last saved: ' + response.time + '</span>' );
							Global.fn_enable_button($("#btnSave")).text('Saved!');
							// object={};
						}else {
							Global.fn_okDialog('Information','Something wrong happened. Please refresh the page to record and save attendance.');
							Global.fn_enable_button($("#btnEnhancedSave"));
							Global.fn_enable_button($("#btnSave"));
						}
						return false;
					}).fail(function  () {
						// Global.fn_flashMessage();
						is_saved =  true;
						//window.location = '/attendances/error408';
						// Global.fn_okDialog('Information','Something wrong happened. Please refresh the page to record and save attendance.');
					}).always(function(){
						$.unloadingUI();
					});
				}
			});

$("#resetAttendance").on('click',function(e){
	e.preventDefault();
	var url=$(this).attr('href');
	// if(Global.debugMode) console.log(url);

	$( "#dialog-message" ).html('<p style="margin-top: 15px;font-size:16px;">Do you want to clear the attendance records?</p>');
	$( "#dialog-message" ).dialog({					
		modal: true,
		position: ['middle', 50],
		'width':450,
		'height':220,
		'title':'Clear Attendance',
		buttons: {
			"Cancel": function() {
				$( this ).dialog( "close" );
			},
			"Ok": {
				'text': 'Ok',
				'class': 'btn_affirm',	
				'id': 'btn_done_reset_attendance',
				'click':function() {
					$.loadingUI();	
					$.ajax({ 
						type: "POST",
						url: url,
						data: {},
						dataType: 'json'
					}).done(function( res ) {
						if(res.status === 'ok'){
							location.reload();
						}	
						return false;
					}).fail(function  () {
						Global.fn_flashMessage();
						$.unloadingUI();	
					});
				}
			}
		}
	});
});	
},

fn_declare_holiday: function(){
 $('.link_day_off').live('click',function(e){
 	var url=$(this).attr('href');

 	e.preventDefault();
 	$( "#dialog_dayoff" ).dialog({
 		resizable: false,
 		'width':450,
 		'height':220,
 		modal: true,
 		buttons: {
 			"Cancel": {
 				text: 'Cancel',
 				'class': 'btn_action',	
 				'id':'btn_cancel_declare_day_off',
 				click: function() {
 					$(this).dialog( "close" );
 				}
 			},
 			"OK": {
 				text: 'OK',
 				'class': 'btn_affirm',						
 				'id':'btn_affirm_declare_day_off',
 				'click': function() {
 					$.ajax({
 						type: "POST",
 						url: url ,
 						data: {'reason':$('#DayOffReason').val()},
			           	dataType: 'json'
			       }).done(function( res ) {
			       	is_saved = true;
			       	// var data = JSON.parse(res);
			       	if(res.status=='ok'){
			       		Global.fn_flashMessage('Declare day off successful');
						setTimeout(function(){window.location = '/attendances/index/'+res['date'];},1000);
					}
			    //    	$.get('/attendances/class_list/'+data['date']+'/'+data['org_id']+'/'+offset, 
			    //    		function(res){
			    //  //   			if($('.org_chart_wrapper').length){
							// 	// 	//if this is attendance main page
							// 	// 	$('.attendance_list_wrapper').html(res);
							// 	// }else{
							// 		// Global.fn_flashMessage('Declare day off successful');
							// 		// setTimeout(function(){window.location = '/attendances/index/'+data['date'];},1000);
							// 	// }

							// });
			       	
			    //    	return false;
			       }).fail(function  () {
			       	Global.fn_flashMessage('Something is not working... You may want to refresh the page.');
			       });
			       
			       $( this ).dialog( "close" );
			   }
			}
		}
	});
});

},
fn_date_picker: function(){
	//Date Picker to select Attendance Date
	$(".attendance_date_sel").live('click',function(e){
		e.preventDefault();
		var str;
		var default_date= new Date($(this).attr('data-year'),$(this).attr('data-month')-1,$(this).attr('data-day'));
		str = $('#startOfTerm').val();
		var start_str = str.split('-');
		var startTerm =	new Date(parseInt(start_str[0]),parseInt(start_str[1])-1,parseInt(start_str[2]));
		str = $('#endOfTerm').val();
		var end_str = str.split('-');
		var endTerm =	new Date(parseInt(end_str[0]),parseInt(end_str[1])-1,parseInt(end_str[2]));
		var uri;

		if(isNaN(startTerm) || isNaN(endTerm)){
			$( "#datepicker" ).datepicker({
				defaultDate: default_date,
				onSelect: function(dateText, inst) {
					var date = new Date(dateText);
					var new_date_text = date.getFullYear() +
					'' + calendar_customizations_pad(date.getMonth() + 1) +
					'' + calendar_customizations_pad(date.getDate());
					if($("#attendanceClassId").val()){
						uri = '/attendances/roster/' + $("#attendanceClassId").val() + '/' + new_date_text;
					}else{
						uri = '/attendances/index/'  + new_date_text;
					}

					window.location=uri;
				}
			});
		}else{
			$( "#datepicker" ).datepicker({
				defaultDate: default_date,
				minDate:  startTerm,
				maxDate:  endTerm,
				onSelect: function(dateText, inst) {
					var date = new Date(dateText);
					var new_date_text = date.getFullYear() +
					'' + calendar_customizations_pad(date.getMonth() + 1) +
					'' + calendar_customizations_pad(date.getDate());
					if($("#attendanceClassId").val()){
						 uri = '/attendances/roster/' + $("#attendanceClassId").val() + '/' + new_date_text;
					}else{
						 uri = '/attendances/index/'  + new_date_text;
					}

					window.location=uri;
				}
			});
		}
		
		
		$( "#calendar" ).fadeToggle('fast');
	});
}

};
})();  
