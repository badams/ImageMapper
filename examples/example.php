<?php

$polygon_coords = $_POST['polygon_coords'];
$polygon_names = $_POST['polygon_names'];
$polygon_hrefs = $_POST['polygon_hrefs'];

if (is_array($polygon_coords)) {

    $polygons = array();

    for ($i = 0; $i < count($polygon_coords); $i++) {
        $polygons[] = array(
            'name' => $polygon_names[$i],
            'href' => $polygon_hrefs[$i],
            'nodes' => $polygon_coords[$i],
        );
    }

    $data = array(
        'id' => $_POST['id'],
        'polygons' => $polygons,
    );

    try {
        file_put_contents('example_data.json', json_encode($data));
        die(json_encode(array('status' => 'success')));
    } catch (Exception $e) {
        die(json_encode(array('status' => 'error')));
    }
}
?>
<html>
    <head>
        <link type="text/css" href="../css/themes/smoothness/jquery-ui-1.8.2.custom.css" rel="stylesheet" />
        <link rel="stylesheet" href="../css/imagemapper.css"/>

        <script type="text/javascript" src="../js/jquery-1.4.2.min.js"></script>
        <script type="text/javascript" src="../js/jquery-ui-1.8.2.custom.min.js"></script>

        <script src="../js/imagemapper.js"></script>
        <script src="example.js"></script>
    </head>
    <body>
    <div id="imagemapper">
        <ul id="imagemapper-tabs">
            <li><a href="#map_editor_wrapper">Edit</a></li>
            <li><a href="#map_viewer">Preview</a></li>
            <li class="toolbar"><button id="save-button">Save</button></li>
        </ul>
        <div id="map_editor_wrapper">
            <div id="map_editor"></div>
            <div class="sidebar"></div>
            <div style="clear:both;"></div>
        </div>
        <div id="map_viewer">
            <p>soon..</p>
        </div>
    </div>
    </body>
</html>
