// main.js — handles theme, loader, upload preview, charts, compare, simple interactions

document.addEventListener("DOMContentLoaded", ()=> {
  // Theme toggle (slider)
  const toggle = document.querySelectorAll("#themeToggle");
  toggle.forEach(t=>{
    initTheme(t);
    t.addEventListener("change", ()=> applyTheme(t.checked));
  });

  // helper to init theme status
  function initTheme(el){
    const saved = localStorage.getItem("mentorace-theme");
    if(saved === "dark") {
      document.body.classList.add("dark");
      el.checked = true;
    } else {
      document.body.classList.remove("dark");
      el.checked = false;
    }
  }
  function applyTheme(dark){
    if(dark) { document.body.classList.add("dark"); localStorage.setItem("mentorace-theme","dark"); }
    else { document.body.classList.remove("dark"); localStorage.setItem("mentorace-theme","light"); }
  }

  // loader utility
  window.showLoader = function(){
    const l = document.getElementById("loader");
    if(l) l.classList.remove("hidden");
  }
  window.hideLoader = function(){
    const l = document.getElementById("loader");
    if(l) l.classList.add("hidden");
  }

  // Upload preview & simple front-end "analysis" simulation
  const videoInput = document.getElementById("videoInput");
  const fileDrop = document.getElementById("fileDrop");
  const previewCard = document.getElementById("previewCard");
  const previewVideo = document.getElementById("previewVideo");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const uploadStatus = document.getElementById("uploadStatus");
  const clearBtn = document.getElementById("clearBtn");

  // Function to handle file selection
  function handleFileSelect(file) {
    if(!file) return;
    if(!file.type.startsWith('video/')) {
      alert("Please select a video file");
      return;
    }
    
    // Create preview
    if(previewVideo) {
      // Revoke old URL if exists
      if(previewVideo.src && previewVideo.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewVideo.src);
      }
      previewVideo.src = URL.createObjectURL(file);
    }
    
    if(previewCard) {
      previewCard.style.display = "block";
    }
    
    if(uploadStatus) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      uploadStatus.textContent = `✓ Ready: ${file.name} (${fileSizeMB} MB)`;
      uploadStatus.style.color = "green";
    }
  }

  if(fileDrop && videoInput){
    // Style the input to be invisible but cover the entire label area
    videoInput.style.position = "absolute";
    videoInput.style.top = "0";
    videoInput.style.left = "0";
    videoInput.style.width = "100%";
    videoInput.style.height = "100%";
    videoInput.style.opacity = "0";
    videoInput.style.cursor = "pointer";
    videoInput.style.zIndex = "2";
    
    // Make sure the text doesn't interfere with clicks
    const fileDropText = fileDrop.querySelector('.file-drop-text');
    if(fileDropText) {
      fileDropText.style.pointerEvents = "none";
      fileDropText.style.position = "relative";
      fileDropText.style.zIndex = "1";
    }
    
    // Click handler for file drop area (backup in case input doesn't work)
    fileDrop.addEventListener("click", (e)=>{
      // Only trigger if not clicking directly on input
      if(e.target !== videoInput && e.target !== fileDropText) {
        e.preventDefault();
        e.stopPropagation();
        videoInput.click();
      }
    });
    
    // File input change handler
    videoInput.addEventListener("change", (e)=>{
      const file = e.target.files[0];
      handleFileSelect(file);
    });
    
    // Drag and drop handlers
    fileDrop.addEventListener("dragover", (e)=>{
      e.preventDefault();
      e.stopPropagation();
      fileDrop.style.borderColor = "#4CAF50";
      fileDrop.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
    });
    
    fileDrop.addEventListener("dragleave", (e)=>{
      e.preventDefault();
      e.stopPropagation();
      fileDrop.style.borderColor = "";
      fileDrop.style.backgroundColor = "";
    });
    
    fileDrop.addEventListener("drop", (e)=>{
      e.preventDefault();
      e.stopPropagation();
      fileDrop.style.borderColor = "";
      fileDrop.style.backgroundColor = "";
      
      const files = e.dataTransfer.files;
      if(files.length > 0) {
        const file = files[0];
        if(file.type.startsWith('video/')) {
          // Set the file to the input
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          videoInput.files = dataTransfer.files;
          handleFileSelect(file);
        } else {
          alert("Please drop a video file");
        }
      }
    });
    
    // Debug: Log when input is clicked
    videoInput.addEventListener("click", (e)=>{
      console.log("File input clicked");
    });
  } else {
    console.error("File input elements not found:", {fileDrop, videoInput});
  }

  if(clearBtn){
    clearBtn.addEventListener("click", ()=>{
      if(videoInput) { videoInput.value = ""; previewVideo.src = ""; previewCard.style.display="none"; uploadStatus.textContent = ""; }
    });
  }

  if(analyzeBtn){
    analyzeBtn.addEventListener("click", async ()=>{
      if(!videoInput || !videoInput.files[0]) { 
        alert("Select a video first"); 
        return; 
      }
      
      showLoader();
      uploadStatus.textContent = "Uploading and analyzing video...";
      
      try {
        const formData = new FormData();
        formData.append("video", videoInput.files[0]);
        formData.append("mentor_id", "1");
        
        const response = await fetch("/mentor/evaluate", {
          method: "POST",
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          hideLoader();
          uploadStatus.textContent = `✓ Upload complete! Overall score: ${data.overall}/100. Check Evaluation page.`;
          uploadStatus.style.color = "green";
          
          // Store results in sessionStorage for evaluation page
          sessionStorage.setItem("evaluationData", JSON.stringify(data));
          
          // Optionally redirect after 2 seconds
          setTimeout(() => {
            window.location.href = "/evaluation";
          }, 2000);
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (error) {
        hideLoader();
        uploadStatus.textContent = `✗ Error: ${error.message}`;
        uploadStatus.style.color = "red";
        console.error("Upload error:", error);
      }
    });
  }

  // If page has metricBars canvas, create a bar chart (evaluation)
  const metricCanvas = document.getElementById("metricBars");
  if(metricCanvas){
    const ctx = metricCanvas.getContext("2d");
    const labels = ['Clarity','Engagement','Pacing','Depth','Interaction'];
    const data = [82, 74, 78, 88, 70];
    new Chart(ctx,{
      type:'bar',
      data:{ labels, datasets:[{ label:'Score', data, backgroundColor: labels.map((l,i)=> `rgba(255, 182, 160, ${0.6 - i*0.06})`), borderRadius:8 }]},
      options:{ responsive:true, plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, max:100, grid:{color:'rgba(0,0,0,0.04)'} } } }
    });

    // overall score circle
    const overall = Math.round(data.reduce((a,b)=>a+b,0)/data.length);
    const overallEl = document.getElementById("overallScore");
    if(overallEl) overallEl.textContent = overall;
    // strengths list example
    const sList = document.getElementById("strengthList");
    if(sList) { sList.innerHTML = "<li>Clear structure</li><li>Good technical depth</li>"; }
  }

  // Dashboard charts
  const scoreBar = document.getElementById("scoreBar");
  if(scoreBar){
    const ctx = scoreBar.getContext("2d");
    new Chart(ctx,{
      type:'bar',
      data:{ labels:['M-A','M-B','M-C','M-D','M-E'], datasets:[{ label:'Overall', data:[78,89,74,82,69], backgroundColor:['#FAD6CB','#F7C6B6','#F3B49A','#E8A389','#E69E86']} ]},
      options:{responsive:true, plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, max:100}}}
    });
  }

  const trendChart = document.getElementById("trendChart");
  if(trendChart){
    new Chart(trendChart.getContext("2d"),{
      type:'line',
      data:{ labels:['W1','W2','W3','W4','W5'], datasets:[{ label:'Avg Score', data:[70,72,75,78,80], fill:true, backgroundColor:'rgba(250,220,215,0.4)', borderColor:'rgba(255,160,140,0.9)'}]},
      options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, max:100}}}
    });
  }

  // Radar chart
  const radarCanvas = document.getElementById("radarChart");
  if(radarCanvas){
    new Chart(radarCanvas.getContext("2d"),{
      type:'radar',
      data:{ labels:['Clarity','Engagement','Pacing','Depth','Interaction'], datasets:[{ label:'Mentor A', data:[82,74,78,88,70], backgroundColor:'rgba(255,182,160,0.35)', borderColor:'#F7C6B6'}]},
      options:{scales:{r:{beginAtZero:true, max:100}}}
    });
  }

  // Comparison logic — real video upload and processing
  const compareBtn = document.getElementById("compareBtn");
  const m1Input = document.getElementById("m1");
  const m2Input = document.getElementById("m2");
  
  // Setup file selection for compare page inputs
  if(m1Input && m2Input) {
    // Style the inputs to be invisible but clickable
    [m1Input, m2Input].forEach(input => {
      input.style.position = "absolute";
      input.style.top = "0";
      input.style.left = "0";
      input.style.width = "100%";
      input.style.height = "100%";
      input.style.opacity = "0";
      input.style.cursor = "pointer";
      input.style.zIndex = "2";
      
      // Make parent label clickable
      const label = input.closest('label');
      if(label) {
        label.style.position = "relative";
        label.style.cursor = "pointer";
        
        // Add change handler to show file name
        input.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if(file) {
            const textDiv = label.querySelector('div');
            if(textDiv) {
              textDiv.textContent = `✓ ${file.name}`;
              textDiv.style.color = "green";
            }
          }
        });
      }
    });
  }
  
  if(compareBtn){
    compareBtn.addEventListener("click", async ()=>{
      const m1 = m1Input?.files[0];
      const m2 = m2Input?.files[0];
      
      if(!m1 || !m2){ 
        alert("Please upload both mentor videos first"); 
        return; 
      }
      
      if(!m1.type.startsWith('video/') || !m2.type.startsWith('video/')) {
        alert("Please select video files");
        return;
      }
      
      showLoader();
      const statusEl = document.getElementById("compareStatus");
      if(statusEl) {
        statusEl.textContent = "Uploading and analyzing videos...";
        statusEl.style.color = "blue";
      }
      
      try {
        const formData = new FormData();
        formData.append("mentor1", m1);
        formData.append("mentor2", m2);
        
        const response = await fetch("/institution/compare", {
          method: "POST",
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          hideLoader();
          
          if(statusEl) {
            statusEl.textContent = `✓ Comparison complete! ${data.better === "A" ? "Mentor A" : "Mentor B"} scored higher.`;
            statusEl.style.color = "green";
          }
          
          // Show results
          const resultDiv = document.getElementById("comparisonResult");
          if(resultDiv) {
            resultDiv.style.display = "block";
          }
          
          // Display scores
          const m1ScoreEl = document.getElementById("m1Score");
          const m2ScoreEl = document.getElementById("m2Score");
          if(m1ScoreEl) m1ScoreEl.textContent = `${data.mentorA_score} / 100`;
          if(m2ScoreEl) m2ScoreEl.textContent = `${data.mentorB_score} / 100`;
          
          // Create comparison chart
          const ctx = document.getElementById("compareChart");
          if(ctx) {
            if(window._compareChart) window._compareChart.destroy();
            
            const metrics = ['clarity', 'depth', 'engagement', 'pacing'];
            const mentorAData = metrics.map(m => data.mentorA_metrics[m] || 0);
            const mentorBData = metrics.map(m => data.mentorB_metrics[m] || 0);
            
            window._compareChart = new Chart(ctx.getContext("2d"), {
              type: 'bar',
              data: {
                labels: metrics.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
                datasets: [
                  {
                    label: 'Mentor A',
                    data: mentorAData,
                    backgroundColor: 'rgba(255, 182, 160, 0.8)'
                  },
                  {
                    label: 'Mentor B',
                    data: mentorBData,
                    backgroundColor: 'rgba(167, 183, 224, 0.9)'
                  }
                ]
              },
              options: {
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }
            });
          }
        } else {
          throw new Error(data.error || "Comparison failed");
        }
      } catch (error) {
        hideLoader();
        if(statusEl) {
          statusEl.textContent = `✗ Error: ${error.message}`;
          statusEl.style.color = "red";
        }
        alert(`Error: ${error.message}`);
        console.error("Compare error:", error);
      }
    });
  }

  // Login handler
  const loginForm = document.getElementById("loginForm");
  if(loginForm){
    loginForm.addEventListener("submit", async (e)=>{
      e.preventDefault();
      showLoader();
      
      try {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store user info
          localStorage.setItem("user", JSON.stringify({ email, role: data.role }));
          hideLoader();
          // Redirect to dashboard
          window.location.href = "/dashboard";
        } else {
          throw new Error(data.error || "Login failed");
        }
      } catch (error) {
        hideLoader();
        alert(`Login failed: ${error.message}`);
        console.error("Login error:", error);
      }
    });
  }
  
  // Signup handler
  const signupForm = document.getElementById("signupForm");
  if(signupForm){
    signupForm.addEventListener("submit", async (e)=>{
      e.preventDefault();
      showLoader();
      
      try {
        const name = document.getElementById("signupName").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        const role = document.getElementById("signupRole").value;
        
        const response = await fetch("/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store user info
          localStorage.setItem("user", JSON.stringify({ email, role }));
          hideLoader();
          alert("Account created successfully!");
          // Redirect to dashboard
          window.location.href = "/dashboard";
        } else {
          throw new Error(data.error || "Signup failed");
        }
      } catch (error) {
        hideLoader();
        alert(`Signup failed: ${error.message}`);
        console.error("Signup error:", error);
      }
    });
  }
  
  // Logout handler
  const logoutBtn = document.getElementById("logoutBtn");
  if(logoutBtn){
    logoutBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.href = "/";
    });
  }
  
  // Check authentication on protected pages
  const currentPath = window.location.pathname;
  const protectedPages = ["/dashboard", "/upload_video", "/compare", "/evaluation"];
  const isProtectedPage = protectedPages.some(page => currentPath === page || currentPath.startsWith(page + "/"));
  
  if(isProtectedPage) {
    const user = localStorage.getItem("user");
    if(!user) {
      window.location.href = "/login";
      return; // Stop execution if redirecting
    } else {
      // Show logout button
      const logoutBtn = document.getElementById("logoutBtn");
      if(logoutBtn) logoutBtn.style.display = "block";
    }
  }
  
  // Redirect authenticated users away from login/signup
  if(currentPath === "/login" || currentPath === "/signup") {
    const user = localStorage.getItem("user");
    if(user) {
      window.location.href = "/dashboard";
      return; // Stop execution if redirecting
    }
  }
});
// Dark mode toggle
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("themeToggle");

    toggle.addEventListener("change", () => {
        document.body.classList.toggle("dark", toggle.checked);
    });
});
// Fetch REAL evaluation data
async function loadEvaluation() {
  if (!location.pathname.includes("evaluation")) return;

  const res = await fetch("/api/evaluation-data");
  const data = await res.json();

  document.getElementById("overallScore").textContent = data.overall_score;
  document.getElementById("explainText").textContent = data.explanation;

  // Strengths
  const list = document.getElementById("strengthList");
  list.innerHTML = "";
  data.strengths.forEach(s => {
    list.innerHTML += `<li>${s}</li>`;
  });

  // Metrics chart
  new Chart(document.getElementById("metricBars"), {
    type: "bar",
    data: {
      labels: Object.keys(data.metrics),
      datasets: [{
        data: Object.values(data.metrics)
      }]
    }
  });
}

// Fetch REAL dashboard data
async function loadDashboard() {
  if (!location.pathname.includes("dashboard")) return;

  const res = await fetch("/api/dashboard-data");
  const data = await res.json();

  document.getElementById("avgScore").textContent = data.avg_score;
  document.getElementById("topMentor").textContent = data.top_mentor.name;
  document.getElementById("topMentorReason").textContent = data.top_mentor.reason;

  // Weak areas
  const weak = document.getElementById("weakAreas");
  weak.innerHTML = "";
  data.weak_areas.forEach(w => weak.innerHTML += `<li>${w}</li>`);

  // Trend chart
  new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: data.trend.labels,
      datasets: [{ data: data.trend.values }]
    }
  });

  // Score distribution bar chart
  new Chart(document.getElementById("scoreBar"), {
    type: "bar",
    data: {
      labels: data.score_distribution.labels,
      datasets: [{ data: data.score_distribution.values }]
    }
  });

  // Radar chart
  new Chart(document.getElementById("radarChart"), {
    type: "radar",
    data: {
      labels: Object.keys(data.metric_breakdown),
      datasets: [{
        data: Object.values(data.metric_breakdown)
      }]
    }
  });
}

loadEvaluation();
loadDashboard();
