// Function to load and display favorites
function loadFavorites() {
  chrome.storage.local.get(["favorites"], function (result) {
    const favorites = result.favorites || [];
    const favoritesGrid = document.getElementById("favorites-grid");
    favoritesGrid.innerHTML = "";

    favorites.forEach((favorite, index) => {
      const favoriteElement = document.createElement("div");
      const slicedTitle = favorite.title.slice(0, 15);
      favoriteElement.className = "favorite-item";
      favoriteElement.innerHTML = `
        <img src="${favorite.icon || "icons/icon128.png"}" alt="${favorite.title}">
        <span>${slicedTitle}</span>
      `;
      favoriteElement.addEventListener("click", () => {
        window.location.href = favorite.url; // Open in the same tab
      });
      favoritesGrid.appendChild(favoriteElement);
    });
  });
}



function loadTopSites() {
  if (!chrome.topSites) {
    console.error("chrome.topSites API not available");
    return;
  }

  try {
    chrome.topSites.get(function (sites) {
      console.log("Top sites:", sites); 

      const topSitesGrid = document.getElementById("topsites-grid");
      if (!topSitesGrid) {
        console.error("topsites-grid element not found");
        return;
      }

      topSitesGrid.innerHTML = "";

      if (!sites || sites.length === 0) {
        console.log("No top sites found");
        topSitesGrid.innerHTML =
          '<div class="topsite-item">No top sites available</div>';
        return;
      }

      sites.slice(0, 8).forEach((site) => {
        const siteElement = document.createElement("div");
        const slicedTitle = site.title?.slice(0, 15) || "No title";
        siteElement.className = "topsite-item";

        // Get favicon from Google's favicon service
        const favicon = `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(
          site.url
        )}`;

        siteElement.innerHTML = `
          <img src="${favicon}" alt="${slicedTitle}">
          <span>${slicedTitle}</span>
        `;

        siteElement.addEventListener("click", () => {
          window.location.href = site.url; // Open in the same tab
        });

        topSitesGrid.appendChild(siteElement);
      });
    });
  } catch (error) {
    console.error("Error loading top sites:", error);
  }
}

// Get the canvas element and its context
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

// Initialize variables
let w, h, particles;
let particleDistance = 40;
let mouse = {
  x: undefined,
  y: undefined,
  radius: 100,
};

// Initialize the canvas and start the animation loop
function init() {
  resizeReset();
  animationLoop();
  loadFavorites();
  loadTopSites(); // Verify this line is present
  updateClock(); // Add this line
  setInterval(updateClock, 1000); // Add this line
}

// Reset canvas size and create particles
function resizeReset() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;

  particles = [];
  for (let y = 0; y <= h + particleDistance; y += particleDistance) {
    for (let x = 0; x <= w + particleDistance; x += particleDistance) {
      particles.push(new Particle(x, y));
    }
  }
}

// Main animation loop
function animationLoop() {
  ctx.clearRect(0, 0, w, h); 
  drawScene(); 
  requestAnimationFrame(animationLoop); 
}

// Draw all particles and lines connecting them
function drawScene() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw(); 
  }
  drawLine(); 
}

// Draw lines between particles if they are close enough
function drawLine() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < particleDistance * 1.5) {
        opacity = 1 - distance / (particleDistance * 1.5);
        ctx.strokeStyle = "rgba(255,255,255," + opacity + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

// Update mouse position on mouse move
function mousemove(e) {
  mouse.x = e.x;
  mouse.y = e.y;
}

// Reset mouse position on mouse out
function mouseout() {
  mouse.x = undefined;
  mouse.y = undefined;
}

// Particle class to create and update particles
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 4;
    this.baseX = this.x;
    this.baseY = this.y;
    this.speed = Math.random() * 25 + 1;
  }
  draw() {
    ctx.fillStyle = "rgba(36, 162, 197, 0.66)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  update() {
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance; // 0 ~ 1
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let directionX = forceDirectionX * force * this.speed;
    let directionY = forceDirectionY * force * this.speed;

    if (distance < mouse.radius) {
      this.x -= directionX;
      this.y -= directionY;
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
    }
  }
}

// Initialize the canvas and add event listeners
init();
window.addEventListener("resize", resizeReset);
window.addEventListener("mousemove", mousemove);
window.addEventListener("mouseout", mouseout);


// Clock function
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
  const date = now.toLocaleDateString(undefined, {
    // year: 'numeric',
    month: "long",
    day: "numeric",
  });

  document.querySelector(".time").textContent = time;
  document.querySelector(".day-name").textContent = dayName;
  document.querySelector(".date").textContent = date;
}

// Initialize the canvas and add event listeners
init();
window.addEventListener("resize", resizeReset);
window.addEventListener("mousemove", mousemove);
window.addEventListener("mouseout", mouseout);
