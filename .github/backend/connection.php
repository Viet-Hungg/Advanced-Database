<?php
$link = mysqli_connect("localhost", "root", "11", "") or die(mysqli_connect_error());

mysqli_select_db($link, "test") or die(mysqli_error($link));
?>