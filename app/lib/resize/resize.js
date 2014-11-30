$(function() {
    function abso() {
        $('#landing').css({
            position: 'absolute',
            width: $(window).width(),
            height: $(window).height()
        });
    }
    $(window).resize(function() {
        abso();         
    });
    abso();
});