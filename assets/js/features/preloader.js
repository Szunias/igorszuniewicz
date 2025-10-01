window.App = window.App || {};

window.App.preloader = (function($) {

    function init() {
        var $body = $('body');

        // Remove preloader immediately - no waiting
        // Preloader is mainly useful for first visit, after that it just slows down navigation
        var removePreloader = function() {
            $body.removeClass('is-preload');
            $body.addClass('is-loaded');
            $body.removeClass('page-exit page-enter');
        };

        // Check if page was visited before (from cache/F5)
        if (performance.navigation.type === 1 || sessionStorage.getItem('intro-seen')) {
            // Page reload or already visited - remove preloader instantly
            removePreloader();
        } else {
            // First visit - very short delay
            $(document).ready(function() {
                setTimeout(removePreloader, 50);
            });
        }
    }

    return {
        init: init
    };

})(jQuery);
