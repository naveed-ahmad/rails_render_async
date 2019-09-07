function loadAsyncContent(containerId) {
    var element = $(containerId);
    var $element = document.querySelector(containerId);

    var path = element.data('path');
    var method = element.data('method') || 'GET';
    var interval = parseFloat(element.data('interval'));
    var event = element.data('event');
    var retryCount = parseInt(element.data('retry-count'), 0);
    var errorMessage = element.data('error-message') || '';
    var lazy = element.data('lazy');
    var threshold, root, rootMargin;
    var lazyLoadObserver;

    console.log("Interval is ", interval)

    if (lazy) {
        threshold = lazy['threshold'] || 0;
        root = lazy['root'];
        rootMargin = lazy['margin'] || '0px';

        if (root) {
            root = document.querySelector(root);
        } else {
            root = document.body;
        }
    }

    var lazyLoaded = function (element) {
        element.data("lazy-loaded", true);

        if(lazyLoadObserver)
          lazyLoadObserver.unobserve($element);

        lazyLoadObserver=null;
    }

    var isLazyLoaded = function (element) {
        return true === element.data("lazy-loaded");
    };

    var _listener = function (currentRetryCount) {
        var headers = {};
        var csrfTokenElement = document.querySelector('meta[name="csrf-token"]')
        if (csrfTokenElement)
            headers['X-CSRF-Token'] = csrfTokenElement.content

        $.ajax({
            url: path,
            method: method,
            headers: headers
        }).done(function (response) {
            if(lazy) lazyLoaded(element);
            element.removeClass('render-async');

            if (interval) {
                element.empty();
                element.append(response);
            } else {
                element.replaceWith(response)
            }

            if (event && event.length > 0) {
                var _event = undefined;
                if (typeof (Event) === 'function') {
                    _event = new Event(event);
                } else {
                    _event = document.createEvent('Event');
                    _event.initEvent(event, true, true);
                }
                document.dispatchEvent(_event);
            }
        }).fail(function (response) {
            var skipErrorMessage = false;

            if (retryCount > 0) {
                skipErrorMessage = retry(currentRetryCount)
            }
            if (skipErrorMessage)
                return;
            element.html(errorMessage);
        });
    }

    if(interval > 0){
        var _interval;
        retryCount = 0; // does interval and retry even make sense?
         _interval = setInterval(_listener, interval);
    }

    var _lazyListener = function () {
        console.log(containerId, " will be lazy loaded", path)
        lazyLoadObserver = new IntersectionObserver(function (entries) {
            if (entries[0].intersectionRatio) {
                if(!isLazyLoaded(element))
                    _listener();
            } else {
                console.log('hidden');
            }
        }, {
            root: root,
            rootMargin: rootMargin,
            threshold: threshold
        });

        lazyLoadObserver.observe($element);
    }

    if (retryCount > 0) {
        var retry = function (currentRetryCount) {
            if (typeof (currentRetryCount) === 'number') {
                if (currentRetryCount >= retryCount)
                    return false;

                _listener(currentRetryCount + 1);
                return true;
            }

            _listener(1);
            return true;
        }
    }

    lazy ? _lazyListener() : _listener();
}

$(document).on('page:load.rails_script turbolinks:load.rails_script', function () {
    $(".render-async").each(function () {
        var id = $(this).attr('id');
        loadAsyncContent("#"+id);
    })
});