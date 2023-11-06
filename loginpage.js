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

        /*$("#outUsername").html(username);*/
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
            usernames.push(username);
            passwords.push(password);
        } else{
            e.preventDefault();
            $("#spPassError").show();
        }
    })
});

