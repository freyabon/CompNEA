console.log('Loaded');

$('#btnSubmit').on('click', function(){
    console.log('clicked');
    //$('#login_page').toggle();
    username=$('#inpUser')[0].value;
    password=$('#inpPass')[0].value;
    console.log(username);
    console.log(password);
})

$(document).ready(function(){
    $("#toggleSignIn").click(function(){
      $("#blockSignIn").toggle();
      console.log('Clicked');
    });
    $("#toggleRegister").click(function(){
        $(".w3-card-4").toggle();
        console.log('Clicked');
      });
  });

