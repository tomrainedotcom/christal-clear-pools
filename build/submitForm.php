<?php
  header("Access-Control-Allow-Origin: *");

  $to = $_POST['sendTo'];
  $subject = $_POST['subject'];

  $message = "<table>";
  $message .= "<tr><td>Name</td><td>".$_POST['name']."</td></tr>";
  $message .= "<tr><td>Email</td><td>".$_POST['email']."</td></tr>";
  $message .= "<tr><td>Phone</td><td>".$_POST['phone']."</td></tr>";
  $message .= "<tr><td>Suburb</td><td>".$_POST['suburb']."</td></tr>";
  $message .= "<tr><td colspan=\"2\">Message</td></tr>";
  $message .= "<tr><td colspan=\"2\">".$_POST['message']."</td></tr>";
  $message .= "</table>";

  if ($_POST['email'] != "") {
    $header = "From:".$_POST['email']." \r\n";
  } else {
    $header = "From:no-reply@christalclearpools.com.au \r\n";
  }
  $header .= "To:$to \r\n";
  $header .= "MIME-Version: 1.0\r\n";
  $header .= "Content-type: text/html\r\n";

  $retval = mail ($to,$subject,$message,$header);

  if( $retval == true ) {
    echo "Thank you for contacting us, Chris will be in touch with you shortly.";
  }else {
    echo "Message could not be sent...";
  }
?>
