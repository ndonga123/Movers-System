if(!localStorage.getItem("auth")){
  location.href = "login.html";
}

function toggleDark(){
  document.body.classList.toggle("dark");
}
