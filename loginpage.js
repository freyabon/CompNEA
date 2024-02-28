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

    $('#btnSubmit').on('click', function (e) {
        var username = $('#inpUser').val();
        var password = $('#inpPass').val();
        
        authenticateUser(username, password);
    });
    
    function authenticateUser(username, password){
        reset = '';
        $('#userError').append(reset);

        fetch(`http://localhost:2500/getUserDetails?Username=${username}&Password=${password}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    error = 'User was not found...';
                    $('#userError').append(error);
                    throw new Error('User was not found...');
                }
            })
            .then(data => {
                console.log(data);
                const queryString = `?username=${username}`;
                window.location.href = `home_page.html${queryString}`;
            })
            .catch(error => {
                console.error('Error:', error)
            });
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

function showPasswordSignIn(){
    var passInput = $("#inpPass").val(0);
    if (passInput.attr("type") === "password") {
        passInput.attr("type", "text");
    } else {
        passInput.attr("type", "password");
    }
}