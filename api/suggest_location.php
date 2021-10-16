<?php

require './config.php';


function prepareHeader($json) {
    header_remove("Set-Cookie");
    header("Content-Type: application/json");
    header("HTTP/1.1 200 OK");
    echo $json;
}

function dieWithEmptyJsonResponse() {
    $resp = json_encode([]);
    prepareHeader($resp);
    exit;
}
if (!$_GET["q"]) {
    dieWithEmptyJsonResponse();
}
if (strlen($_GET["q"]) < 3) {
    dieWithEmptyJsonResponse();
}
$query = $_GET["q"];
$query = strtolower($query);
$query = ucfirst($query);

$sql = 
"SELECT c.*, s.name as state_name FROM cities c
LEFT JOIN states s ON c.state_id = s.id
WHERE c.name = :q1
UNION
SELECT c.*, s.name as state_name FROM cities c
LEFT JOIN states s ON c.state_id = s.id
WHERE c.name LIKE :q2
LIMIT 5;";


$dsn = "mysql:host={$dbHost};dbname={$dbName}";
$pdo = new PDO($dsn,$dbUsername,$dbPassword);


try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':q1',$query);
    $stmt->bindValue(':q2',"%{$query}%");
    $stmt->execute();
    $result1 = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $json = json_encode($result1);

} catch(PDOException $e) {
    $resp = [
        "error" => true,
        "error_message" => $e->getMessage()
    ];
    $json = json_encode($resp);
} finally {
    $pdo = null;
    prepareHeader($json);
}
?>