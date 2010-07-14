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


        window.map_editor = map_editor;

    });
    // }}}
    // {{{ Api
    // }}}
    // {{{ Support Methods
    var createInspector = function () {
        var accord = document.createElement('div');

        accord.setAttribute('class', 'polygon-list');

        var html = '';

        for (var p = map_editor.polygons.length-1; p >= 0; p--) {
            console.log(p);
            var poly = map_editor.polygons[p];
            html += '<h3 data-index="' + poly.data.index + '"><a href="#">Polygon-' + poly.data.index + '</a></h3>';
            html += '<div>' + poly.nodes.length + '</div>';
            
        }        

        accord.innerHTML = html;


        sidebar[0].innerHTML = '';
        sidebar[0].appendChild(accord);

        sidebar.find('.polygon-list').accordion({
            active : 'h3[data-index=' + map_editor.currentPolygon.data.index + ']'
        });
    };
    // }}}
}).call(window, jQuery);
// }}}
