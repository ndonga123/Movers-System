function login(){
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if(u === "admin" && p === "1234"){
    localStorage.setItem("auth","true");
    location.href = "dashboard.html";
  } else {
    document.getElementById("msg").innerText = "Invalid login";
  }
}
