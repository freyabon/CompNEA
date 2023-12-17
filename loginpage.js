console.log('Loaded');

$(document).ready(function(){

    $("#blockRegister").hide();

    $("#toggleSignIn").click(function(){
      $("#blockSignIn").show();
      $("#blockRegister").hide();
      console.log('Sign in Clicked');
    });

    $("#toggleRegister").click(function(){
        $("#blockSignIn").hide();
        $("#blockRegister").show();
        console.log('Register Clicked');
      });

    $('#btnSubmit').on('click', function(e){
        /*e.preventDefault();*/
        console.log('clicked');
        //$('#login_page').toggle();
        username=$('#inpUser')[0].value;
        password=$('#inpPass')[0].value;
        console.log(username);
        console.log(password);
    })

    $('#btnRegister').on('click', function(e){
        username=$('#regUser')[0].value;
        password=$('#regPass')[0].value;
        password2=$('#regPass2')[0].value;
        console.log(username);
        console.log(password);
        
        if(password === password2){
            $("#spPassError").hide();
            console.log('Registered');

            const userData = {
              Username: username,
              Password: password
          };
      
          fetch('http://localhost:3000/registerUserDetails', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
             
          })
         
          .then(response => response.text())
          .then(data => {
              console.log(data);
          })
          .catch(error => console.error('Database error:', error));

        } else{
            e.preventDefault();
            $("#spPassError").show();
        }
    })

    $('#btnRetrieve').on('click', function () {
      fetch('http://localhost:3000/getUserDetails')
          .then(response => response.json())
          .then(data => {
              console.log(data);
  
              data.forEach(item => console.log(item.Username));
          })
          .catch(error => console.error('Error:', error));
         
  });
});

