<html>
<body>
    test connection to db<br><br>
   <?php
   
   
    echo "<table style='border: solid 1px black;'>";
    echo "<tr><th>user</th><th>password</th></tr>";

    class TableRows extends RecursiveIteratorIterator {
      function __construct($it) {
        parent::__construct($it, self::LEAVES_ONLY);
      }
   
      function current() {
        return "<td style='width:150px;border:1px solid black;'>" . parent::current(). "</td>";
      }
   
      function beginChildren() {
        echo "<tr>";
      }
   
      function endChildren() {
        echo "</tr>" . "\n";
      }
    }
   
   
    //$servername = "localhost";
    $username = "CloudSAceb07454";
    $password = "Ozymandias1!";
    //$database = "id21505478_login";
    $ODBCConnection = odbc_connect("DRIVER={Devart ODBC Driver for SQL Server};Server=myserver;Database=mydatabase; Port=myport;String Types=Unicode", $user, $password);

   
    try {
        $SQLQuery = "SELECT * FROM UserDetails";
        $RecordSet = odbc_exec($ODBCConnection, $SQLQuery);

        while (odbc_fetch_row($RecordSet)) {
            $result = odbc_result_all($RecordSet, "border=1");
        }
        odbc_close($ODBCConnection);
        echo $result;

     /*$conn = new PDO("mysql:host=$servername;dbname=$database", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      //replace 'rb' in select statement below with password entered by user in form
       $stmt = $conn->prepare("SELECT DISTINCT ENCRYPT('rb', 'encode') from `login`;");
      $stmt->execute();
   
      // set the resulting array to associative
      $result = $stmt->setFetchMode(PDO::FETCH_ASSOC);
      foreach(new TableRows(new RecursiveArrayIterator($stmt->fetchAll())) as $k=>$v) {
        echo $v;
        $passInputEncrypt=$v;
      }
     
      $stmt = $conn->prepare("SELECT DISTINCT password from `login`;");
      $stmt->execute();
      $result = $stmt->setFetchMode(PDO::FETCH_ASSOC);
      foreach(new TableRows(new RecursiveArrayIterator($stmt->fetchAll())) as $k=>$v) {
        if($passInputEncrypt=$v){
            echo "passwords match"   ;        
           
        };
      }*/
     
    } catch(PDOException $e) {
      echo "Error: " . $e->getMessage();
    }
    $conn = null;
    echo "</table>";
    ?>
</body>    
</html>
