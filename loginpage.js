console.log('Loaded');

$('#btnSubmit').on('click', function(){
    console.log('clicked');
    //$('#login_page').toggle();
    username=$('#inpUser')[0].value;
    password=$('#inpPass')[0].value;
    console.log(username);
    console.log(password);
})
