window.App = window.App || {};

window.App.preloader = (function($) {

    function init() {
        var $window = $(window),
            $body = $('body');

        $window.on('load', function() {
            $body.removeClass('is-preload');
            $body.addClass('is-loaded');
            // Also clear any exit state that might have lingered
            $body.removeClass('page-exit page-enter');
        });
    }

    return {
        init: init
    };

})(jQuery);
