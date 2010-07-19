// {{{ Main
(function ($) {
    // {{{ Properties
    var map_editor = null;
    var map_data = {};
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

        $('li.toolbar button').button().click(function () {
            var data = map_editor.exportData();

            $.post('example.php', data, function () {
                alert('Saved');
            })
        });

        
        $.getJSON('example_data.json', function (data) {
            map_data = $.extend(prepareDataForLoading(data), {
                map_id : 'bleh123',
                image : 'http://farm4.static.flickr.com/3433/3986710128_48958f7369_o.jpg', 
                dataFilter : prepareDataForSaving,
                events : {
                    polygonCreated : preparePolygon,
                    selectNode : createInspector
                }
            }); 

            map_editor = new MapEditor('#map_editor', map_data);
        });

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
    // {{{ Support Methods
    // {{{
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
            }
        });
    };
    // }}}
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
    // {{{prepareDataForSaving(data) 
    var prepareDataForSaving = function (data) {
        var post_data = {
            id : this.options.map_id,
            polygon_coords : [],
            polygon_names : [],
            polygon_hrefs : [],
        };
        
        for (var p = 0, pl = this.polygons.length; p < pl; p++) {
            var polygon = this.polygons[p], coords = [];
            for (var n = 0, nl = polygon.nodes.length; n < nl; n++) {
                coords.push(polygon.nodes[n].x); 
                coords.push(polygon.nodes[n].y); 
            }

            post_data.polygon_coords.push(coords.join(', '));
            post_data.polygon_names.push(polygon.data.name);
            post_data.polygon_hrefs.push(polygon.data.href);
        }

        return post_data;
    };
    // }}}
    // {{{prepareDataForLoading(data) 
    var prepareDataForLoading = function (data) {
        var import_data = {
            map_id : data.id,
            polygons : []
        };
        
        for (var p = 0, pl = data.polygons.length; p < pl; p++) {
            var polygon = {
                data : {
                    name : data.polygons[p].name,
                    href : data.polygons[p].href,
                },
                nodes : []
            };

            var coords = data.polygons[p].nodes.split(', ');

            for (var c = 0, cl = coords.length / 2; c < cl; c++) {
                polygon.nodes.push({
                    x : coords.shift(),
                    y : coords.shift(),
                });
            }

            import_data.polygons.push(polygon);
        }

        return import_data;
    };
    // }}}
    // {{{ preparePolygon()
    var preparePolygon = function () {
        var poly = this.currentPolygon;
        poly.data  = $.extend(poly.data, {
            name : 'Line-' + map_editor.getPolygonIndex(poly),
            href : '#some-anchor'
        });
    };
    // }}}
    // }}}
}).call(window, jQuery);
// }}}
