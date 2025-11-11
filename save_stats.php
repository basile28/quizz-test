<?php
header("Content-Type: application/json");$file='stats.json';if(!file_exists($file)) file_put_contents($file,'{}');
if(isset($_GET['reset'])){file_put_contents($file,'{}');echo json_encode(["status"=>"reset"]);exit;}
$input=json_decode(file_get_contents('php://input'),true);if(!$input){echo json_encode(["error"=>"no input"]);exit;}
if(isset($input['__full_replace'])&&$input['__full_replace']===true&&isset($input['data'])){file_put_contents($file,json_encode($input['data'],JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));echo json_encode(["status"=>"ok"]);exit;}
if(!isset($input['profil'])){echo json_encode(["error"=>"missing profil"]);exit;}
$stats=json_decode(file_get_contents($file),true);$profil=$input['profil'];$stats[$profil]=["departements"=>$input['departements']??[],"capitales"=>$input['capitales']??[]];file_put_contents($file,json_encode($stats,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));echo json_encode(["status"=>"ok"]);