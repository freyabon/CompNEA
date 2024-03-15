$(document).ready(function(){
    $("#blockRegister").hide();

    $("#toggleSignIn").click(function(){
      $("#blockSignIn").show();
      $("#blockRegister").hide();
    });

    $("#toggleRegister").click(function(){
        $("#blockSignIn").hide();
        $("#blockRegister").show();
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
                    error = 'User was not found or incorrect password...';
                    $('#userError').append(error);
                    throw new Error('User was not found');
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
        
        if(password === password2){
            $("#spPassError").hide();
            $("#userError").hide();

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
         
          .then(response => {
            if (response.ok) {
                const queryString = `?username=${username}`;
                window.location.href = `home_page.html${queryString}`;
            } else{
                $("#userRegisteredError").show();
                throw new Error('User already registered');
            }
           })
           .catch(error => console.error('Database error:', error));

        } else{
            $("#spPassError").show();
        }
    })

});

function showPasswordSignIn(){
    var passInput = $("#inpPass");
    var passValue = passInput.val();
    if (passInput.attr("type") === "password") {
        passInput.attr("type", "text");
    } else {
        passInput.attr("type", "password");
    }
    passInput.val(passValue);
}