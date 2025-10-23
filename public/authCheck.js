fetch("/api/me", { credentials: "include" })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById("userId").textContent = data.userId;
    } else {
      location.href = "/9_마라탕공주들_login.html";
    }
  })
  .catch(err => {
    console.error(err);
    location.href = "/9_마라탕공주들_login.html";
  });