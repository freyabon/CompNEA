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
});

