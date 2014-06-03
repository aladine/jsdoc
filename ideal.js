/**
 * @namespace Attendance
 */
(function() {
    window.Attendance = window.Attendance || {};
}());


/**
 * @namespace Main
 * @memberof Attendance
 * @requires {@link Attendance.Helpers}
 */
(function() {
    "use strict";
    Attendance.Main = (function () {
      /**
       * @function privateMethod
       * @memberof! Attendance.Main
       * @return void
       */
      var privateMethod = function(){
        //code
      };
      /**
       * @function init
       * @memberof! Attendance.Main
       * @param {object} opts Initialized values
       * @param {string} opts.date Current selected date
       * @param {string} opts.role Current logged in user role
       * @example 
       * Attendance.Main.init({
       *    role: 'tchr',
       *    date: '20140605'
       * });
       * @return void
       */
      var init = function(opts){
         //code
         privateMethod();
      };
      /**
       * @function reloadStudentAccount
       * @memberof! Attendance.Main
       * @param  {string} user_id User Id
       * @return void
       */
      var reloadStudentAccount = function(user_id){
         //code
         privateMethod();
      };
      return {
        init : init,
        reloadStudentAccount : reloadStudentAccount
      }
    }());      
}());    

/**
 * @namespace Roster
 * @memberof Attendance
 * @requires {@link Attendance.Helpers}
 */
(function() {
  "use strict";
  Attendance.Roster = (function () {
    /** @const temperature_leading_number */ 
    var tlead=35; 
    /** @const temperature_trailing_number */ 
    var ttrail=0;
    /** @const temperature_panel */ 
    var tpanel=1;
    /** @const temperature_minimum */ 
    var temperature='35.0';

   
    /**
     * @function fn_validate_temp
     * @memberof! Attendance.Roster
     * @param  {float} num raw temperature
     * @return {string} Result of Temperature
     */
    var fn_validate_temp = function(num){
      var t = (parseFloat(num)).toFixed(1);
      return t < 34.9 || t > 41.9 ? '35.0' : t+'';
    };

    /**
     * @function fn_disable_temp_btn
     * @memberof! Attendance.Roster
     * @param  {element} button
     * @return void
     */
    var fn_disable_temp_btn = function(btn){
      btn.removeClass().addClass('has_temp').text('-');
    };
   /**
     * @function init
     * @memberof! Attendance.Main
     * @public
     * @param {object} opts Initialized values
     * @param {string} opts.date Current selected date
     * @param {string} opts.role Current logged in user role
     * @example 
     * Attendance.Roster.init({
     *    role: 'tchr',
     *    date: '20140605'
     * });
     * @return void
     */
    var init = function(opts){
       //code
    };
    return {
        init : init,
    }
    }());      
}()); 