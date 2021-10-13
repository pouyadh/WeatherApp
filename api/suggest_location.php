<?php

if ($_GET["q"]) {
    $query = $_GET["q"];
    $citiesJSON = file_get_contents("../Data/cities.json");
    $statesJSON = file_get_contents("../Data/states.json");
    $cities = json_decode($citiesJSON,true);
    $states = json_decode($statesJSON,true);
    $query = strtolower($query);
    $query = ucfirst($query);
    $result = [];
    
    foreach ($cities as $city) {
        if (count($result) === 5 ) break;
        if ($city["name"] === $query) {
            $result[] = $city;
        }
    }
    foreach ($cities as $city) {
        if (count($result) === 5 ) break;
        if (strpos($city["name"],$query) !== false) {
            $result[] = $city;
        }
    }
    foreach ($states as $state) {
        foreach ($result as &$city) {
            if ($state["id"] === $city["state_id"]) {
                $city["state_name"] = $state["name"];
            }
        }
    }
    $result = json_encode($result);
    header_remove("Set-Cookie");
    header("Content-Type: application/json");
    header("HTTP/1.1 200 OK");
    echo $result;
}