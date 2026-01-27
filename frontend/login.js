const API_BASE = "http://localhost:5000/api";
// After deployment, change to your Render backend URL
// const API_BASE = "https://your-render-backend.onrender.com/api";

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("email").value; 
  // keep your input id as "email" if you want
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.msg || "Login failed";
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";

  } catch (err) {
    errorMsg.textContent = "Server error, try again later";
    console.error(err);
  }
});
