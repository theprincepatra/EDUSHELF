const sendOtpBtn=document.getElementById("sendOtp");
const verifyOtpBtn=document.getElementById("verifyOtp");
const resetBtn=document.querySelector(".password-section button");

const otpSection=document.getElementById("otpSection");
const passwordSection=document.getElementById("passwordSection");

const otpInputs=document.querySelectorAll(".otp");
const timer=document.getElementById("timer");
const toggleIcons=document.querySelectorAll(".toggle");

sendOtpBtn.addEventListener("click",sendOTP);
verifyOtpBtn.addEventListener("click",verifyOTP);
resetBtn.addEventListener("click",resetPassword);

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
        alert("Please enter your registered email.");
        return;
    }

    try{
        const response=await fetch("/forgot-password/send-otp",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({email})
        });

        const result=await response.json();

        alert(result.message);

        if(result.success){
            otpSection.style.display="block";
            sendOtpBtn.disabled=true;
            sendOtpBtn.innerText="OTP Sent";
            startTimer();
            otpInputs[0].focus();
        }

    }catch(err){
        console.log(err);
        alert("Server Error");
    }
}

async function verifyOTP(){
    const email=document.getElementById("email").value.trim();

    let otp="";

    otpInputs.forEach(input=>{
        otp+=input.value;
    });

    if(otp.length!=6){
        alert("Please enter complete OTP.");
        return;
    }

    try{
        const response=await fetch("/forgot-password/verify-otp",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email,
                otp
            })
        });

        const result=await response.json();

        alert(result.message);

        if(result.success){
            passwordSection.style.display="block";
            passwordSection.scrollIntoView({
                behavior:"smooth"
            });
        }

    }catch(err){
        console.log(err);
        alert("Server Error");
    }
}

async function resetPassword(e){
    e.preventDefault();

    const email=document.getElementById("email").value.trim();
    const password=document.querySelectorAll(".password-section input")[0].value;
    const confirmPassword=document.querySelectorAll(".password-section input")[1].value;

    if(password.length<8){
        alert("Password must be at least 8 characters.");
        return;
    }

    if(password!==confirmPassword){
        alert("Passwords do not match.");
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

        alert(result.message);

        if(result.success){
            window.location.href="/login";
        }

    }catch(err){
        console.log(err);
        alert("Server Error");
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
            sendOtpBtn.innerText="Resend OTP";
        }

    },1000);
}