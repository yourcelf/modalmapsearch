// Requires jquery and google search APIs.
// google.load("jquery", "1");
// google.load("search", "1");

(function() {
    
var ModalMapSearch = function(options) {
    if (options === undefined) { options = {}; }

    var defaults = {
        MEDIA_PREFIX: 'img/',
        search: '',
        center: [42.360486, -71.08768],
        callback: function() {}
    };
    var MEDIA = {
        markers: [
            "markers/red_MarkerA.png",
            "markers/red_MarkerB.png",
            "markers/red_MarkerC.png",
            "markers/red_MarkerD.png",
            "markers/red_MarkerE.png",
            "markers/red_MarkerF.png",
            "markers/red_MarkerG.png",
            "markers/red_MarkerH.png",
            "markers/red_MarkerI.png",
            "markers/red_MarkerJ.png",
            "markers/red_MarkerK.png"
        ],
        shadow_icon: "markers/shadow50.png",
        spinner: "spinner.gif"
    }
    var i_to_a = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    var local;
    var form;
    var mapimg;
    var input;
    var div;
    var loading;
    var next_page;
    var prev_page;

    var search = function(search) {
        if (search) {
            input.val(search);
            div.find(".result").remove();
            loading.show();
            next_page.hide();
            prev_page.hide();
            local.execute(search);
        }
    };
    var searchDone = function() {
        div.find(".result").remove();
        if (!local.results || local.results.length == 0) {
            div.append("<div class='result'>No results.</div>");
            loading.hide();
            return;
        }
        if (local.cursor) {
            if (local.cursor.pages[local.cursor.currentPageIndex + 2] !== undefined) {
                next_page.show();
            } else {
                next_page.hide();
            }
            if (local.cursor.currentPageIndex > 0) {
                prev_page.show();
            } else {
                prev_page.hide();
            }
        }
        
        updateMap();
        // ensure closured result escapes the loop
        var makeResultChooser = function(result) {
            return function() { chooseResult(result) };
        }
        for (var i = 0; i < local.results.length; i++) {
            var r = local.results[i];
            var choose = makeResultChooser(r);
            var result = $(document.createElement("div")).attr({
                class: "result"
            });
            
            result.append($(document.createElement("a")).attr({
                href: "#",
                class: "marker-image"
            }).click(choose).html(
                "<img src='" + MEDIA.markers[i] + "' alt='marker' />"
            ));

            var blurb = $(document.createElement("div")).attr({
                class: "result-blurb"
            });
            blurb.append($(document.createElement("a")).attr({
                href: "#"
            }).click(choose).html(r.title));
            blurb.append("<br />");
            blurb.append([r.streetAddress, r.city + ", " + r.region].join("<br />"));
            result.append(blurb);

            div.append(result);
        }
        loading.hide();
    };
    var updateMap = function() {
        var url = "http://maps.google.com/staticmap?key=" + google.loader.ApiKey +
            "&size=300x200&maptype=mobile&markers=";
        if (local.results && local.results.length > 0) {
            for (var i = 0; i < local.results.length; i++) {
                var r = local.results[i];
                url += r.lat + "," + r.lng + "," + "red" + i_to_a[i];
                if (i < local.results.length - 1) {
                    url += "%7C";
                }
            }
        } else {
            url += "&zoom=12&center=" + this.opts.center.join(",");
        }
        mapimg.attr("src", url);
    };
    var open = function(searchstr) {
        search(searchstr);
        div.dialog({
            modal: true,
            width: 350,
            height: 650 
        });
    };
    var close = function() {
        div.dialog('close');
    };

    var chooseResult = function(result) {
        this.opts.callback(result);
        close();
    };

    var init = function() {
        this.opts = $.extend({}, defaults, options);
        for (key in MEDIA) {
            if (MEDIA[key].constructor === Array) {
                for (var i = 0; i < MEDIA[key].length; i++) {
                    MEDIA[key][i] = this.opts.MEDIA_PREFIX + MEDIA[key][i];
                }
            } else {
                MEDIA[key] = this.opts.MEDIA_PREFIX + MEDIA[key];
            }
        }
        local = new google.search.LocalSearch();
        local.setSearchCompleteCallback(null, searchDone);

        div = $(document.createElement("div")).attr("class", "modalmapsearch");

        mapimg = $(document.createElement("img"));
        updateMap();
        div.append(mapimg);

        input = $(document.createElement("input")).attr("class", "search");
        var go = $(document.createElement("input")).attr({
            type: "submit",
            value: "Search"
        }).click(function() { search(input.val()) });
        var form = $(document.createElement("form")).attr({
            class: "searchform",
            onsubmit: "return false;"
        }).append(input).append(go);
        div.append(form);
        input.val(this.opts.search);
        
        loading = $(document.createElement("div")).html(
            "<img src='" + MEDIA.spinner + "' alt='spinner' /> Loading..."
        );
        loading.hide();
        div.append(loading);

        var paginator = $(document.createElement("div")).attr("class", "paginator");
        next_page = $(document.createElement("a")).attr("href", "#").html("next");
        next_page.click(function() { 
            loading.show();
            local.gotoPage(local.cursor.currentPageIndex + 1); 
        });
        prev_page = $(document.createElement("a")).attr("href", "#").html("previous");
        prev_page.click(function() { 
            loading.show();
            local.gotoPage(local.cursor.currentPageIndex - 1); 
        });

        paginator.append(prev_page);
        paginator.append("&nbsp;");
        paginator.append(next_page);
        div.append(paginator);
        next_page.hide();
        prev_page.hide();

        search(options.search);
    };
    init();

    this.open = open;
    this.close = close;
    this.div = div;
}

window.ModalMapSearch = ModalMapSearch;
})();
