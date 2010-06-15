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
// {{{ MapEditor(selector, options)
// {{{ Constructor
var MapEditor = function (selector, options) {
    
    this.options = $.extend({
        image : null,
        width : 500,
        height : 600,
        padding : 10,
        style : {
            nodeColor : 'yellow',
            lineColor : '#0050B7'
        }
    }, options || {});

    this.wrapper = jQuery(selector);

    this.buildContainer();
    //this.createInspector();

    this.polygons = [];
    this.position = jQuery(this.container).offset();
    this.drawing = false;
    this.dragging = false;
    this.id = new Date().getTime();

    if ('undefined' === typeof this.wrapper[0]) {
        throw('No element matches "'+ selector +'"');
    }

    if ('string' === typeof this.options.image) {
        this.loadImage(this.options.image, function (img) {
            this.image = img; 
            this.createCanvas(img.width, img.height);
            this.context.drawImage(img, 0, 0);
            this.buildMask();

            if (options.polygons instanceof Array) {
                for (var p = 0, l = options.polygons.length; p < l; p++) {
                    this.polygons.push(new Polygon(options.polygons[p])); 
                    this.createMapArea(this.polygons[this.polygons.length-1]);
                }

                delete this.options.polygons[p];
            }

            this.drawPolys();
        });
    }

    this.events = $.extend(this.events, options.events || {});

    for (var e in this.events) {
        var event = this.events[e];
        if ('function' === typeof event) {
            this.$container.bind(e, jQuery.proxy(event, this));
        }
    }

    this.$container.trigger('init');

    return this;
};
// }}}
// {{{ Api
MapEditor.prototype = {
    // {{{ loadImage(src, fn)
    loadImage : function (src, fn) {
        var img = new Image(), editor = this;

        img.onload = function () {
            if ('function' === typeof fn) {
                $(editor.container).trigger('afterImageLoad');
                fn.call(editor, this);
            }
        };

        img.src = src;
    }, 
    // }}}
    // {{{ createCanvas()
    createCanvas : function (width, height) {
        var canvas = document.createElement('canvas');
        
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        this.canvas = canvas;

        this.container.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
    },
    // }}}
    // {{{ drawPolys
    drawPolys : function () {
        var ctx = this.context;
        ctx.drawImage(this.image, 0, 0);
        ctx.lineWidth = 10;

        for (var p = 0, polygons = this.polygons.length; p < polygons; p++) {
            var poly = this.polygons[p];
            for (var n = 0, nodes = poly.nodes.length - 1; n < nodes; n++) {
                var node_a = poly.nodes[n], node_b = poly.nodes[n + 1];

                ctx.strokeStyle = (this.currentPolygon === poly) ? 'red' : this.options.style.lineColor;
                ctx.beginPath();
                ctx.moveTo(node_a.x, node_a.y);
                ctx.lineTo(node_b.x, node_b.y);
                ctx.stroke();
                ctx.strokeStyle = (this.currentNode === node_a) ? 'red' : this.options.style.nodeColor;
                ctx.strokeRect(node_a.x - 5, node_a.y - 5, 10, 10);
                ctx.strokeRect(node_b.x - 5, node_b.y - 5, 10, 10);
            }
        }
    },
    // }}}
    // {{{ selectNode(target)
    selectNode : function (node, polygon) {

        if ('object' === typeof node) {
            polygon = node.getAttribute('data-polygon');
            node = node.getAttribute('data-node');
        }

        if ('undefined' === typeof polygon ) {
            polygon = this.polygons.length - 1;
        }

        if ('undefined' === typeof node) {
            node = this.polygons[polygon].nodes.length - 1;
        }

        this.currentPolygon = this.polygons[polygon];
        this.currentNode = this.currentPolygon.nodes[node];
        this.drawPolys();
        this.$container.trigger('selectNode');
    },        
    // }}}
    // {{{ createPolygon()
    createPolygon : function () {
                
    },
    // }}}
    // {{{ createMapArea(poly)
    /**
     * This creates a image map based on the given polygon's nodes, 
     * if these nodes already exist in the image map, modify them accordingly.
     * 
     * @param Polygon Object
     * @return void;
     */
    createMapArea : function (poly) {

        var index = poly.getData('index');

        for (var i = 0, l = poly.nodes.length; i < l;i++) {

            var coords = [(poly.nodes[i].x - 5), (poly.nodes[i].y - 5), (poly.nodes[i].x + 5), (poly.nodes[i].y + 5)].join(','),
                selector = 'area[data-polygon='+ index  +'][data-node='+ i +']';
    
            var existing = $(this.mask_map).find(selector);

            if (existing[0] && coords === existing.attr('coords')) {
                existing.attr('coords', coords);
            } else {
                var area = document.createElement('area');
                area.setAttribute('shape', 'rect')
                area.setAttribute('coords', coords);
                area.setAttribute('class', 'image_mapper_node');
                area.setAttribute('data-node', i);
                area.setAttribute('data-polygon', index);
                this.mask_map.appendChild(area);
                existing.remove();
            }
        }
    },
    // }}}
    // {{{ getMouseCoords (event)
    getMouseCoords : function (e) {
        var offset = this.$container.offset(),
            real_x = (e.clientX - offset.left) + this.container.scrollLeft + window.scrollX,
            real_y = (e.clientY - offset.top) + (this.container.scrollTop + window.scrollY);

        return {x : real_x, y : real_y};
    },
    // }}}
    // {{{ buildContainer()
    buildContainer : function () {
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'image_mapper_container');
        this.wrapper.append(this.container);
        this.$container = jQuery(this.container);
    },
    // }}}
    // {{{ buildMask()
    buildMask : function () {
        this.mask = document.createElement('div');
        this.mask.style.width = this.container.clientWidth;
        this.mask.style.height = this.container.clientHeight;
        this.mask.style.top = this.position.top;
        this.mask.style.left = this.position.left;
        this.mask.setAttribute('class', 'image_mapper_mask');        

        this.mask_map = document.createElement('map');
        this.mask_map.setAttribute('name', 'image_mapper_mask_map_' + this.id);
        this.mask_map.setAttribute('class', 'image_mapper_mask_map');
        this.mask.appendChild(this.mask_map);

        this.mask_image = document.createElement('img');
        this.mask_image.setAttribute('src', 'transparent.gif'); 
        this.mask_image.setAttribute('class', 'image_mapper_mask_image');
        this.mask_image.setAttribute('width', this.image.width);
        this.mask_image.setAttribute('height', this.image.height);
        this.mask_image.setAttribute('usemap', '#image_mapper_mask_map_' + this.id);
        this.mask.appendChild(this.mask_image);

        this.container.appendChild(this.mask);
    },
    // }}}
    // {{{ exportData()
    exportData : function () {
        var data = {
            polygons : [],
            image : this.options.image,
            width : this.options.width,
            height : this.options.height,
            style : this.options.style     
        };

        for (var p = 0, pl = this.polygons.length; p < pl; p++) {
            var polygon = this.polygons[p], coords = [];

            for (var n = 0, nl = polygon.nodes.length; n < nl; n++) {
                coords.push(polygon.nodes[n].x); 
                coords.push(polygon.nodes[n].y); 
            }
        
            data.polygons.push({
                data : this.polygons[p].data,
                nodes : this.polygons[p].nodes,
                coords : coords.join(','),
                title : polygon.data.title || '' 
            });
        }

        return data;
    },
    // }}}
    // {{{ Events
    /**
     * All event handlers defined here will be automatically bound 
     * to the container element using jQuery.bind() during construction.
     */
    events : {
        // {{{ click
        'click' : function (e) {
            var coords = this.getMouseCoords(e);

            if ('AREA' === e.target.nodeName) {
                this.selectNode(e.target);
                return;
            }

            if (!this.drawing && !this.dragging) {
                this.createPolygon();
                this.drawing = true;
                this.polygons.push(new Polygon({data : {index : this.polygons.length}}));
                this.$container.trigger('polygonCreated');
                this.selectNode();
                this.currentPolygon.push({x : coords.x, y : coords.y});
            }

            if (this.drawing) {
                this.currentPolygon.push({x : coords.x, y : coords.y});
                this.selectNode();
            }   
        },
        // }}}
        // {{{ mousemove
        'mousemove' : function (e) {
            if (this.drawing || this.dragging) {
                var coords = this.getMouseCoords(e);
                this.currentNode.x = coords.x;
                this.currentNode.y = coords.y;
                this.drawPolys();
            }
        },
        // }}}
    // {{{ mouseup
    'mouseup' : function (e) {
        if (this.dragging) {
            this.dragging = false;
            this.dragNode = null;
            this.createMapArea(this.currentPolygon);
        }

    },
    // }}}
    // {{{ scroll
    /**
     * When the scroll event is fired on our container element we need
     * to update the imagemask's top/left margins accordingly. This is 
     * done to keep the image map coord's in sync with the visible parts
     * of the canvas.
     *
     * @param HTML_SCROLL_EVENT
     * @return void
     */
    'scroll' : function (e) {
        this.mask_image.style.marginTop = -this.container.scrollTop;
        this.mask_image.style.marginLeft = -this.container.scrollLeft;
    },
    // }}}
    // {{{ dragstart
    'dragstart' : function (e) {
        e.preventDefault();
        if ('AREA' === e.target.nodeName) {
            this.selectNode(e.target);
            this.dragging = true;
        }
    },
    // }}}
    // {{{ double click
        'dblclick' : function () {
            if (this.drawing) {
                this.drawing = false;
                this.currentPolygon.pop();
                this.currentPolygon.pop();
                this.createMapArea(this.currentPolygon);
                this.drawPolys();
                $(this.container).trigger('onFinalize');
            }
        }
    // }}}
    }    
    // }}}
};
// }}}
// }}}
// {{{ Polygon(options)
// {{{ Constructor
var Polygon = function (options) {

    options = jQuery.extend({
        data : {},
        nodes : []
    }, options || {});

    for (var o in options) {
        this[o] = options[o];
    }

    return this;
}
// }}}
// {{{ Api
Polygon.prototype = {
    getData : function (key) {
        return ('undefined' === typeof key) ? this.data : this.data[key];
    },
    setData : function (key, value) {
        if ('string' === typeof key) {
            this.data[key] = value;
        } else if (key && !value) {
            this.data = key;
        }
    },
    length : function () {
        return this.nodes.length;
    },
    push : function (node) {
        return this.nodes.push(node);
    },
    pop : function () {
        return this.nodes.pop();
    }
};
// }}}
// }}}

