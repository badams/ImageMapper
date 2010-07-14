// {{{ Main
(function ($) {
    // {{{ Properties
    var map_editor = null;
    var map_viewer = null;
    var sidebar = null;
    // }}}
    // {{{ document.ready
    $(document).ready(function () {
        
        map_viewer = $('#map_viewer');
        sidebar = $('#map_editor_wrapper .sidebar');

        $('#imagemapper').tabs().resizable().draggable({
            handle : 'ul'
        });

        $('#toolbar button').button({
            text: false,
            icons: {
                primary: 'ui-icon-arrowthick-2-se-nw'
            }
        });

        $('li.toolbar button').button();

        $('.sidebar #polygon-list').accordion()

        map_editor = new MapEditor('#map_editor', {
            map_id : 'bleh123',
            image : 'http://farm4.static.flickr.com/3433/3986710128_48958f7369_o.jpg', 
            events : {
                polygonCreated : function () {
                    console.log(this.currentNode);
                },
                selectNode : function () {
                    createInspector();
                },
                
            }
        });

        sidebar.bind('click', function (e) {
            var target = $(e.target);
            
            if (target.is('button.button-edit')) {
                e.preventDefault();
                polygonDialog(map_editor.currentPolygon);
                return false;
            }
        });


        window.map_editor = map_editor;

    });
    // }}}
    // {{{ Api
    // }}}
    // {{{ Support Methods
    var createInspector = function () {
        var accord = document.createElement('div');
        var html = '';

        accord.setAttribute('class', 'polygon-list');

        for (var p = map_editor.polygons.length-1; p >= 0; p--) {
            var poly = map_editor.polygons[p];
            html += '<div class="header" data-index="' + poly.data.index + '">';
            html += '<button class="button-edit">Edit</button>';
            html += '<a href="#">Polygon-' + poly.data.index + '</a>';
            html += '</div>'
            html += '<div>' + poly.nodes.length + '</div>';
        }        

        accord.innerHTML = html;

        sidebar[0].innerHTML = '';
        sidebar[0].appendChild(accord);

        sidebar.find('button').button();
        sidebar.find('.polygon-list').accordion({
            header : 'div.header',
            active : 'div.header[data-index=' + map_editor.currentPolygon.data.index + ']'
        });
    };
    // {{{ polygonDialog
    var polygonDialog = function (polygon) {
        $('<p>lol</p>').dialog();
    };
    // }}}
}).call(window, jQuery);
// }}}
