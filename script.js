let players = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentSort = { column: "rank", ascending: true };
let searchQuery = "";

const avatarStyles = [
  "adventurer", "micah", "gridy", "identicon", "initials", "bottts",
  "avataaars", "big-ears", "big-smile", "fun-emoji", "lorelei", "male",
  "female", "thumbs", "pixel-art", "open-peeps", "miniavs", "personas",
  "pixel-art-neutral", "adventurer-neutral", "identicon-neutral",
  "gridy-neutral", "bottts-neutral", "pixel-art-sprites"
];

document.addEventListener("DOMContentLoaded", () => {
  fetch("players.json")
    .then(res => res.json())
    .then(data => {
      players = data.map((p, i) => ({
        rank: i + 1,
        avatar: getRandomAvatar(p.firstName, p.lastName, p.photo),
        firstName: p.firstName || "Unknown",
        lastName: p.lastName || "Player",
        score: p.score || 0,
        level: p.level || 1,
        joinDate: p.joinDate || "N/A",
        country: p.country || "Unknown"
      }));
      renderTable();
      setupSorting();
      setupPagination();
      setupSearch();
    });
});

function getRandomAvatar(firstName, lastName, fixedPhoto = null) {
  if (fixedPhoto) return fixedPhoto;
  const style = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
  const seed = firstName && lastName ? firstName + lastName : "default";
  return `https://api.dicebear.com/6.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

function renderTable() {
  const tbody = document.querySelector("#leaderboard tbody");
  tbody.innerHTML = "";

  let filteredPlayers = players.filter(p =>
    p.firstName.toLowerCase().includes(searchQuery) ||
    p.lastName.toLowerCase().includes(searchQuery) ||
    p.country.toLowerCase().includes(searchQuery)
  );

  let sortedPlayers = [...filteredPlayers];
  const { column, ascending } = currentSort;
  if (column) {
    sortedPlayers.sort((a, b) => {
      if (a[column] < b[column]) return ascending ? -1 : 1;
      if (a[column] > b[column]) return ascending ? 1 : -1;
      return 0;
    });
  }

  const start = (currentPage - 1) * rowsPerPage;
  const paginatedPlayers = sortedPlayers.slice(start, start + rowsPerPage);

  paginatedPlayers.forEach(player => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Rank">${player.rank}</td>
      <td data-label="Avatar"><img class="avatar" src="${player.avatar}" alt="Avatar" /></td>
      <td data-label="First Name">${player.firstName}</td>
      <td data-label="Last Name">${player.lastName}</td>
      <td data-label="Score">${player.score}</td>
      <td data-label="Level">${player.level}</td>
      <td data-label="Join Date">${player.joinDate}</td>
      <td data-label="Country">${player.country}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${Math.ceil(filteredPlayers.length / rowsPerPage)}`;
}

function setupSorting() {
  document.querySelectorAll("#leaderboard th[data-column]").forEach(header => {
    header.addEventListener("click", () => {
      const column = header.dataset.column;
      if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
      } else {
        currentSort.column = column;
        currentSort.ascending = true;
      }
      renderTable();
    });
  });
}

function setupPagination() {
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentPage < Math.ceil(players.length / rowsPerPage)) {
      currentPage++;
      renderTable();
    }
  });
}

function setupSearch() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    currentPage = 1;
    renderTable();
  });
}
