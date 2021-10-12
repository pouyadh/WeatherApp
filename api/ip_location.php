<?php

function CallAPI($method, $url, $data = null)
{
    $curl = curl_init();

    switch ($method)
    {
        case "POST":
            curl_setopt($curl, CURLOPT_POST, 1);

            if ($data)
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            break;
        case "PUT":
            curl_setopt($curl, CURLOPT_PUT, 1);
            break;
        default:
            if ($data)
                $url = sprintf("%s?%s", $url, http_build_query($data));
    }

    // Optional Authentication:
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($curl, CURLOPT_USERPWD, "username:password");

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);

    curl_close($curl);

    return $result;
}

$ip_client = $_SERVER['REMOTE_ADDR'];
$ip_server = $_SERVER['SERVER_ADDR'];

if ($_GET["ip"]) {
    $result = CallAPI("GET","http://ip-api.com/json/{$_GET["ip"]}");
    header_remove('Set-Cookie');
    header('Content-Type: application/json');
    header("HTTP/1.1 200 OK");
    echo $result;
    exit;
}
