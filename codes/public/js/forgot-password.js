const sendOtpBtn=document.getElementById("sendOtp");
const verifyOtpBtn=document.getElementById("verifyOtp");
const resetBtn=document.querySelector(".password-section button");
const resendOtp=document.getElementById("resendOtp");

const otpSection=document.getElementById("otpSection");
const passwordSection=document.getElementById("passwordSection");
const passwordError=document.getElementById("passwordError");

const otpInputs=document.querySelectorAll(".otp");
const timer=document.getElementById("timer");
const toggleIcons=document.querySelectorAll(".toggle");

sendOtpBtn.addEventListener("click",sendOTP);
verifyOtpBtn.addEventListener("click",verifyOTP);
resetBtn.addEventListener("click",resetPassword);


resendOtp.addEventListener("click",function(e){
    e.preventDefault();
    if(sendOtpBtn.disabled){
        showMessage("Please wait until the timer finishes.","error");
        return;
    }
    sendOTP();
});

otpInputs.forEach((input,index)=>{
    input.addEventListener("input",function(){
        if(this.value.length==1&&index<otpInputs.length-1){
            otpInputs[index+1].focus();
        }
    });

    input.addEventListener("keydown",function(e){

        if(e.key==="Backspace"&&this.value===""&&index>0){
            otpInputs[index-1].focus();
        }

    });

});

toggleIcons.forEach(icon=>{

    icon.addEventListener("click",function(){

        const input=this.previousElementSibling;

        if(input.type==="password"){
            input.type="text";
            this.classList.replace("fa-eye","fa-eye-slash");
        }else{
            input.type="password";
            this.classList.replace("fa-eye-slash","fa-eye");
        }
    });
});

async function sendOTP(){
    const email=document.getElementById("email").value.trim();
    if(email===""){
        showMessage("Please enter your registered email.","error");
        return;
    }
    try{
        const response=await fetch("/forgot-password/send-otp",{
            method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email})
        });
        const result=await response.json();

        showMessage(result.message,result.success?"success":"error");

        if(result.success){
            otpSection.style.display="block";
            sendOtpBtn.disabled=true;
            sendOtpBtn.innerText="OTP Sent";

            startTimer();
            otpInputs[0].focus();
        }
    }catch(err){
        console.log(err);
        showMessage("Server Error.","error");
    }
}

async function verifyOTP(){

    const email=document.getElementById("email").value.trim();
    let otp="";

    otpInputs.forEach(input=>{
        otp+=input.value;
    });
    if(otp.length!=6){
        showMessage("Please enter complete OTP.","error");
        return;
    }

    try{
        const response=await fetch("/forgot-password/verify-otp",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({email,otp})
        });
        const result=await response.json();
        showMessage(result.message,result.success?"success":"error");

        if(result.success){
            passwordSection.style.display="block";
            passwordSection.scrollIntoView({behavior:"smooth"});
        }
    }catch(err){
        console.log(err);
        showMessage("Server Error.","error");
    }
}

async function resetPassword(e){
    e.preventDefault();
    const email=document.getElementById("email").value.trim();
    const password=document.querySelectorAll(".password-section input")[0].value;
    const confirmPassword=document.querySelectorAll(".password-section input")[1].value;

    passwordError.style.display="none";
    passwordError.innerText="";
    if(password.length<8){
        passwordError.style.display="block";
        passwordError.innerText="Password must be at least 8 characters.";
        return;
    }
    if(password!==confirmPassword){
        passwordError.style.display="block";
        passwordError.innerText="Passwords do not match.";
        return;
    }

    try{
        const response=await fetch("/forgot-password/reset-password",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email,
                password
            })
        });

        const result=await response.json();

        if(result.success){
            showMessage("Password changed successfully.","success");
            setTimeout(function(){
                window.location.href="/login";
            },2000);

        }else{
            showMessage(result.message,"error");
        }

    }catch(err){

        console.log(err);

        showMessage("Server Error.","error");

    }

}

function startTimer(){
    let seconds=30;
    timer.innerText="Resend OTP in "+seconds+"s";
    const interval=setInterval(function(){
        seconds--;
        timer.innerText="Resend OTP in "+seconds+"s";
        if(seconds<=0){
            clearInterval(interval);
            timer.innerText="You can resend OTP now.";
            sendOtpBtn.disabled=false;
            sendOtpBtn.innerText="Send OTP";
        }
    },1000);
}

function showMessage(message,type){
    const box=document.getElementById("messageBox");
    box.innerText=message;
    box.className="message-box";
    box.style.display="block";

    if(type==="success"){
        box.classList.add("message-success");
    }else{
        box.classList.add("message-error");
    }

    setTimeout(function(){
        box.style.display="none";
    },3000);

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}