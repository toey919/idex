var jQueryPrivate = $.noConflict();
/*======================================================*/
/*jQuery(window).resize( function(){
  if ($(window).width() < 768) {
    console.log($(window).width());
    $('.wt-scroller').css('height', "auto");
  }
});*/

jQueryPrivate(document).scroll(function() {
  var y = $(this).scrollTop();
  if (y > 200) {
    jQueryPrivate('.btn-sidebar-toggle').fadeIn();
  } else {
    jQueryPrivate('.btn-sidebar-toggle').fadeOut();
  }
});

jQueryPrivate('#sidebar,.btn-sidebar-toggle').click(function(){
  jQueryPrivate('.sidebar-hide').toggle();
  jQueryPrivate('.content-area').toggleClass('full-width');
});

