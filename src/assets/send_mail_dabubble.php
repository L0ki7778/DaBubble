<?php

switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"):
        header("Access-Control-Allow-Headers: content-type");
        exit;
    case ("POST"):
        $email = $_POST['email'];

        $subject = "Passwort zurücksetzen";
        $message = "Hallo,\n\nSie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Klicken Sie auf den folgenden Link, um ein neues Passwort zu erstellen:\n\nhttps://example.com/reset-password?token=abcd1234\n\nFalls Sie keine Passwortänderung angefordert haben, ignorieren Sie diese E-Mail einfach.\n\nMit freundlichen Grüßen\nIhr Team";
        $headers = "From: noreply@example.com";

        mail($email, $subject, $message, $headers);
        break;
    default:
        header("Allow: POST", true, 405);
        exit;
}