window.App = window.App || {};

window.App.preloader = (function($) {

    function init() {
        var $body = $('body');

        // Remove preloader faster - on DOMContentLoaded instead of full window load
        // This makes the page feel much faster
        $(document).ready(function() {
            // Small delay to ensure smooth transition
            setTimeout(function() {
                $body.removeClass('is-preload');
                $body.addClass('is-loaded');
                // Also clear any exit state that might have lingered
                $body.removeClass('page-exit page-enter');
            }, 100);
        });
    }

    return {
        init: init
    };

})(jQuery);
