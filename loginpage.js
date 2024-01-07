$(document).ready(function(){
    //login page code
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

    $('#btnSubmit').on('click', function (e) {
        var username = $('#inpUser').val();
        var password = $('#inpPass').val();
        
        authenticateUser(username, password);
    });
    
    function authenticateUser(username, password){

        fetch(`http://localhost:2500/getUserDetails?Username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                let found = false;
                data.forEach(item => {
                    if (password === item.Password) {
                        console.log(item.Password);
                        found = true;
                    }
                });
                if (found) {
                    const queryString = `?username=${username}`;
                    window.location.href = `ticker_info.html${queryString}`;
                } else {
                    e.preventDefault();
                    $("#userFoundError").show();
                }
            })
            .catch(error => console.error('Error:', error));
    }

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
      
          fetch('http://localhost:2500/registerUserDetails', {
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

});

