// {{{ Main
(function ($) {
    // {{{ Properties
    var map_editor = null;
    var map_viewer = null;
    var sidebar = null;
    // }}}
    // {{{ document.ready
    $(document).ready(function () {
        
        sidebar = $('#map_editor_wrapper .sidebar');

        $('#imagemapper').tabs({
            show : function (event, ui) {
                if ('Preview' === ui.tab.innerHTML) {
                    var data = map_editor.exportData();
                    map_viewer = new MapViewer('#map_viewer', data);
                }
            }
        }).draggable({
            handle : 'ul'
        });

        $('li.toolbar button').button();

        map_editor = new MapEditor('#map_editor', $.extend(example_data, {
            map_id : 'bleh123',
            image : 'http://farm4.static.flickr.com/3433/3986710128_48958f7369_o.jpg', 
            events : {
                init : function () {
                    this.selectNode();
                },
                polygonCreated : function () {
                    var poly = this.currentPolygon;
                    poly.data  = $.extend(poly.data, {
                        name : 'Line-' + map_editor.getPolygonIndex(poly),
                        href : '#some-anchor'
                    });
                },
                selectNode : function () {
                    createInspector();
                }
            }
        }));

        sidebar.bind('click', function (e) {
            var target = $(e.target);
            
            if (target.is('button.save-poly')) {
                e.preventDefault();
                var $form = target.parents('form:first'), index = $form.attr('data-index');
                map_editor.polygons[index].data.name = $form.find('input[name=p_name]').val();
                map_editor.polygons[index].data.href = $form.find('input[name=p_href]').val();
                createInspector();
            }

            if (target.is('button.remove')) {
                var index = target.parents('div.header:first').attr('data-index');
                map_editor.removePolygon(index);
                createInspector();
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
            html += '<div class="header" data-index="' + map_editor.getPolygonIndex(poly) + '">';
            html += '<button class="remove">remove</button>';
            html += '<a href="#">' + poly.data.name + '</a>';
            html += '</div>'
            html += polygonForm(poly);
        }        

        accord.innerHTML = html;

        sidebar[0].innerHTML = '';
        sidebar[0].appendChild(accord);

        sidebar.find('button.save-poly').button();
        sidebar.find('button.remove').button({text : false, icons : {primary : 'ui-icon-trash'}});
        sidebar.find('.polygon-list').accordion({
            header : 'div.header',
            active : 'div.header[data-index=' + map_editor.currentPolygon.data.index + ']',
            change : function (e, ui) {
                console.log(ui);
            }
        });
    };
    // {{{ polygonDialog
    var polygonForm = function (polygon) {
        var html = '<form id="polygon_form" data-index="'+ map_editor.getPolygonIndex(polygon) +'">';
        html += '<dl>';
        html += '<dt>Name :</dt>';
        html += '<dd><input type="text" name="p_name" value="'+polygon.data.name+'" /></dd>';
        html += '<dt>href :</dt>';
        html += '<dd><input type="text" name="p_href" value="'+polygon.data.href+'" /></dd>';
        html += '</dl>';
        html += '<button class="save-poly">Change</button>';
        html += '</form>';

        return html;
    };
    // }}}
}).call(window, jQuery);
// }}}
